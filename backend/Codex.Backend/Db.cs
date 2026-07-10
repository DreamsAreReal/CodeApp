using Microsoft.Data.Sqlite;

namespace Codex.Backend;

/// <summary>
/// Durable persistence on SQLite (Microsoft.Data.Sqlite). Schema is created on startup.
/// This is the server-side source of truth for FSRS schedule + append-only history —
/// it survives process restarts and is not subject to iOS WebKit IndexedDB eviction
/// (see RS-12 §3.1), which is precisely why the schedule lives on the server.
/// </summary>
public sealed class Database
{
    private readonly string _connectionString;

    public Database(string filePath)
    {
        _connectionString = new SqliteConnectionStringBuilder
        {
            DataSource = filePath,
            Mode = SqliteOpenMode.ReadWriteCreate,
            Cache = SqliteCacheMode.Shared,
        }.ToString();
    }

    private SqliteConnection Open()
    {
        var conn = new SqliteConnection(_connectionString);
        conn.Open();
        using var pragma = conn.CreateCommand();
        pragma.CommandText = "PRAGMA journal_mode=WAL; PRAGMA foreign_keys=ON;";
        pragma.ExecuteNonQuery();
        return conn;
    }

    /// <summary>Create schema if absent. Idempotent.</summary>
    public void Initialize()
    {
        using var conn = Open();
        using var cmd = conn.CreateCommand();
        cmd.CommandText = """
            CREATE TABLE IF NOT EXISTS users (
                tg_id   INTEGER PRIMARY KEY,
                created TEXT NOT NULL
            );
            CREATE TABLE IF NOT EXISTS items (
                item_id         TEXT PRIMARY KEY,
                lesson_id       TEXT NOT NULL,
                prompt          TEXT,
                expected_output TEXT
            );
            CREATE TABLE IF NOT EXISTS review_state (
                user_id     INTEGER NOT NULL,
                item_id     TEXT NOT NULL,
                difficulty  REAL NOT NULL,
                stability   REAL NOT NULL,
                due         TEXT NOT NULL,
                reps        INTEGER NOT NULL,
                lapses      INTEGER NOT NULL,
                last_review TEXT,
                PRIMARY KEY (user_id, item_id)
            );
            CREATE TABLE IF NOT EXISTS progress_events (
                id      INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                item_id TEXT NOT NULL,
                grade   INTEGER NOT NULL,
                ts      TEXT NOT NULL
            );
            CREATE INDEX IF NOT EXISTS ix_review_due ON review_state (user_id, due);
            CREATE INDEX IF NOT EXISTS ix_events_user ON progress_events (user_id, ts);
            """;
        cmd.ExecuteNonQuery();
    }

    private static string Iso(DateTimeOffset t) => t.ToUniversalTime().ToString("o");
    private static DateTimeOffset ParseIso(string s) => DateTimeOffset.Parse(s).ToUniversalTime();

    // ---- users ----

    /// <summary>Insert the user if new; return the stored (creation-stable) record.</summary>
    public User UpsertUser(long tgId)
    {
        using var conn = Open();
        using var insert = conn.CreateCommand();
        insert.CommandText =
            "INSERT INTO users (tg_id, created) VALUES ($id, $c) ON CONFLICT(tg_id) DO NOTHING;";
        insert.Parameters.AddWithValue("$id", tgId);
        insert.Parameters.AddWithValue("$c", Iso(DateTimeOffset.UtcNow));
        insert.ExecuteNonQuery();

        using var read = conn.CreateCommand();
        read.CommandText = "SELECT created FROM users WHERE tg_id = $id;";
        read.Parameters.AddWithValue("$id", tgId);
        var created = (string)read.ExecuteScalar()!;
        return new User(tgId, ParseIso(created));
    }

    // ---- items catalog ----

    public void SeedItem(Item item)
    {
        using var conn = Open();
        using var cmd = conn.CreateCommand();
        cmd.CommandText = """
            INSERT INTO items (item_id, lesson_id, prompt, expected_output)
            VALUES ($id, $lesson, $prompt, $expected)
            ON CONFLICT(item_id) DO UPDATE SET
                lesson_id = excluded.lesson_id,
                prompt = excluded.prompt,
                expected_output = excluded.expected_output;
            """;
        cmd.Parameters.AddWithValue("$id", item.ItemId);
        cmd.Parameters.AddWithValue("$lesson", item.LessonId);
        cmd.Parameters.AddWithValue("$prompt", (object?)item.Prompt ?? DBNull.Value);
        cmd.Parameters.AddWithValue("$expected", (object?)item.ExpectedOutput ?? DBNull.Value);
        cmd.ExecuteNonQuery();
    }

    public List<Item> AllItems()
    {
        using var conn = Open();
        using var cmd = conn.CreateCommand();
        cmd.CommandText = "SELECT item_id, lesson_id, prompt, expected_output FROM items ORDER BY item_id;";
        using var r = cmd.ExecuteReader();
        var list = new List<Item>();
        while (r.Read())
            list.Add(new Item(r.GetString(0), r.GetString(1),
                r.IsDBNull(2) ? null : r.GetString(2), r.IsDBNull(3) ? null : r.GetString(3)));
        return list;
    }

    // ---- review state ----

    public ReviewState? GetReviewState(long userId, string itemId)
    {
        using var conn = Open();
        using var cmd = conn.CreateCommand();
        cmd.CommandText = """
            SELECT difficulty, stability, due, reps, lapses, last_review
            FROM review_state WHERE user_id = $u AND item_id = $i;
            """;
        cmd.Parameters.AddWithValue("$u", userId);
        cmd.Parameters.AddWithValue("$i", itemId);
        using var r = cmd.ExecuteReader();
        if (!r.Read()) return null;
        return new ReviewState(userId, itemId, r.GetDouble(0), r.GetDouble(1),
            ParseIso(r.GetString(2)), r.GetInt32(3), r.GetInt32(4),
            r.IsDBNull(5) ? null : ParseIso(r.GetString(5)));
    }

    public void UpsertReviewState(ReviewState s)
    {
        using var conn = Open();
        using var cmd = conn.CreateCommand();
        cmd.CommandText = """
            INSERT INTO review_state (user_id, item_id, difficulty, stability, due, reps, lapses, last_review)
            VALUES ($u, $i, $d, $s, $due, $reps, $lapses, $last)
            ON CONFLICT(user_id, item_id) DO UPDATE SET
                difficulty = excluded.difficulty,
                stability = excluded.stability,
                due = excluded.due,
                reps = excluded.reps,
                lapses = excluded.lapses,
                last_review = excluded.last_review;
            """;
        cmd.Parameters.AddWithValue("$u", s.UserId);
        cmd.Parameters.AddWithValue("$i", s.ItemId);
        cmd.Parameters.AddWithValue("$d", s.Difficulty);
        cmd.Parameters.AddWithValue("$s", s.Stability);
        cmd.Parameters.AddWithValue("$due", Iso(s.Due));
        cmd.Parameters.AddWithValue("$reps", s.Reps);
        cmd.Parameters.AddWithValue("$lapses", s.Lapses);
        cmd.Parameters.AddWithValue("$last", s.LastReview is { } lr ? Iso(lr) : (object)DBNull.Value);
        cmd.ExecuteNonQuery();
    }

    /// <summary>
    /// Items due for review now: every catalog item whose state is due (due &lt;= now) or
    /// that the user has never seen (new items are due immediately).
    /// </summary>
    public List<DueItem> GetDue(long userId, DateTimeOffset now)
    {
        using var conn = Open();
        using var cmd = conn.CreateCommand();
        cmd.CommandText = """
            SELECT i.item_id, i.prompt, rs.stability, rs.difficulty, rs.due, rs.reps, rs.last_review
            FROM items i
            LEFT JOIN review_state rs ON rs.item_id = i.item_id AND rs.user_id = $u
            WHERE rs.item_id IS NULL OR rs.due <= $now
            ORDER BY (rs.due IS NULL) DESC, rs.due ASC, i.item_id ASC;
            """;
        cmd.Parameters.AddWithValue("$u", userId);
        cmd.Parameters.AddWithValue("$now", Iso(now));
        using var r = cmd.ExecuteReader();
        var list = new List<DueItem>();
        while (r.Read())
        {
            bool isNew = r.IsDBNull(2);
            list.Add(new DueItem(
                ItemId: r.GetString(0),
                Prompt: r.IsDBNull(1) ? null : r.GetString(1),
                IsNew: isNew,
                Stability: isNew ? null : r.GetDouble(2),
                Difficulty: isNew ? null : r.GetDouble(3),
                Due: isNew ? null : ParseIso(r.GetString(4)),
                Reps: isNew ? 0 : r.GetInt32(5),
                LastReview: r.IsDBNull(6) ? null : ParseIso(r.GetString(6))));
        }
        return list;
    }

    // ---- append-only history ----

    public void AppendProgressEvent(ProgressEvent e)
    {
        using var conn = Open();
        using var cmd = conn.CreateCommand();
        cmd.CommandText =
            "INSERT INTO progress_events (user_id, item_id, grade, ts) VALUES ($u, $i, $g, $ts);";
        cmd.Parameters.AddWithValue("$u", e.UserId);
        cmd.Parameters.AddWithValue("$i", e.ItemId);
        cmd.Parameters.AddWithValue("$g", e.Grade);
        cmd.Parameters.AddWithValue("$ts", Iso(e.Ts));
        cmd.ExecuteNonQuery();
    }

    public int CountProgressEvents(long userId)
    {
        using var conn = Open();
        using var cmd = conn.CreateCommand();
        cmd.CommandText = "SELECT COUNT(*) FROM progress_events WHERE user_id = $u;";
        cmd.Parameters.AddWithValue("$u", userId);
        return Convert.ToInt32(cmd.ExecuteScalar());
    }

    /// <summary>
    /// Durable, server-derived home stats: total reviews (append-only history)
    /// and the current daily streak (consecutive UTC days with >=1 review, ending
    /// today or yesterday). No fabricated numbers — all read from progress_events.
    /// </summary>
    public (int ReviewsTotal, int StreakDays) GetStats(long userId, DateTimeOffset now)
    {
        using var conn = Open();

        using var countCmd = conn.CreateCommand();
        countCmd.CommandText = "SELECT COUNT(*) FROM progress_events WHERE user_id = $u;";
        countCmd.Parameters.AddWithValue("$u", userId);
        int total = Convert.ToInt32(countCmd.ExecuteScalar());

        using var daysCmd = conn.CreateCommand();
        // ts is stored ISO-8601 UTC ("o"), so substr(1,10) is the yyyy-MM-dd day.
        daysCmd.CommandText =
            "SELECT DISTINCT substr(ts, 1, 10) AS d FROM progress_events WHERE user_id = $u ORDER BY d DESC;";
        daysCmd.Parameters.AddWithValue("$u", userId);
        var days = new List<DateTime>();
        using (var r = daysCmd.ExecuteReader())
            while (r.Read())
                if (DateTime.TryParse(r.GetString(0), out var d))
                    days.Add(d.Date);

        int streak = 0;
        if (days.Count > 0)
        {
            var today = now.UtcDateTime.Date;
            DateTime cursor;
            if (days[0] == today) cursor = today;
            else if (days[0] == today.AddDays(-1)) cursor = today.AddDays(-1);
            else return (total, 0); // most recent activity is older than yesterday -> broken

            foreach (var d in days)
            {
                if (d == cursor) { streak++; cursor = cursor.AddDays(-1); }
                else if (d < cursor) break;
            }
        }
        return (total, streak);
    }
}

/// <summary>A due-queue entry returned by GET /api/due.</summary>
public sealed record DueItem(
    string ItemId,
    string? Prompt,
    bool IsNew,
    double? Stability,
    double? Difficulty,
    DateTimeOffset? Due,
    int Reps,
    DateTimeOffset? LastReview);
