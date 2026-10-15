import { buildMonthGrid } from './month-grid';

describe('buildMonthGrid', () => {
  it('starts weeks on Monday', () => {
    const grid = buildMonthGrid(new Date(2026, 9, 1));

    expect(grid.slice(0, 4)).toEqual([null, null, null, 1]);
    expect(grid.at(-1)).toBe(31);
  });

  it('has no leading blanks when the month starts on Monday', () => {
    expect(buildMonthGrid(new Date(2025, 11, 1))[0]).toBe(1);
  });

  it('puts a Sunday start in the last column', () => {
    const grid = buildMonthGrid(new Date(2026, 1, 1));

    expect(grid.indexOf(1)).toBe(6);
    expect(grid.at(-1)).toBe(28);
  });

  it('handles leap years', () => {
    expect(buildMonthGrid(new Date(2028, 1, 1)).at(-1)).toBe(29);
  });
});
