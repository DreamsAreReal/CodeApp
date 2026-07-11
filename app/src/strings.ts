/**
 * All user-facing strings for the app shell + lesson runner chrome.
 * Product language is Russian (brief: `UI language: ru`). Lesson CONTENT strings
 * (captions, explanations, quotes) live inside each lesson's data object, since
 * they are the deliverable content and are verified against primary sources.
 */
export const S = {
  // No product name yet, and this is a GENERAL daily-learning app (C# is only the first
  // track; Python, Claude Code, etc. to follow) — so the topbar shows just the spark mark,
  // and nothing in the shell is C#-specific or a brand. `aboutTitle` is a neutral, general
  // descriptor used on the profile "about" card. Revisit when a real name is chosen.
  aboutTitle: "Ежедневный тренажёр",

  // ---- home ----
  greetTitle: "С возвращением",
  greetSub: "Продолжим фундамент C# — сегодня закрепим, где живёт память и как работают типы.",
  // greet subtitle when the daily work is already done / nothing is due (kept coherent
  // with the hero below it, so the screen never says "продолжим" over "всё повторено").
  greetSubClear: "Фундамент C# под рукой каждый день — сегодняшняя часть уже позади.",
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
  // honest per-lesson signals (viewing progress ≠ card mastery)
  heroLessonsCompleted: (done: number, total: number) => `Пройдено тем: ${done} из ${total}`,
  topicViewing: (pct: number) => `Просмотрено ${pct}%`,
  topicViewedMastery: (mastered: number, total: number) =>
    mastered > 0 ? `Пройдено · закреплено ${mastered}/${total}` : `Пройдено · закрепляется в повторах`,

  // ---- connection states ----
  connecting: "Соединяемся с сервером…",
  authDev: (id: number) => `Демо-режим · пользователь #${id}`,
  authTelegram: "Вошли через Telegram",
  errorTitle: "Нет связи с сервером",
  errorBody:
    "Не удалось получить данные. Проверь соединение — и попробуй ещё раз.",
  retry: "Повторить",

  // ---- daily-return loop (home session states) ----
  // session-on-today CTA
  sessionKicker: "Сессия на сегодня",
  sessionCta: "Начать сессию",
  sessionMeta: (n: number, min: number) =>
    `${n} ${plural(n, "карточка", "карточки", "карточек")} · ~${min} ${plural(min, "минута", "минуты", "минут")}`,
  // first-run onboarding hero
  onboardKicker: "С чего начать",
  onboardTitle: "Учись каждый день",
  onboardBody:
    "Короткие сессии на интервальных повторениях: разбираешь нюанс, отвечаешь по памяти, а расписание само возвращает карточку ровно перед тем, как ты её забудешь.",
  onboardCta: "Начать с value-типов",
  onboardSkip: "Осмотреться самому",
  // day-closed / session complete
  doneKicker: "День закрыт",
  doneTitle: "Всё повторено на сегодня",
  doneBody: "Аккуратная работа. Расписание двинулось вперёд — так и держится память.",
  doneXpToday: (xp: number) => `+${xp} XP за сегодня`,
  doneStreakLine: (n: number) => `Серия · ${n} ${plural(n, "день", "дня", "дней")} подряд`,
  doneTomorrow: (n: number) =>
    n > 0
      ? `Завтра вернётся ${n} ${plural(n, "карточка", "карточки", "карточек")}`
      : "Завтра новых повторов пока нет — можно взять свежий урок",
  doneComeBack: "Возвращайся завтра — серия продолжится",
  // empty: no due, but lessons left to learn
  emptyNewKicker: "Нет карт к повтору",
  emptyNewTitle: "Можно взять свежий урок",
  emptyNewBody: "На сегодня всё повторено. Двинемся дальше по фундаменту — впереди новая тема.",
  emptyNewCta: "Открыть новый урок",
  // empty: no due, everything viewed
  emptyAllKicker: "Всё пройдено",
  emptyAllTitle: "Фундамент пройден целиком",
  emptyAllBody: "Ты просмотрел все темы. Теперь повторы закрепляют их надолго — возвращайся, когда карточки созреют.",
  emptyAllCta: "Повторить пройденное",

  // ---- streak (supportive, never shaming) ----
  streakMilestone: (n: number) => `${n} ${plural(n, "день", "дня", "дней")} подряд — так держать`,
  streakGrow: (n: number) => `Серия растёт · ${n} ${plural(n, "день", "дня", "дней")}`,
  streakFresh: "Начни серию сегодня",
  streakRestart: "Готов начать новую серию — с чистого листа",

  // ---- nav ----
  navLearn: "Учиться",
  navProgress: "Прогресс",
  navProfile: "Профиль",

  // ---- progress screen ----
  progressTitle: "Прогресс",
  progressSub: "Всё считает сервер — по вашей истории повторов, без выдуманных цифр.",
  progressLoading: "Считаем ваш прогресс…",
  progressEmptyTitle: "Пока нет ни одного повтора",
  progressEmptyBody:
    "Прогресс появится, как только вы разберёте первую карточку. Расписание и статистика ведутся на сервере.",
  progressEmptyCta: "Начать первый повтор",
  masteryLabel: "Освоено",
  masteryCaption: (m: number, s: number) => `${m} из ${s} карточек закреплено`,
  masteryCaptionEmpty: "Ни одна карточка ещё не закреплена",
  statReviews: "Повторы",
  statStreak: "Стрик",
  statStreakUnitDays: (n: number) => plural(n, "день", "дня", "дней"),
  statXp: "Опыт",
  statMastered: "Закреплено",
  gradeMixLabel: "Как вы отвечали",
  gradeMixCaption: "Честный срез калибровки — доля Снова / Трудно / Хорошо / Легко.",
  gradeMixEmpty: "Оценок пока нет.",
  heatmapLabel: "Активность · 4 недели",
  heatmapCaption: (d: number) => `${d} ${plural(d, "активный день", "активных дня", "активных дней")} за 28 дней`,
  heatmapDayTip: (day: string, n: number) => `${day} · ${n} ${plural(n, "повтор", "повтора", "повторов")}`,
  heatmapLess: "меньше",
  heatmapMore: "больше",
  upcomingLabel: "Впереди · 7 дней",
  upcomingCaption: "Прямой прогноз FSRS: когда карточки вернутся на повтор.",
  upcomingEmpty: "На ближайшую неделю повторов не запланировано.",
  upcomingToday: "сегодня",
  upcomingTomorrow: "завтра",
  upcomingCardsUnit: (n: number) => plural(n, "карточка", "карточки", "карточек"),
  perLessonLabel: "Темы: прохождение и закрепление",
  perLessonDue: (n: number) => `${n} ${plural(n, "к повтору", "к повтору", "к повтору")}`,
  perLessonMasteredFmt: (m: number, t: number) => `${m}/${t} закреплено`,
  perLessonSeenFmt: (s: number, t: number) => `${s}/${t} открыто`,
  lapsesFmt: (n: number) => `${n} ${plural(n, "срыв", "срыва", "срывов")}`,
  // completion (lesson-viewing) — honest "прохождение", separate from card mastery
  completionLabel: "Прохождение материала",
  completionCaption: "Сколько тем вы просмотрели целиком — отдельно от закрепления карточек.",
  statLessonsCompleted: "Тем пройдено",
  statLessonsStarted: "Начато",
  statSegmentsViewed: "Шагов просмотрено",
  perLessonCompleted: "Пройдено",
  perLessonViewingFmt: (pct: number) => `Просмотрено ${pct}%`,
  perLessonNotStarted: "Не начато",
  perLessonMasteryHint: (m: number, t: number) =>
    m > 0 ? `закреплено ${m}/${t}` : `закрепляется в повторах`,

  // ---- profile screen ----
  profileTitle: "Профиль",
  profileLoading: "Загружаем профиль…",
  profileDemoName: "Демо-режим",
  profileModeTelegram: "в Telegram",
  profileModeDemo: "демо-режим",
  profileMemberSince: (d: string) => `с нами с ${d}`,
  profileMemberSinceUnknown: "новый профиль",
  profileNoUsername: "без имени пользователя",
  summaryLabel: "Сводка",
  statDaysActive: "Активных дней",
  statDaysActiveWord: (n: number) => plural(n, "активный день", "активных дня", "активных дней"),
  howItWorksLabel: "Как это работает",
  howItWorksBody:
    "Приложение использует интервальные повторения FSRS-6. Карточка возвращается ровно тогда, когда вы вот-вот её забудете — расписание держит удержание около 90%. Ваши оценки Снова / Трудно / Хорошо / Легко подстраивают интервал каждой карточки лично под вас. Ничего не выдумано: все цифры считает сервер по вашей истории.",
  settingsLabel: "Настройки",
  reduceMotionLabel: "Меньше движения",
  reduceMotionHint: "Отключить анимации и переходы.",
  reduceMotionOn: "Включено",
  reduceMotionOff: "Выключено",
  dangerLabel: "Опасная зона",
  resetLabel: "Сбросить прогресс",
  resetHint: "Удалит расписание FSRS и историю повторов. Только ваши данные. Отменить нельзя.",
  resetConfirm1: "Сбросить весь прогресс?",
  resetConfirm1Body: "Расписание и история повторов будут удалены безвозвратно. Это касается только вашего профиля.",
  resetConfirm2: "Точно удалить? Это не отменить",
  resetCancel: "Отмена",
  resetProceed: "Да, сбросить",
  resetProcessing: "Удаляем…",
  resetDone: "Прогресс сброшен",
  resetError: "Не удалось сбросить. Попробуйте ещё раз.",
  aboutLabel: "О приложении",
  aboutPurpose: "Тренажёр для сеньоров: обучение через интервальные повторения. Первый трек — фундамент C#, дальше Python, Claude Code и другое.",
  aboutVersion: (v: string) => `Версия ${v}`,

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

  // ---- typed-answer card (generation, not recognition) ----
  typedLabel: "Напечатай вывод",
  typedHint: "Введи ровно то, что напечатает программа в консоль.",
  typedPlaceholder: "вывод программы…",
  typedCheck: "Проверить ответ",
  verdictOk: "✓ верно",
  verdictNo: "✗ мимо",
  typedYours: "Твой ответ",
  typedExpected: "Ожидалось",
  typedRevealHint: "Правильный вывод раскрыт ниже — сверься и оцени себя.",

  // ---- calibration (confidence signal) ----
  confidenceQ: "Уверен в ответе?",
  confidenceYes: "Уверен",
  confidenceNo: "Не уверен",
  calibRightSure: "Отлично — знал и был уверен.",
  calibRightUnsure: "Знал, но не был уверен — доверяй себе чуть больше.",
  calibWrongSure: "Переоценил — обрати внимание на этот нюанс.",
  calibWrongUnsure: "Ожидаемо: не был уверен — как раз для этого и повтор.",
  // Progress calibration stat
  calibLabel: "Калибровка",
  calibCaption: "Совпадение уверенности с результатом — по вашим ответам.",
  calibPctFmt: (pct: number) => `${pct}% в точку`,
  calibEmpty: "Пока нет ответов с отметкой уверенности.",
  calibOverconfidentFmt: (n: number) => `${n} ${plural(n, "переоценка", "переоценки", "переоценок")}`,
  mechanismTitle: "Механизм — как и почему",
  sourceKicker: "Источник · Microsoft Learn",
  moreSources: "Все источники · сверено дословно с первоисточником",
  edgeHead: "Крайние случаи",
  specLabel: "спека",

  // ---- review (FSRS grade) ----
  gradeHead: "Оцените, насколько уверенно вспомнили",
  // objective result is now the main signal; self-rating is secondary and pre-selected
  gradeHeadObjective: "Оценка выставлена по результату — можете уточнить",
  gradePreselectedOk: "По результату — Хорошо",
  gradePreselectedNo: "По результату — Снова",
  gradeAgain: "Снова",
  gradeHard: "Трудно",
  gradeGood: "Хорошо",
  gradeEasy: "Легко",
  gradeAgainHint: "<1 дн",
  gradeSending: "Сохраняем…",
  reviewSaved: (days: string) => `Прогресс сохранён на сервере. Следующий повтор — через ${days}.`,
  reviewDaysFmt: (d: number) => {
    const hours = d * 24;
    // Sub-hour intervals read in minutes (10 min must not round up to "1 час").
    if (hours < 1) {
      const m = Math.max(1, Math.round(hours * 60));
      return `${m} ${plural(m, "минута", "минуты", "минут")}`;
    }
    // Sub-day intervals (>= 1 h) read in hours.
    if (d < 1) {
      const h = Math.max(1, Math.round(hours));
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
