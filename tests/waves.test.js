import { describe, it, expect } from 'vitest';
import { isDogWave, getWaveTier, generateWave } from '../src/config/waves.js';

describe('isDogWave', () => {
  it('returns true for multiples of 10', () => {
    [10, 20, 30, 100].forEach(n => expect(isDogWave(n)).toBe(true));
  });
  it('returns false for non-multiples', () => {
    [1, 5, 9, 11, 15].forEach(n => expect(isDogWave(n)).toBe(false));
  });
});

describe('getWaveTier', () => {
  it('waves 1-5 get tier with timer 60 and grid 5x4', () => {
    const t = getWaveTier(1);
    expect(t.timer).toBe(60); expect(t.gridW).toBe(5); expect(t.gridH).toBe(4);
    expect(getWaveTier(5).timer).toBe(60);
  });
  it('waves 6-15 get timer 45', () => {
    expect(getWaveTier(6).timer).toBe(45);
    expect(getWaveTier(15).timer).toBe(45);
  });
  it('waves 16-29 get timer 30', () => {
    expect(getWaveTier(16).timer).toBe(30);
    expect(getWaveTier(29).timer).toBe(30);
  });
  it('wave 30+ gets timer 25', () => {
    expect(getWaveTier(30).timer).toBe(25);
    expect(getWaveTier(999).timer).toBe(25);
  });
});

describe('generateWave', () => {
  it('wave 1: returns 20 blocks (5x4), timer 60, isDoge false', () => {
    const w = generateWave(1);
    expect(w.blocks).toHaveLength(20);
    expect(w.timer).toBe(60);
    expect(w.gridW).toBe(5); expect(w.gridH).toBe(4);
    expect(w.isDoge).toBe(false);
  });

  it('wave 1: only uses wood and stone', () => {
    for (let i = 0; i < 20; i++) {
      const w = generateWave(1);
      w.blocks.forEach(b => expect(['wood', 'stone']).toContain(b.type));
    }
  });

  it('wave 10 (doge): all blocks are doge, timer 30, grid 5x4, isDoge true', () => {
    const w = generateWave(10);
    expect(w.isDoge).toBe(true);
    expect(w.timer).toBe(30);
    expect(w.gridW).toBe(5); expect(w.gridH).toBe(4);
    expect(w.blocks).toHaveLength(20);
    w.blocks.forEach(b => expect(b.type).toBe('doge'));
  });

  it('wave 20 (doge) is also all doge', () => {
    const w = generateWave(20);
    w.blocks.forEach(b => expect(b.type).toBe('doge'));
  });

  it('each block has col, row, type', () => {
    const w = generateWave(1);
    w.blocks.forEach(b => {
      expect(b).toHaveProperty('col');
      expect(b).toHaveProperty('row');
      expect(b).toHaveProperty('type');
    });
  });
});
