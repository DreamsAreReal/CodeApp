using Codex.Backend;
using Microsoft.Extensions.Time.Testing;

namespace Codex.Backend.Tests;

/// <summary>
/// Unit tests for the stateless session token: round-trips its own tgId, rejects tampering and
/// cross-user forgery, expires on the injected clock, and derives a STABLE secret from the bot
/// token so tokens survive a restart (no random per-boot secret).
/// </summary>
public sealed class SessionTokenTests
{
    private static SessionTokenService Service(FakeTimeProvider? clock = null, string? secret = null) =>
        new(secret, "123456789:TEST-BOT-TOKEN", clock ?? new FakeTimeProvider());

    [Fact]
    public void IssuedToken_ValidatesBackToSameTgId()
    {
        var svc = Service();
        var (token, _) = svc.Issue(12345);
        Assert.Equal(12345, svc.Validate(token));
    }

    [Fact]
    public void TamperedSignature_IsRejected()
    {
        var svc = Service();
        var (token, _) = svc.Issue(12345);
        string tampered = token[..^1] + (token[^1] == 'a' ? 'b' : 'a');
        Assert.Null(svc.Validate(tampered));
    }

    [Fact]
    public void EditingThePayloadToAnotherUser_IsRejected()
    {
        var svc = Service();
        var (token, _) = svc.Issue(111);
        var parts = token.Split('.');
        // Swap the tgId segment for another user's, keeping the original signature -> must fail.
        var (other, _) = svc.Issue(222);
        string forged = other.Split('.')[0] + "." + parts[1] + "." + parts[2];
        Assert.Null(svc.Validate(forged));
    }

    [Fact]
    public void ExpiredToken_IsRejected()
    {
        var clock = new FakeTimeProvider(new DateTimeOffset(2026, 1, 1, 0, 0, 0, TimeSpan.Zero));
        var svc = Service(clock);
        var (token, _) = svc.Issue(999, TimeSpan.FromDays(7));
        Assert.Equal(999, svc.Validate(token)); // valid now
        clock.Advance(TimeSpan.FromDays(8));     // past expiry
        Assert.Null(svc.Validate(token));
    }

    [Fact]
    public void SecretDerivedFromBotToken_IsStableAcrossInstances()
    {
        // Two independently constructed services with the SAME bot token (no explicit secret)
        // must accept each other's tokens — proving the secret is derived, not random per-boot.
        var clock = new FakeTimeProvider();
        var a = new SessionTokenService(null, "bot-token-shared", clock);
        var b = new SessionTokenService(null, "bot-token-shared", clock);
        var (token, _) = a.Issue(7);
        Assert.Equal(7, b.Validate(token));
    }

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    [InlineData("garbage")]
    [InlineData("only.two")]
    [InlineData("a.b.c.d")]
    public void MalformedTokens_AreRejected(string? token)
    {
        Assert.Null(Service().Validate(token));
    }
}
