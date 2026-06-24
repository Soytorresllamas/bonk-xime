import { describe, it, expect, beforeEach } from 'vitest';
import { ScoreSystem } from '../src/systems/ScoreSystem.js';

describe('ScoreSystem', () => {
  let s;
  beforeEach(() => { s = new ScoreSystem(); });

  it('starts at 0 with multiplier 1', () => {
    expect(s.score).toBe(0); expect(s.multiplier).toBe(1);
  });

  it('addBlockScore: wood at wave 1 = 10', () => {
    const earned = s.addBlockScore('wood', 1);
    expect(earned).toBe(10); expect(s.score).toBe(10);
  });

  it('addBlockScore: stone at wave 5 = 120 (hp:2 * 10 * 5 + scoreBonus:20)', () => {
    const earned = s.addBlockScore('stone', 5);
    expect(earned).toBe(120); expect(s.score).toBe(120);
  });

  it('addBlockScore: diamond at wave 1 = 50 (hp:5 * 10 * 1)', () => {
    const earned = s.addBlockScore('diamond', 1);
    expect(earned).toBe(50);
  });

  it('multiplier doubles earned points', () => {
    s.activateMultiplier(2, 99999);
    const earned = s.addBlockScore('wood', 1);
    expect(earned).toBe(20);
  });

  it('addWaveBonus returns 500 when time > 15', () => {
    const bonus = s.addWaveBonus(20);
    expect(bonus).toBe(500); expect(s.score).toBe(500);
  });

  it('addWaveBonus returns 0 when time <= 15', () => {
    const bonus = s.addWaveBonus(15);
    expect(bonus).toBe(0); expect(s.score).toBe(0);
  });

  it('addBlockScore throws on unknown type', () => {
    expect(() => s.addBlockScore('banana', 1)).toThrow('Unknown block type: banana');
  });

  it('reset clears score and multiplier', () => {
    s.addBlockScore('wood', 1); s.activateMultiplier(2, 99999);
    s.reset();
    expect(s.score).toBe(0); expect(s.multiplier).toBe(1);
  });
});
