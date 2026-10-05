import { expect, test } from 'bun:test';
import { Ghostty } from './ghostty';
import { BufferNamespace } from './buffer';
import { SelectionManager } from './selection-manager';
import { EventEmitter } from './event-emitter';
import type { Terminal } from './terminal';

const wasm = await WebAssembly.compile(await Bun.file(new URL('../ghostty-vt.wasm', import.meta.url)).arrayBuffer());

test('buffer preserves wrapped history, graphemes and cell widths', async () => {
  const engine = new Ghostty(await WebAssembly.instantiate(wasm, {})).createTerminal(8, 3, { scrollbackLimit: 100 });
  try {
    engine.write('abcdefghXYZ\r\n界e\u0301👩‍💻\r\n1\r\n2\r\n3\r\n');
    const buffer = new BufferNamespace({ wasmTerm: engine } as unknown as Terminal).active;
    expect(buffer.getLine(0)?.translateToString(true)).toBe('abcdefgh');
    expect(buffer.getLine(1)?.isWrapped).toBe(true);
    expect(buffer.getLine(1)?.translateToString(true)).toBe('XYZ');
    expect(buffer.getLine(2)?.isWrapped).toBe(false);
    expect(buffer.getLine(2)?.getCell(0)?.getWidth()).toBe(2);
    expect(buffer.getLine(2)?.getCell(1)?.getChars()).toBe('');
    expect(buffer.getLine(2)?.getCell(2)?.getChars()).toBe('e\u0301');
    expect(buffer.getLine(2)?.translateToString(true)).toBe('界e\u0301👩‍💻');
  } finally { engine.free(); }
});

test('programmatic selection addresses absolute buffer rows and spans wraps', () => {
  const selection = Object.create(SelectionManager.prototype) as any;
  selection.wasmTerm = { getDimensions: () => ({ cols: 8, rows: 3 }), getScrollbackLength: () => 20 };
  selection.terminal = { getViewportY: () => 10 };
  selection.selectionChangedEmitter = new EventEmitter();
  selection.dirtySelectionRows = new Set();
  selection.select(6, 12, 5);
  expect(selection.getSelectionPosition()).toEqual({ start: { x: 6, y: 12 }, end: { x: 3, y: 13 } });
  selection.select(0, 0, 2);
  expect(selection.getSelectionPosition()).toEqual({ start: { x: 0, y: 0 }, end: { x: 2, y: 0 } });
  selection.select(0, 0, 0);
  expect(selection.getSelectionPosition()).toBeUndefined();
});
