import { expect, test } from 'bun:test';
import { fileURLToPath } from 'node:url';
import { Ghostty } from './ghostty';

test('loads native WASM from the source default, a file URL, and a local path', async () => {
  const wasm = new URL('../ghostty-vt.wasm', import.meta.url);
  for (const location of [undefined, wasm.href, fileURLToPath(wasm)]) {
    const engine = await Ghostty.load(location);
    const terminal = engine.createTerminal(20, 5);
    try {
      terminal.write('\x1b[5n');
      expect(terminal.readResponse()).toBe('\x1b[0n');
    } finally {
      terminal.free();
    }
  }
});

test('reports a missing explicitly selected WASM file', async () => {
  await expect(Ghostty.load('/nonexistent/ghostty-test.wasm')).rejects.toMatchObject({
    code: 'ENOENT',
  });
});
