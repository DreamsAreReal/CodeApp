namespace Codex.Backend;

/// <summary>
/// User-facing strings (product language: ru). Only messages surfaced to the end user
/// live here. Developer-only diagnostics (e.g. the dev-only C# runner) stay technical.
/// </summary>
public static class Strings
{
    public const string MissingInitData = "Отсутствуют данные авторизации Telegram.";
    public const string InvalidInitData = "Недействительные данные авторизации Telegram.";
    public const string AuthDateExpired = "Данные авторизации устарели, откройте приложение заново.";
    public const string UserNotFound = "Пользователь не найден.";
    public const string ItemNotFound = "Карточка не найдена.";
    public const string LessonNotFound = "Урок не найден.";
    public const string InvalidGrade = "Недопустимая оценка. Ожидается 1–4 (Again/Hard/Good/Easy).";
    public const string DevModeDisabled = "Dev-режим авторизации выключен.";
    public const string EmptyCode = "Код не передан.";
}
