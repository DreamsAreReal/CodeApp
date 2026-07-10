import { Recorder, StepPlayer } from './engine.ts';
import type { DNode, Scene, Steps } from './engine.ts';

// RECIPE A — bubble-sort array step-trace via the Recorder (command-log pattern).
export function bubbleSortSteps(values: number[]): Steps {
  const nodes: DNode[] = values.map((v, i) => ({
    id: 'a' + i, kind: 'box', x: 40 + i * 64, y: 60, w: 56, h: 40, text: String(v),
  }));
  const r = new Recorder(nodes);
  const idOf = (i: number) => 'a' + i;
  const arr = values.slice();
  const pos = values.map((_, i) => i); // which array slot each id currently occupies
  r.snapshot({ caption: 'Исходный массив', codeLine: 1 });
  for (let i = 0; i < arr.length; i++) {
    for (let j = 0; j < arr.length - i - 1; j++) {
      r.clearAccents().set(idOf(pos[j]), { accent: true }).set(idOf(pos[j + 1]), { accent: true })
        .snapshot({ caption: `Сравниваем ${arr[j]} и ${arr[j + 1]}`, codeLine: 3,
          predict: 'Поменяются ли местами?' });
      if (arr[j] > arr[j + 1]) {
        r.swapPos(idOf(pos[j]), idOf(pos[j + 1]));
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
        [pos[j], pos[j + 1]] = [pos[j + 1], pos[j]];
        r.snapshot({ caption: 'Меняем местами (FLIP-переход)', codeLine: 4 });
      }
    }
  }
  r.clearAccents().snapshot({ caption: 'Отсортировано', codeLine: 6 });
  return r.done();
}

// RECIPE B — stack/heap boxes-and-arrows (Python Tutor style) authored directly.
// Models C# reference vs value + boxing: value `int i=5` on stack, boxed object on heap.
export function boxingSteps(): Steps {
  const stackI: DNode = { id: 'stack_i', kind: 'box', x: 80, y: 60, w: 120, h: 36, text: 'int i = 5' };
  const objRef: DNode = { id: 'stack_o', kind: 'box', x: 80, y: 110, w: 120, h: 36, text: 'object o' };
  const heapBox: DNode = { id: 'heap_box', kind: 'box', x: 340, y: 110, w: 140, h: 44, text: '[boxed] 5' };
  const s1: Scene = { nodes: [stackI], edges: [], caption: 'Значимый тип на стеке', codeLine: 1 };
  const s2: Scene = {
    nodes: [stackI, { ...objRef, accent: true }, { ...heapBox, accent: true }],
    edges: [{ id: 'ref', from: 'stack_o', to: 'heap_box', accent: true }],
    caption: 'object o = i; — boxing: копия 5 уходит в кучу, o ссылается на неё',
    codeLine: 2, predict: 'Где теперь живёт значение 5?',
  };
  const s3: Scene = {
    nodes: [stackI, objRef, heapBox],
    edges: [{ id: 'ref', from: 'stack_o', to: 'heap_box' }],
    caption: 'Стек хранит ссылку; сама пятёрка — объект в куче (алиасинг стрелкой)',
    codeLine: 3,
  };
  return [s1, s2, s3];
}
