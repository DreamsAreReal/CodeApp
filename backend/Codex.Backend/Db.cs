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
        // No shared-cache: it forces a process-wide single cache that serialises unrelated
        // connections and is a known source of "database is locked" under concurrency. WAL +
        // per-connection busy_timeout is the correct model for many short-lived connections.
        _connectionString = new SqliteConnectionStringBuilder
        {
            DataSource = filePath,
            Mode = SqliteOpenMode.ReadWriteCreate,
        }.ToString();
    }

    private SqliteConnection Open()
    {
        var conn = new SqliteConnection(_connectionString);
        conn.Open();
        using var pragma = conn.CreateCommand();
        // busy_timeout: on a lock, retry for up to 5s instead of throwing immediately.
        // synchronous=NORMAL: safe with WAL and much faster than FULL for our write pattern.
        pragma.CommandText =
            "PRAGMA journal_mode=WAL; PRAGMA busy_timeout=5000; PRAGMA synchronous=NORMAL; PRAGMA foreign_keys=ON;";
        pragma.ExecuteNonQuery();
        return conn;
    }

    /// <summary>
    /// Fold the WAL back into the main database file. Called on graceful shutdown so a redeploy
    /// (SIGTERM) does not leave uncheckpointed pages in the -wal sidecar.
    /// </summary>
    public void Checkpoint()
    {
        using var conn = Open();
        using var cmd = conn.CreateCommand();
        cmd.CommandText = "PRAGMA wal_checkpoint(TRUNCATE);";
        cmd.ExecuteNonQuery();
    }

    /// <summary>Open a connection and run <c>SELECT 1</c> — the readiness probe. Throws if the DB is unreachable.</summary>
    public void Ping()
    {
        using var conn = Open();
        using var cmd = conn.CreateCommand();
        cmd.CommandText = "SELECT 1;";
        cmd.ExecuteScalar();
    }

    /// <summary>
    /// Migration 1 — the current full schema. Written with CREATE TABLE/INDEX IF NOT EXISTS so it
    /// is a NO-OP on the live production DB (which already has these tables + real user rows): it
    /// never drops or recreates anything, it only fills in what is missing on a fresh DB.
    /// </summary>
    private const string Migration1Schema = """
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
        CREATE TABLE IF NOT EXISTS lesson_progress (
            user_id        INTEGER NOT NULL,
            lesson_id      TEXT NOT NULL,
            segments_seen  INTEGER NOT NULL,
            segments_total INTEGER NOT NULL,
            completed      INTEGER NOT NULL,
            updated        TEXT NOT NULL,
            PRIMARY KEY (user_id, lesson_id)
        );
        CREATE INDEX IF NOT EXISTS ix_review_due ON review_state (user_id, due);
        CREATE INDEX IF NOT EXISTS ix_events_user ON progress_events (user_id, ts);
        CREATE INDEX IF NOT EXISTS ix_lesson_prog_user ON lesson_progress (user_id);
        """;

    /// <summary>
    /// Ordered, FORWARD-ONLY migration scripts. Index i is the script that bumps user_version
    /// from i to i+1 (so Migrations[0] == migration 1). Append here for future schema changes;
    /// each new script runs exactly once, in order, inside a transaction. Never edit/reorder a
    /// script that has already shipped — that would silently skip it on existing DBs.
    /// </summary>
    private static readonly string[] Migrations =
    {
        Migration1Schema,
    };

    /// <summary>
    /// Apply any pending migrations, gated on <c>PRAGMA user_version</c>. Forward-only and
    /// idempotent: on the existing prod DB (user_version already at the latest) this is a no-op;
    /// on a fresh DB it runs migration 1 (the full schema) and sets user_version=1. Each script
    /// runs in its own transaction and bumps the version, so a crash mid-run cannot half-apply.
    /// </summary>
    public void Initialize()
    {
        using var conn = Open();

        using var readVer = conn.CreateCommand();
        readVer.CommandText = "PRAGMA user_version;";
        int version = Convert.ToInt32(readVer.ExecuteScalar());

        for (int target = version + 1; target <= Migrations.Length; target++)
        {
            using var tx = conn.BeginTransaction();
            using var script = conn.CreateCommand();
            script.Transaction = tx;
            script.CommandText = Migrations[target - 1];
            script.ExecuteNonQuery();

            using var bump = conn.CreateCommand();
            bump.Transaction = tx;
            // PRAGMA does not accept a bound parameter; target is an int we control (not user input).
            bump.CommandText = $"PRAGMA user_version = {target};";
            bump.ExecuteNonQuery();

            tx.Commit();
        }
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

    /// <summary>
    /// A card is "mastered" once its FSRS stability reaches this many days. At a 21-day
    /// interval the FSRS-6 forgetting curve still predicts ~90% retention (the app's
    /// target retention), so a stability of &gt;= 21 days means the card is durably learnt,
    /// not merely seen once. Kept as a named constant so the number is documented in one place.
    /// </summary>
    public const double MasteryStabilityDays = 21.0;

    // ---- progress aggregates (GET /api/progress) ----

    /// <summary>The created timestamp for a user, or null if the user does not exist.</summary>
    public DateTimeOffset? GetUserCreated(long userId)
    {
        using var conn = Open();
        using var cmd = conn.CreateCommand();
        cmd.CommandText = "SELECT created FROM users WHERE tg_id = $u;";
        cmd.Parameters.AddWithValue("$u", userId);
        var v = cmd.ExecuteScalar();
        return v is string s ? ParseIso(s) : null;
    }

    /// <summary>Distinct UTC calendar days on which the user recorded at least one review.</summary>
    public int GetDaysActive(long userId)
    {
        using var conn = Open();
        using var cmd = conn.CreateCommand();
        cmd.CommandText =
            "SELECT COUNT(DISTINCT substr(ts, 1, 10)) FROM progress_events WHERE user_id = $u;";
        cmd.Parameters.AddWithValue("$u", userId);
        return Convert.ToInt32(cmd.ExecuteScalar());
    }

    /// <summary>Count of review events by FSRS grade (1=Again, 2=Hard, 3=Good, 4=Easy).</summary>
    public GradeMix GetGradeMix(long userId)
    {
        using var conn = Open();
        using var cmd = conn.CreateCommand();
        cmd.CommandText =
            "SELECT grade, COUNT(*) FROM progress_events WHERE user_id = $u GROUP BY grade;";
        cmd.Parameters.AddWithValue("$u", userId);
        int again = 0, hard = 0, good = 0, easy = 0;
        using var r = cmd.ExecuteReader();
        while (r.Read())
        {
            int g = r.GetInt32(0), c = r.GetInt32(1);
            switch (g)
            {
                case 1: again = c; break;
                case 2: hard = c; break;
                case 3: good = c; break;
                case 4: easy = c; break;
            }
        }
        return new GradeMix(again, hard, good, easy);
    }

    /// <summary>
    /// Card-level coverage: distinct items the user has seen (has review_state for),
    /// the total catalog size, how many are mastered (stability &gt;= <see cref="MasteryStabilityDays"/>),
    /// and the total number of lapses (Again re-grades) accumulated across all cards.
    /// </summary>
    public CardsSummary GetCardsSummary(long userId)
    {
        using var conn = Open();

        using var totalCmd = conn.CreateCommand();
        totalCmd.CommandText = "SELECT COUNT(*) FROM items;";
        int total = Convert.ToInt32(totalCmd.ExecuteScalar());

        using var seenCmd = conn.CreateCommand();
        seenCmd.CommandText = """
            SELECT
                COUNT(*),
                COALESCE(SUM(CASE WHEN stability >= $m THEN 1 ELSE 0 END), 0),
                COALESCE(SUM(lapses), 0)
            FROM review_state WHERE user_id = $u;
            """;
        seenCmd.Parameters.AddWithValue("$u", userId);
        seenCmd.Parameters.AddWithValue("$m", MasteryStabilityDays);
        using var r = seenCmd.ExecuteReader();
        r.Read();
        int seen = r.GetInt32(0);
        int mastered = r.GetInt32(1);
        int lapsesTotal = r.GetInt32(2);
        return new CardsSummary(seen, total, mastered, lapsesTotal);
    }

    /// <summary>
    /// Per-lesson mastery: for every lesson in the catalog, how many of its items the
    /// user has seen, mastered, and how many are due now (due &lt;= now, or never seen).
    /// LEFT JOIN keeps lessons the user has not started (seen/mastered = 0, due = total).
    /// </summary>
    public List<LessonProgress> GetPerLesson(long userId, DateTimeOffset now)
    {
        var viewing = GetLessonProgress(userId); // lesson-viewing rows (segments seen / completed)

        using var conn = Open();
        using var cmd = conn.CreateCommand();
        cmd.CommandText = """
            SELECT
                i.lesson_id,
                COUNT(*) AS total,
                COALESCE(SUM(CASE WHEN rs.item_id IS NOT NULL THEN 1 ELSE 0 END), 0) AS seen,
                COALESCE(SUM(CASE WHEN rs.stability >= $m THEN 1 ELSE 0 END), 0) AS mastered,
                COALESCE(SUM(CASE WHEN rs.item_id IS NULL OR rs.due <= $now THEN 1 ELSE 0 END), 0) AS due
            FROM items i
            LEFT JOIN review_state rs ON rs.item_id = i.item_id AND rs.user_id = $u
            GROUP BY i.lesson_id
            ORDER BY i.lesson_id;
            """;
        cmd.Parameters.AddWithValue("$u", userId);
        cmd.Parameters.AddWithValue("$m", MasteryStabilityDays);
        cmd.Parameters.AddWithValue("$now", Iso(now));
        using var r = cmd.ExecuteReader();
        var list = new List<LessonProgress>();
        while (r.Read())
        {
            var lessonId = r.GetString(0);
            var view = viewing.GetValueOrDefault(lessonId);
            list.Add(new LessonProgress(
                LessonId: lessonId,
                Total: r.GetInt32(1),
                Seen: r.GetInt32(2),
                Mastered: r.GetInt32(3),
                Due: r.GetInt32(4),
                SegmentsSeen: view?.SegmentsSeen ?? 0,
                SegmentsTotal: view?.SegmentsTotal ?? 0,
                Completed: view?.Completed ?? false));
        }
        return list;
    }

    /// <summary>
    /// Daily review counts for the trailing <paramref name="days"/> UTC days, ending
    /// today, 0-filled for days with no activity — the backing grid for a heatmap.
    /// </summary>
    public List<DayCount> GetActivity(long userId, DateTimeOffset now, int days)
    {
        using var conn = Open();
        using var cmd = conn.CreateCommand();
        cmd.CommandText = """
            SELECT substr(ts, 1, 10) AS d, COUNT(*)
            FROM progress_events WHERE user_id = $u AND substr(ts, 1, 10) >= $from
            GROUP BY d;
            """;
        var today = now.UtcDateTime.Date;
        var from = today.AddDays(-(days - 1));
        cmd.Parameters.AddWithValue("$u", userId);
        cmd.Parameters.AddWithValue("$from", from.ToString("yyyy-MM-dd"));
        var counts = new Dictionary<string, int>();
        using (var r = cmd.ExecuteReader())
            while (r.Read())
                counts[r.GetString(0)] = r.GetInt32(1);

        var list = new List<DayCount>(days);
        for (int i = 0; i < days; i++)
        {
            var day = from.AddDays(i).ToString("yyyy-MM-dd");
            list.Add(new DayCount(day, counts.GetValueOrDefault(day, 0)));
        }
        return list;
    }

    /// <summary>
    /// Forward FSRS schedule: how many cards fall due on each of the next
    /// <paramref name="days"/> UTC days (starting today), 0-filled — the "upcoming" view.
    /// Cards due in the past collapse onto today's bucket (they are due now).
    /// </summary>
    public List<DayCount> GetUpcoming(long userId, DateTimeOffset now, int days)
    {
        using var conn = Open();
        using var cmd = conn.CreateCommand();
        var today = now.UtcDateTime.Date;
        var horizon = today.AddDays(days); // exclusive upper bound
        cmd.CommandText = """
            SELECT due FROM review_state
            WHERE user_id = $u AND due < $horizon;
            """;
        cmd.Parameters.AddWithValue("$u", userId);
        cmd.Parameters.AddWithValue("$horizon", Iso(new DateTimeOffset(horizon, TimeSpan.Zero)));
        var counts = new Dictionary<string, int>();
        using (var r = cmd.ExecuteReader())
        {
            while (r.Read())
            {
                var dueDay = ParseIso(r.GetString(0)).UtcDateTime.Date;
                if (dueDay < today) dueDay = today; // overdue -> due today
                var key = dueDay.ToString("yyyy-MM-dd");
                counts[key] = counts.GetValueOrDefault(key, 0) + 1;
            }
        }

        var list = new List<DayCount>(days);
        for (int i = 0; i < days; i++)
        {
            var day = today.AddDays(i).ToString("yyyy-MM-dd");
            list.Add(new DayCount(day, counts.GetValueOrDefault(day, 0)));
        }
        return list;
    }

    /// <summary>
    /// Erase a single user's learning history: their FSRS schedule and append-only
    /// review events. Only ever touches rows for <paramref name="userId"/> (never the
    /// catalog or other users). Returns the number of rows removed.
    /// </summary>
    public (int ReviewStates, int Events) ResetProgress(long userId)
    {
        using var conn = Open();
        using var tx = conn.BeginTransaction();

        using var delStates = conn.CreateCommand();
        delStates.Transaction = tx;
        delStates.CommandText = "DELETE FROM review_state WHERE user_id = $u;";
        delStates.Parameters.AddWithValue("$u", userId);
        int states = delStates.ExecuteNonQuery();

        using var delEvents = conn.CreateCommand();
        delEvents.Transaction = tx;
        delEvents.CommandText = "DELETE FROM progress_events WHERE user_id = $u;";
        delEvents.Parameters.AddWithValue("$u", userId);
        int events = delEvents.ExecuteNonQuery();

        // Lesson-viewing progress is this user's data too — wipe it on reset.
        using var delLessons = conn.CreateCommand();
        delLessons.Transaction = tx;
        delLessons.CommandText = "DELETE FROM lesson_progress WHERE user_id = $u;";
        delLessons.Parameters.AddWithValue("$u", userId);
        delLessons.ExecuteNonQuery();

        tx.Commit();
        return (states, events);
    }

    // ---- lesson-viewing progress (segments seen / completed) ----

    /// <summary>
    /// UPSERT lesson-viewing progress with MONOTONIC semantics: segments_seen never
    /// decreases (max of stored vs incoming), completed is sticky (once true, stays true).
    /// segments_total and updated always take the latest value. Truthful "how far did the
    /// user get" signal, independent of the FSRS review schedule.
    /// </summary>
    public LessonViewProgress UpsertLessonProgress(
        long userId, string lessonId, int segmentsSeen, int segmentsTotal, bool completed, DateTimeOffset now)
    {
        using var conn = Open();
        using var cmd = conn.CreateCommand();
        cmd.CommandText = """
            INSERT INTO lesson_progress (user_id, lesson_id, segments_seen, segments_total, completed, updated)
            VALUES ($u, $l, $seen, $total, $done, $ts)
            ON CONFLICT(user_id, lesson_id) DO UPDATE SET
                segments_seen  = MAX(lesson_progress.segments_seen, excluded.segments_seen),
                segments_total = excluded.segments_total,
                completed      = MAX(lesson_progress.completed, excluded.completed),
                updated        = excluded.updated;
            """;
        cmd.Parameters.AddWithValue("$u", userId);
        cmd.Parameters.AddWithValue("$l", lessonId);
        cmd.Parameters.AddWithValue("$seen", Math.Max(0, segmentsSeen));
        cmd.Parameters.AddWithValue("$total", Math.Max(0, segmentsTotal));
        cmd.Parameters.AddWithValue("$done", completed ? 1 : 0);
        cmd.Parameters.AddWithValue("$ts", Iso(now));
        cmd.ExecuteNonQuery();

        using var read = conn.CreateCommand();
        read.CommandText = """
            SELECT segments_seen, segments_total, completed
            FROM lesson_progress WHERE user_id = $u AND lesson_id = $l;
            """;
        read.Parameters.AddWithValue("$u", userId);
        read.Parameters.AddWithValue("$l", lessonId);
        using var r = read.ExecuteReader();
        r.Read();
        return new LessonViewProgress(lessonId, r.GetInt32(0), r.GetInt32(1), r.GetInt32(2) != 0);
    }

    /// <summary>All lesson-viewing rows for a user, keyed by lesson_id.</summary>
    public Dictionary<string, LessonViewProgress> GetLessonProgress(long userId)
    {
        using var conn = Open();
        using var cmd = conn.CreateCommand();
        cmd.CommandText = """
            SELECT lesson_id, segments_seen, segments_total, completed
            FROM lesson_progress WHERE user_id = $u;
            """;
        cmd.Parameters.AddWithValue("$u", userId);
        var map = new Dictionary<string, LessonViewProgress>();
        using var r = cmd.ExecuteReader();
        while (r.Read())
            map[r.GetString(0)] = new LessonViewProgress(
                r.GetString(0), r.GetInt32(1), r.GetInt32(2), r.GetInt32(3) != 0);
        return map;
    }

    /// <summary>
    /// Catalog-wide lesson-viewing rollup: distinct lessons in the catalog, how many the
    /// user has started (segments_seen &gt; 0), how many completed, and total segments viewed.
    /// </summary>
    public CompletionSummary GetCompletionSummary(long userId)
    {
        using var conn = Open();

        using var totalCmd = conn.CreateCommand();
        totalCmd.CommandText = "SELECT COUNT(DISTINCT lesson_id) FROM items;";
        int lessonsTotal = Convert.ToInt32(totalCmd.ExecuteScalar());

        using var rollup = conn.CreateCommand();
        rollup.CommandText = """
            SELECT
                COALESCE(SUM(CASE WHEN completed = 1 THEN 1 ELSE 0 END), 0),
                COALESCE(SUM(CASE WHEN segments_seen > 0 THEN 1 ELSE 0 END), 0),
                COALESCE(SUM(segments_seen), 0)
            FROM lesson_progress WHERE user_id = $u;
            """;
        rollup.Parameters.AddWithValue("$u", userId);
        using var r = rollup.ExecuteReader();
        r.Read();
        return new CompletionSummary(lessonsTotal, r.GetInt32(0), r.GetInt32(1), r.GetInt32(2));
    }
}

/// <summary>Review-count breakdown by FSRS grade.</summary>
public sealed record GradeMix(int Again, int Hard, int Good, int Easy);

/// <summary>Catalog-wide card coverage for a user.</summary>
public sealed record CardsSummary(int Seen, int Total, int Mastered, int LapsesTotal);

/// <summary>
/// Per-lesson rollup for a user: card mastery (Total/Seen/Mastered/Due from the FSRS
/// review state) AND lesson-viewing progress (SegmentsSeen/SegmentsTotal/Completed).
/// The two are deliberately distinct — "completed viewing" is not "mastered".
/// </summary>
public sealed record LessonProgress(
    string LessonId, int Total, int Seen, int Mastered, int Due,
    int SegmentsSeen, int SegmentsTotal, bool Completed);

/// <summary>One lesson-viewing progress row (segments seen / completed).</summary>
public sealed record LessonViewProgress(string LessonId, int SegmentsSeen, int SegmentsTotal, bool Completed);

/// <summary>Catalog-wide lesson-viewing rollup for a user.</summary>
public sealed record CompletionSummary(int LessonsTotal, int LessonsCompleted, int LessonsStarted, int SegmentsSeenTotal);

/// <summary>A single (day, count) bucket for activity / upcoming timelines.</summary>
public sealed record DayCount(string Day, int Count);

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
