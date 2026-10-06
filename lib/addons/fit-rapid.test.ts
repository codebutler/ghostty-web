import { expect, test } from 'bun:test';
import { FitAddon } from './fit';
import type { ITerminalCore } from '../interfaces';

test('successive fits honor new sizes immediately while nested fits are guarded', () => {
  const fit = new FitAddon();
  let proposed = { cols: 80, rows: 24 };
  const calls: number[] = [];
  const terminal = {
    cols: 80, rows: 20,
    resize(cols: number, rows: number) {
      // Nested fitting must not recurse even before dimensions are committed.
      fit.fit();
      this.cols = cols;
      this.rows = rows;
      calls.push(rows);
    },
  };
  fit.activate(terminal as unknown as ITerminalCore);
  fit.proposeDimensions = () => proposed;
  fit.fit();
  proposed = { cols: 80, rows: 22 };
  fit.fit();
  proposed = { cols: 80, rows: 24 };
  fit.fit();
  fit.fit();
  expect(calls).toEqual([24, 22, 24]);
  expect(terminal.rows).toBe(24);
  fit.dispose();
});
