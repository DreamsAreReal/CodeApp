using System.Security.Cryptography;
using System.Text;
using System.Text.Json;

namespace Codex.Backend;

public sealed record InitDataResult(bool Ok, long UserId, string? Error);

/// <summary>
/// Telegram Mini App initData validation (HMAC-SHA256), per core.telegram.org/bots/webapps.
/// Algorithm:
///   1. data_check_string = all fields except `hash` (and `signature`), sorted by key,
///      joined as "key=value" with '\n'.
///   2. secret_key = HMAC_SHA256(key="WebAppData", data=bot_token).
///   3. check_hash = HMAC_SHA256(key=secret_key, data=data_check_string).
///   4. constant-time compare check_hash == received hash; then verify auth_date freshness.
/// initDataUnsafe is never trusted; only the HMAC-verified string yields a user id.
/// </summary>
public static class TelegramAuth
{
    public static InitDataResult Validate(string initData, string botToken, TimeSpan? maxAge)
    {
        if (string.IsNullOrWhiteSpace(initData))
            return new InitDataResult(false, 0, Strings.MissingInitData);

        var fields = new SortedDictionary<string, string>(StringComparer.Ordinal);
        string? receivedHash = null;
        foreach (var part in initData.Split('&', StringSplitOptions.RemoveEmptyEntries))
        {
            int eq = part.IndexOf('=');
            if (eq < 0) continue;
            string key = Uri.UnescapeDataString(part[..eq]);
            string value = Uri.UnescapeDataString(part[(eq + 1)..]);
            if (key == "hash") { receivedHash = value; continue; }
            if (key == "signature") continue; // Ed25519 third-party field, excluded from HMAC check
            fields[key] = value;
        }

        if (receivedHash is null)
            return new InitDataResult(false, 0, Strings.InvalidInitData);

        string dataCheckString = string.Join('\n', fields.Select(kv => $"{kv.Key}={kv.Value}"));

        byte[] secretKey = HMACSHA256.HashData(
            Encoding.UTF8.GetBytes("WebAppData"), Encoding.UTF8.GetBytes(botToken));
        byte[] checkHash = HMACSHA256.HashData(
            secretKey, Encoding.UTF8.GetBytes(dataCheckString));

        byte[] receivedBytes;
        try { receivedBytes = Convert.FromHexString(receivedHash); }
        catch { return new InitDataResult(false, 0, Strings.InvalidInitData); }

        if (!CryptographicOperations.FixedTimeEquals(checkHash, receivedBytes))
            return new InitDataResult(false, 0, Strings.InvalidInitData);

        // Freshness (anti-replay).
        if (maxAge is { } age && fields.TryGetValue("auth_date", out var authRaw)
            && long.TryParse(authRaw, out var authUnix))
        {
            var authTime = DateTimeOffset.FromUnixTimeSeconds(authUnix);
            if (DateTimeOffset.UtcNow - authTime > age)
                return new InitDataResult(false, 0, Strings.AuthDateExpired);
        }

        if (!fields.TryGetValue("user", out var userJson))
            return new InitDataResult(false, 0, Strings.InvalidInitData);

        long userId;
        try
        {
            using var doc = JsonDocument.Parse(userJson);
            userId = doc.RootElement.GetProperty("id").GetInt64();
        }
        catch { return new InitDataResult(false, 0, Strings.InvalidInitData); }

        return new InitDataResult(true, userId, null);
    }

    /// <summary>
    /// Dev-only: build a genuinely-signed initData string using the real HMAC algorithm,
    /// so local curl tests exercise the true validation path without a live Telegram client.
    /// </summary>
    public static string SignInitData(long userId, string botToken, DateTimeOffset? authDate = null)
    {
        long unix = (authDate ?? DateTimeOffset.UtcNow).ToUnixTimeSeconds();
        string userJson = $"{{\"id\":{userId},\"first_name\":\"Dev\",\"username\":\"dev_user\"}}";

        var fields = new SortedDictionary<string, string>(StringComparer.Ordinal)
        {
            ["auth_date"] = unix.ToString(),
            ["query_id"] = "AAF-dev-" + userId,
            ["user"] = userJson,
        };
        string dataCheckString = string.Join('\n', fields.Select(kv => $"{kv.Key}={kv.Value}"));

        byte[] secretKey = HMACSHA256.HashData(
            Encoding.UTF8.GetBytes("WebAppData"), Encoding.UTF8.GetBytes(botToken));
        string hash = Convert.ToHexStringLower(
            HMACSHA256.HashData(secretKey, Encoding.UTF8.GetBytes(dataCheckString)));

        var query = fields.Select(kv =>
            $"{Uri.EscapeDataString(kv.Key)}={Uri.EscapeDataString(kv.Value)}");
        return string.Join('&', query) + "&hash=" + hash;
    }
}
