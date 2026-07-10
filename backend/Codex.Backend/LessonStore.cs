using System.Text.Json;

namespace Codex.Backend;

/// <summary>Lesson summary for the catalog list (GET /api/lessons). `Cards` is the
/// number of reviewable items derived from the lesson, so the client can show
/// real per-lesson progress (reviewed vs due) without guessing.</summary>
public sealed record LessonSummary(string Id, string Title, string Track, string Module, string Status, int Cards);

/// <summary>
/// Loads lesson-as-data JSON files from seed/lessons at startup and serves them verbatim.
/// One lesson object drives lesson text, viz trace and SRS cards (see lesson-format.md).
/// Review items are derived from each lesson's cards.
/// </summary>
public sealed class LessonStore
{
    private readonly Dictionary<string, string> _rawById = new(StringComparer.Ordinal);
    private readonly List<LessonSummary> _summaries = new();
    private readonly List<Item> _items = new();

    public LessonStore(string lessonsDir)
    {
        if (!Directory.Exists(lessonsDir))
            throw new DirectoryNotFoundException($"Lessons directory not found: {lessonsDir}");

        foreach (var path in Directory.EnumerateFiles(lessonsDir, "*.json").OrderBy(p => p))
        {
            string raw = File.ReadAllText(path);
            using var doc = JsonDocument.Parse(raw);
            var root = doc.RootElement;
            string id = root.GetProperty("id").GetString()!;

            _rawById[id] = raw;
            int cardCount = root.TryGetProperty("cards", out var cardsForCount) && cardsForCount.ValueKind == JsonValueKind.Array
                ? cardsForCount.GetArrayLength()
                : 0;
            _summaries.Add(new LessonSummary(
                id,
                root.GetProperty("title").GetString() ?? id,
                root.TryGetProperty("track", out var t) ? t.GetString() ?? "" : "",
                root.TryGetProperty("module", out var m) ? m.GetString() ?? "" : "",
                root.TryGetProperty("status", out var s) ? s.GetString() ?? "" : "",
                cardCount));

            if (root.TryGetProperty("cards", out var cards) && cards.ValueKind == JsonValueKind.Array)
            {
                foreach (var card in cards.EnumerateArray())
                {
                    string cardId = card.GetProperty("id").GetString()!;
                    _items.Add(new Item(
                        ItemId: $"{id}/{cardId}",
                        LessonId: id,
                        Prompt: card.TryGetProperty("prompt", out var p) ? p.GetString() : null,
                        ExpectedOutput: card.TryGetProperty("expectedOutput", out var e) ? e.GetString() : null));
                }
            }
        }
    }

    public IReadOnlyList<LessonSummary> Summaries => _summaries;
    public IReadOnlyList<Item> Items => _items;

    public string? RawJson(string id) => _rawById.GetValueOrDefault(id);
}
