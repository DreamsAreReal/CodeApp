using System.Text.Encodings.Web;
using System.Text.Unicode;

namespace Codex.Backend;

/// <summary>
/// Bearer-token auth gate for the data API. Validates the stateless session token on every
/// <c>/api/*</c> request EXCEPT the public/bootstrap routes (auth, health, and the DevMode-gated
/// dev endpoints). On success the authenticated tgId is stashed in <see cref="HttpContext.Items"/>
/// under <see cref="TgIdKey"/> so handlers derive the user server-side — never from a client param.
///
/// This is the IDOR fix: with userId gone from the request surface, a caller can only ever read
/// or mutate the tgId the token was minted for.
/// </summary>
public sealed class AuthMiddleware
{
    public const string TgIdKey = "codex.tgId";

    private readonly RequestDelegate _next;
    private readonly SessionTokenService _tokens;

    // Routes that must remain reachable WITHOUT a session token.
    private static readonly string[] PublicPrefixes =
    {
        "/api/auth",
        "/api/authoring/run-csharp", // DevMode-gated inside the handler (403 in prod)
        "/api/dev/",                 // DevMode-gated inside the handler (403 in prod)
    };

    public AuthMiddleware(RequestDelegate next, SessionTokenService tokens)
    {
        _next = next;
        _tokens = tokens;
    }

    public async Task InvokeAsync(HttpContext ctx)
    {
        var path = ctx.Request.Path.Value ?? "";

        // Only the data API is gated; static files, SPA fallback, and /health* pass through.
        if (!path.StartsWith("/api/", StringComparison.Ordinal) || IsPublic(path))
        {
            await _next(ctx);
            return;
        }

        long? tgId = _tokens.Validate(ExtractBearer(ctx));
        if (tgId is null)
        {
            await WriteUnauthorized(ctx);
            return;
        }

        ctx.Items[TgIdKey] = tgId.Value;
        await _next(ctx);
    }

    private static bool IsPublic(string path)
    {
        foreach (var p in PublicPrefixes)
            if (path.StartsWith(p, StringComparison.Ordinal))
                return true;
        return false;
    }

    private static string? ExtractBearer(HttpContext ctx)
    {
        string? header = ctx.Request.Headers.Authorization;
        if (string.IsNullOrEmpty(header)) return null;
        const string prefix = "Bearer ";
        return header.StartsWith(prefix, StringComparison.OrdinalIgnoreCase)
            ? header[prefix.Length..].Trim()
            : null;
    }

    private static readonly JavaScriptEncoder Encoder = JavaScriptEncoder.Create(UnicodeRanges.All);

    private static async Task WriteUnauthorized(HttpContext ctx)
    {
        ctx.Response.StatusCode = StatusCodes.Status401Unauthorized;
        ctx.Response.ContentType = "application/json; charset=utf-8";
        await ctx.Response.WriteAsync(
            $"{{\"error\":\"{Encoder.Encode(Strings.Unauthorized)}\"}}");
    }
}

/// <summary>Typed accessor for the authenticated tgId established by <see cref="AuthMiddleware"/>.</summary>
public static class AuthContext
{
    /// <summary>The authenticated Telegram id for the current request (set by the auth gate).</summary>
    public static long TgId(this HttpContext ctx) =>
        ctx.Items[AuthMiddleware.TgIdKey] is long id
            ? id
            : throw new InvalidOperationException("No authenticated tgId on this request.");
}
