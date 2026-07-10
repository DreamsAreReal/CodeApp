using System.Security.Cryptography;
using System.Text;

namespace Codex.Backend;

/// <summary>
/// Stateless, signed session token minted at /api/auth over the verified Telegram id.
///
/// Shape: <c>base64url(tgId) "." base64url(expiryUnix) "." hexHMACSHA256(secret, "tgId.expiry")</c>
/// where tgId/expiryUnix are the ASCII-decimal representations. The token is self-contained
/// (no server-side session store) and tamper-evident: the HMAC binds the tgId to the expiry,
/// so a client cannot forge another user's id or extend its own lifetime.
///
/// The signing secret is <c>Auth:SessionSecret</c> if set; otherwise it is derived
/// deterministically from the bot token (HMAC("codex-session-secret-v1", botToken)) so it is
/// STABLE across process restarts / redeploys — tokens must not die when the box reboots.
/// </summary>
public sealed class SessionTokenService
{
    /// <summary>Default session lifetime: 7 days.</summary>
    public static readonly TimeSpan DefaultLifetime = TimeSpan.FromDays(7);

    private readonly byte[] _secret;
    private readonly TimeProvider _clock;

    public SessionTokenService(string? configuredSecret, string botToken, TimeProvider clock)
    {
        _clock = clock;
        _secret = !string.IsNullOrEmpty(configuredSecret)
            ? Encoding.UTF8.GetBytes(configuredSecret)
            // Derive a stable secret from the bot token. Same input -> same key across restarts,
            // so already-issued tokens keep verifying after a redeploy.
            : HMACSHA256.HashData(
                Encoding.UTF8.GetBytes("codex-session-secret-v1"),
                Encoding.UTF8.GetBytes(botToken));
    }

    /// <summary>Mint a token for <paramref name="tgId"/> expiring after <paramref name="lifetime"/>.</summary>
    public (string Token, DateTimeOffset ExpiresAt) Issue(long tgId, TimeSpan? lifetime = null)
    {
        var expiresAt = _clock.GetUtcNow() + (lifetime ?? DefaultLifetime);
        long expiryUnix = expiresAt.ToUnixTimeSeconds();
        string payload = $"{tgId}.{expiryUnix}";
        string sig = Convert.ToHexStringLower(
            HMACSHA256.HashData(_secret, Encoding.UTF8.GetBytes(payload)));
        string token = $"{B64(tgId.ToString())}.{B64(expiryUnix.ToString())}.{sig}";
        return (token, expiresAt);
    }

    /// <summary>
    /// Validate a token: parse, recompute the HMAC, constant-time compare, and check expiry.
    /// Returns the tgId on success. Any structural, signature, or expiry failure -> null.
    /// </summary>
    public long? Validate(string? token)
    {
        if (string.IsNullOrEmpty(token)) return null;

        var parts = token.Split('.');
        if (parts.Length != 3) return null;

        string tgIdStr, expiryStr;
        try
        {
            tgIdStr = UnB64(parts[0]);
            expiryStr = UnB64(parts[1]);
        }
        catch { return null; }

        if (!long.TryParse(tgIdStr, out long tgId) || !long.TryParse(expiryStr, out long expiryUnix))
            return null;

        string payload = $"{tgId}.{expiryUnix}";
        byte[] expected = HMACSHA256.HashData(_secret, Encoding.UTF8.GetBytes(payload));

        byte[] received;
        try { received = Convert.FromHexString(parts[2]); }
        catch { return null; }

        // Constant-time compare guards against signature-timing oracles.
        if (!CryptographicOperations.FixedTimeEquals(expected, received)) return null;

        if (_clock.GetUtcNow().ToUnixTimeSeconds() >= expiryUnix) return null; // expired

        return tgId;
    }

    private static string B64(string s) =>
        Base64Url.Encode(Encoding.UTF8.GetBytes(s));

    private static string UnB64(string s) =>
        Encoding.UTF8.GetString(Base64Url.Decode(s));
}

/// <summary>Minimal URL-safe base64 (no padding), used for the token's tgId/expiry segments.</summary>
internal static class Base64Url
{
    public static string Encode(byte[] bytes) =>
        Convert.ToBase64String(bytes).TrimEnd('=').Replace('+', '-').Replace('/', '_');

    public static byte[] Decode(string s)
    {
        string b64 = s.Replace('-', '+').Replace('_', '/');
        b64 += (b64.Length % 4) switch { 2 => "==", 3 => "=", _ => "" };
        return Convert.FromBase64String(b64);
    }
}
