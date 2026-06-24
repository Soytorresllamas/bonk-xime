import { describe, it, expect } from 'vitest';
import { tileToScreen, isAdjacent, getOrthogonalNeighbors, TILE_W, TILE_H } from '../src/utils/isomath.js';

describe('tileToScreen', () => {
  it('origin tile (0,0) at offset 0,0 is 0,0', () => {
    expect(tileToScreen(0, 0)).toEqual({ x: 0, y: 0 });
  });
  it('col+1 moves right and down', () => {
    expect(tileToScreen(1, 0)).toEqual({ x: TILE_W / 2, y: TILE_H / 2 });
  });
  it('row+1 moves left and down', () => {
    expect(tileToScreen(0, 1)).toEqual({ x: -TILE_W / 2, y: TILE_H / 2 });
  });
  it('col+1, row+1 is directly below origin', () => {
    expect(tileToScreen(1, 1)).toEqual({ x: 0, y: TILE_H });
  });
  it('applies offset', () => {
    expect(tileToScreen(0, 0, 400, 200)).toEqual({ x: 400, y: 200 });
  });
});

describe('isAdjacent', () => {
  const origin = { col: 2, row: 2 };
  it('is adjacent orthogonally', () => {
    expect(isAdjacent(origin, { col: 3, row: 2 })).toBe(true);
    expect(isAdjacent(origin, { col: 1, row: 2 })).toBe(true);
    expect(isAdjacent(origin, { col: 2, row: 3 })).toBe(true);
    expect(isAdjacent(origin, { col: 2, row: 1 })).toBe(true);
  });
  it('is adjacent diagonally', () => {
    expect(isAdjacent(origin, { col: 3, row: 3 })).toBe(true);
    expect(isAdjacent(origin, { col: 1, row: 1 })).toBe(true);
  });
  it('is NOT adjacent when 2+ tiles away', () => {
    expect(isAdjacent(origin, { col: 4, row: 2 })).toBe(false);
    expect(isAdjacent(origin, { col: 0, row: 0 })).toBe(false);
  });
  it('is NOT adjacent to itself', () => {
    expect(isAdjacent(origin, { col: 2, row: 2 })).toBe(false);
  });
});

describe('getOrthogonalNeighbors', () => {
  it('returns 4 neighbors', () => {
    const ns = getOrthogonalNeighbors(2, 2);
    expect(ns).toHaveLength(4);
  });
  it('returns correct positions', () => {
    const ns = getOrthogonalNeighbors(2, 2);
    expect(ns).toContainEqual({ col: 1, row: 2 });
    expect(ns).toContainEqual({ col: 3, row: 2 });
    expect(ns).toContainEqual({ col: 2, row: 1 });
    expect(ns).toContainEqual({ col: 2, row: 3 });
  });
});
