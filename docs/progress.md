# Прогресс — миграция autolayout v2 (5 уроков) + обобщение layoutScene до сетки

North Star: движок диаграмм делает авторинг анимаций визуально без-баговым — ментор
физически не может собрать кривой кадр. Цель шага: во ВСЕХ 6 уроках 0 ручных координат
(`viz-fit` → «autolayout: 6/6 lessons fully on at»).

## Baseline (до правок), зафиксирован
- `npm run build` — чисто.
- `viz-fit.mjs` — ALL GREEN, строка покрытия «autolayout: 1/6 lessons fully on at [T2.M2.closures]».
- Эталон стиля миграции: `closures.ts` (5 сегментов на `at`), скриншоты-замок в
  `docs/evidence/autolayout/closures/*.png` — cream+coral, вложение, ортогональные рёбра.

## МИЛСТОУН 1 — обобщить layoutScene до сетки (row × col)
Проблема: async-await — 2D-таймлайн, «левые» узлы разных рядов должны делить один X;
текущее по-рядовое центрирование это ломает.

### Решение (в layout.ts, функция layoutZone)
- Зона = сетка ячеек (row,col). Множество колонок = union `col` по всем узлам зоны
  (нет col → col 0).
- Ширина колонки = max ширина узла в ней (по всем рядам). Колонки слева-направо с
  GUTTER_CROSS=16; весь блок колонок центрируется в inner-width зоны. У колонки ОДИН
  center-X на все ряды (левый край стабилен между рядами).
- Высота ряда = max высота узла в ряду; ряды сверху-вниз GUTTER_ROW=16; блок центрируется по Y.
- Узел (row,col) в своей ячейке: центр по center-X колонки и center-Y ряда.
- Несколько узлов в ОДНОЙ ячейке (row,col) — распределяются горизонтально внутри ячейки
  (обратная совместимость: старый «ряд из N узлов без col»); ширина такой колонки = max
  суммарной ширины под-ряда по рядам.
- Overflow: сначала общая ширина всех колонок > innerW → ужать колонки по лестнице (как
  раньше ужимали ряд), иначе THROW. Вложение / escape-hatch — без изменений.

### Регрессионный замок (обязателен)
ОДНОКОЛОНОЧНЫЕ зоны (все col=0) обязаны давать РОВНО прежнее поведение — closures s1-s5
пиксель-в-пиксель как в эталонных скринах. Проверка: `closures-shots.mjs` + сравнение с
`docs/evidence/autolayout/closures/*.png`.

## МИЛСТОУН 2 — мигрировать 5 уроков (по одному, каждый верифицируя)
Порядок: value-vs-reference → boxing → gc → hashtable → async-await.

### Статус уроков
- value-vs-reference: self-pass (4 сцены, stack/heap одноколоночные, чисто; скрины
  docs/evidence/autolayout/value-vs-reference/s1-4.png; AUTHORING-PROOF 2/6)
- boxing: self-pass (7 сцен). s5 вложение F в objN через at:{in}. s3 — новая широкая
  gate-полоса внизу (длинный detail NullReferenceException не влезал в 138-зону).
  s7 столбик 3 obj-h60 → зона высокая (viewBox 272). Убрал дублирующий chip cp в s4
  scene3 (давал ROW-BASELINE near-miss n/obj). viz-fit ALL GREEN, покрытие 3/6.
- gc: self-pass (6 сцен). s2/s4 — 3 gen-зоны, promotion FLIP из gen0→gen1. s1/s5 —
  широкая куча, объекты в ряд (col). s3/s6 — новые gate-полосы внизу (широкий detail
  «→ collect gen 0» / «→ using / try-finally» не влезал в узкие зоны). viz-fit ALL GREEN,
  покрытие 4/6.
- hashtable: self-pass (6 сцен). s1 table/keys с выровненными рядами (keys h156 чтобы
  row0 совпал с table по center-Y, иначе ROW near-miss 6px). s2/s3 цепочка entry вправо
  через col. s4 цепочка chips (bucket сверху→вниз→вправо) + verdict-полоса. s5 сетка 2×2
  (row×col — прямое применение grid М1) + resize-полоса. Широкие gate вынесены в нижние
  полосы. viz-fit ALL GREEN, покрытие 5/6.
- async-await: self-pass (5 сцен). 2D-таймлайн: треки=зоны (caller/io, ui/pool),
  фазы времени=колонки (col0 до await, col1 после). Треки подняты до h76 (obj-h60
  стейт-машины нужен PAD≥8), io/pool-label опущен ниже верхнего трека (иначе obj
  перекрывал подпись). continuation/deadlock — gate в широком треке. viz-fit 6/6 ALL GREEN.

## ИТОГ (всё self-pass)
- build чисто; viz-fit ALL GREEN + «autolayout: 6/6 lessons fully on at»;
  run.mjs / new-lessons.mjs / shell.mjs — ALL GREEN.
- closures пиксель-в-пиксель идентичны эталону после ВСЕХ правок (регресс-замок держит).
- Скриншоты всех сцен: docs/evidence/autolayout/<lesson>/s*.png (390px, reduced-motion,
  финальная сцена сегмента).
- Общий шот-скрипт: app/verify/autolayout-shots.mjs.
- СПОРНОЕ (куда смотреть ревьюеру): финальные кадры boxing-s3/s6, gc-s3/s6, hashtable-s4/s5,
  async-s5 показывают gate в нижней полосе, а верхние зоны в ЭТОМ кадре разрежены/пусты
  (объекты жили в предыдущих сценах сегмента) — это осмысленно (кадр про врата/итог), но
  зоны выглядят просторно. boxing-s7 высокий (viewBox 272: 3 boxed obj-h60 столбиком).

## МИЛСТОУН 1 — ГОТОВО (self-pass)
- layoutZone переписан на grid (row × col): union колонок, стабильный center-X колонки
  между рядами, overflow ужимает по колонкам. Одноузловая колонка сводится к старому
  вертикальному стеку.
- Регрессия closures: ПИКСЕЛЬ-В-ПИКСЕЛЬ (SHA-256 всех 5 скринов совпал с эталоном
  docs/evidence/autolayout/closures/*.png). build чисто, viz-fit ALL GREEN.

## Решения / грабли
- `vite preview` кэширует бандл — после правки .ts надо УБИТЬ и перезапустить preview на
  свежий dist (иначе браузерные проверки/скрины на старом коде). viz-fit AUTHORING-PROOF
  импортирует layoutScene из .ts напрямую (node type-stripping) — pure-часть свежая всегда.
- macOS без `timeout` (нет coreutils) — гонять node-скрипты без обёртки.
- Эквивалентность одноколоночного случая: одна колонка шириной max центрируется в inner,
  её center-X = innerCx; одиночный узел → cx=snap(innerCx). Совпадает со старым
  `snap(innerCx - w/2 + w/2)`. Доказано пиксельным сравнением.
</content>
</invoke>
