# Spike R6 — реальные размеры бандла кандидатов визуализации/анимации

Цель: получить ЧИСЛА из реально исполненного кода (а не из bundlephobia/README), т.к.
размер бандла — критичный фактор для WebView Telegram Mini App.

## Метод
- Node v26.4.0, npm 11.17.0, esbuild 0.28.1.
- Для каждого кандидата — entry-файл с РЕАЛИСТИЧНЫМ импортом (то, что реально нужно для
  алгоритм-степпера / boxes-and-arrows), см. `entries/`.
- Бандлинг: `esbuild --bundle --minify --format=esm --tree-shaking=true` (см. `measure.mjs`).
- Gzip: `zlib.gzipSync(level:9)` над минифицированным бандлом.
- Воспроизведение: `npm install` (см. package.json), затем `node measure.mjs`
  и `node -e ...` для motion/mini.

## Установленные версии
animejs 4.5.0 · motion 12.42.2 · gsap 3.15.0 · d3 7.9.0 · d3-selection 3.0.0 ·
d3-scale 4.0.2 · d3-shape 3.2.0 · lottie-web 5.13.0 · two.js 0.8.23 · esbuild 0.28.1.

## Результат (measured, KB)
| Библиотека (реалистичный импорт)                    | MIN  | GZIP |
|-----------------------------------------------------|------|------|
| vanilla (0 deps, canvas)                            | 0.1  | 0.1  |
| motion/mini (только animate)                        | 7.7  | 3.0  |
| anime.js v4 (animate + timeline)                    | 33.5 | 13.3 |
| d3-modular (select+scale+transition+shape+array)    | 52.8 | 18.3 |
| motion (animate, дефолтный импорт 'motion')         | 61.7 | 22.1 |
| gsap (core, дефолт)                                 | 68.5 | 26.8 |
| two.js (full)                                       | 201.6| 48.6 |
| lottie-web (full)                                   | 301.5| 76.7 |
| d3 v7 (full namespace import)                       | 277.1| 93.2 |

## Выводы спайка
1. Мои числа СХОДЯТСЯ с веб-репортами там, где их можно проверить: gsap ~26.8 gzip
   (web: 26.7), d3 full ~93.2 (web: 90.7), lottie ~76.7 (web: 75.0) — доверие к порядку величин.
2. КОРРЕКЦИЯ маркетинга: заявленные Motion «2.6 KB» — это ТОЛЬКО subpath `motion/mini`
   (измерено 3.0 KB gzip, animate-only, без timeline/spring/scroll). Реалистичный дефолт
   `import { animate } from 'motion'` = 22.1 KB gzip — в ~7 раз больше. README-цифру брать нельзя.
3. Полный `import * as d3` (93 KB) — недопустим для WebView; модульный d3 (18 KB) экономит ~75 KB.
4. anime.js v4 — самая лёгкая ПОЛНОЦЕННАЯ (animate+timeline) анимационная либа: 13.3 KB gzip.
5. lottie-web и two.js — тяжёлые; lottie оправдан только под готовые After Effects-анимации.
