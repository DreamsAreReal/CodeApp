using System.Security.Cryptography;
using System.Text;

namespace Codex.Backend.Tests;

/// <summary>
/// Regression tests for the initData HMAC. Telegram computes `hash` over ALL received
/// fields except `hash` — INCLUDING the newer `signature` (Ed25519) field. An earlier
/// version excluded `signature`, which made every real Telegram login fail with 401.
/// Verified against a real captured payload; these lock the behavior in.
/// </summary>
public sealed class TelegramAuthTests
{
    private const string Token = "123456:TEST-bot-token";

    /// Sign like Telegram does: HMAC over every field except `hash` (signature included).
    private static string Sign(IDictionary<string, string> fields, string token)
    {
        var sorted = new SortedDictionary<string, string>(fields, StringComparer.Ordinal);
        string dcs = string.Join('\n', sorted.Select(kv => $"{kv.Key}={kv.Value}"));
        byte[] secret = HMACSHA256.HashData(Encoding.UTF8.GetBytes("WebAppData"), Encoding.UTF8.GetBytes(token));
        string hash = Convert.ToHexStringLower(HMACSHA256.HashData(secret, Encoding.UTF8.GetBytes(dcs)));
        var query = sorted.Select(kv => $"{Uri.EscapeDataString(kv.Key)}={Uri.EscapeDataString(kv.Value)}");
        return string.Join('&', query) + "&hash=" + hash;
    }

    [Fact]
    public void InitData_WithSignatureField_ValidatesWhenSignatureIsPartOfHmac()
    {
        var fields = new Dictionary<string, string>
        {
            ["auth_date"] = DateTimeOffset.UtcNow.ToUnixTimeSeconds().ToString(),
            ["query_id"] = "AAtest",
            ["user"] = "{\"id\":618483287,\"first_name\":\"Alexander\",\"username\":\"grobozvon\"}",
            ["signature"] = "YCGv9YwhktZ-dummy-ed25519-third-party-signature_value",
        };

        var res = TelegramAuth.Validate(Sign(fields, Token), Token, TimeSpan.FromHours(24));

        Assert.True(res.Ok, res.Error);
        Assert.Equal(618483287, res.UserId);
    }

    [Fact]
    public void InitData_SignedWithWrongToken_IsRejected()
    {
        var fields = new Dictionary<string, string>
        {
            ["auth_date"] = DateTimeOffset.UtcNow.ToUnixTimeSeconds().ToString(),
            ["user"] = "{\"id\":1,\"first_name\":\"X\"}",
            ["signature"] = "sig",
        };

        var res = TelegramAuth.Validate(Sign(fields, "999:OTHER-token"), Token, TimeSpan.FromHours(24));

        Assert.False(res.Ok);
    }
}
