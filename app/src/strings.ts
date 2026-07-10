/**
 * All user-facing strings for the app shell + lesson runner chrome.
 * Product language is Russian (brief: `UI language: ru`). Lesson CONTENT strings
 * (captions, explanations, quotes) live inside each lesson's data object, since
 * they are the deliverable content and are verified against primary sources.
 */
export const S = {
  brand: "Фундамент C#",

  // ---- home ----
  greetTitle: "С возвращением",
  greetSub: "Продолжим фундамент C# — сегодня закрепим, где живёт память и как работают типы.",
  heroKicker: "Продолжить сегодня",
  heroContinue: "Продолжить",
  heroCardsDue: (n: number) => `${n} ${plural(n, "карточка", "карточки", "карточек")} к повтору`,
  heroAllDone: "На сегодня всё повторено",
  heroMinutes: (n: number) => `~${n} мин`,
  pathLabel: "Путь · Ядро C#",
  topicActive: "Активна",
  topicDue: "к повтору",
  topicNew: "новое",
  topicLockedSub: "Скоро · продолжай текущую тему",
  statStreakUnit: "дней",

  // ---- connection states ----
  connecting: "Соединяемся с сервером…",
  authDev: (id: number) => `Демо-режим · пользователь #${id}`,
  authTelegram: "Вошли через Telegram",
  errorTitle: "Нет связи с сервером",
  errorBody:
    "Не удалось получить расписание. Проверь соединение и потяни вниз, чтобы обновить.",
  retry: "Повторить",

  // ---- nav ----
  navLearn: "Учиться",
  navProgress: "Прогресс",
  navProfile: "Профиль",

  // ---- lesson runner chrome ----
  close: "Закрыть урок",
  xpUnit: "XP",
  labelHook: "Нюанс, не азы",
  hookTag: "Нюанс · читаем как машина",
  labelMcq: "Предскажи вывод",
  labelRecon: "Собираем целое",
  stepFmt: (n: number, t: number) => `${n}/${t}`,
  predictTitle: "Сначала предскажите",
  predictShow: "Показать шаг",
  ilBadge: "IL",
  ilCap: "эмитит компилятор",
  play: "Проиграть",
  pause: "Пауза",
  back: "Назад",
  forward: "Вперёд",
  check: "Проверить",
  okTitle: "Верно!",
  noTitle: "Почти",
  mechanismTitle: "Механизм — как и почему",
  sourceKicker: "Источник · Microsoft Learn",
  moreSources: "Все источники · сверено дословно с первоисточником",
  edgeHead: "Крайние случаи",
  specLabel: "спека",

  // ---- review (FSRS grade) ----
  gradeHead: "Оцените, насколько уверенно вспомнили",
  gradeAgain: "Снова",
  gradeHard: "Трудно",
  gradeGood: "Хорошо",
  gradeEasy: "Легко",
  gradeAgainHint: "<1 дн",
  gradeSending: "Сохраняем…",
  reviewSaved: (days: string) => `Прогресс сохранён на сервере. Следующий повтор — через ${days}.`,
  reviewDaysFmt: (d: number) => {
    if (d < 1) {
      const h = Math.max(1, Math.round(d * 24));
      return `${h} ${plural(h, "час", "часа", "часов")}`;
    }
    const days = Math.round(d);
    return `${days} ${plural(days, "день", "дня", "дней")}`;
  },
  next: "Дальше",
  toHome: "На главную",
  lessonDone: "Урок пройден",
} as const;

/** Russian pluralisation (one / few / many). */
export function plural(n: number, one: string, few: string, many: string): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return one;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return few;
  return many;
}
