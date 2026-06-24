import { describe, it, expect } from 'vitest';
import { BLOCK_TYPES, BLOCK_TYPE_KEYS } from '../src/config/blocks.js';

const REQUIRED_FIELDS = ['hp', 'color', 'topColor', 'energy', 'memeText'];

describe('BLOCK_TYPES', () => {
  it('defines all 6 block types', () => {
    expect(BLOCK_TYPE_KEYS).toEqual(['wood', 'stone', 'iron', 'doge', 'trap', 'diamond']);
  });

  BLOCK_TYPE_KEYS.forEach(key => {
    it(`${key} has all required fields`, () => {
      REQUIRED_FIELDS.forEach(field => {
        expect(BLOCK_TYPES[key]).toHaveProperty(field);
      });
    });

    it(`${key} has hp >= 1`, () => {
      expect(BLOCK_TYPES[key].hp).toBeGreaterThanOrEqual(1);
    });

    it(`${key} energy gain >= 10`, () => {
      expect(BLOCK_TYPES[key].energy).toBeGreaterThanOrEqual(10);
    });
  });

  it('doge gives 50 energy', () => { expect(BLOCK_TYPES.doge.energy).toBe(50); });
  it('diamond has 5 hp', () => { expect(BLOCK_TYPES.diamond.hp).toBe(5); });
  it('trap has timerPenalty of 2', () => { expect(BLOCK_TYPES.trap.timerPenalty).toBe(2); });
  it('diamond has scoreMultiplier of 2 and duration 10000', () => {
    expect(BLOCK_TYPES.diamond.scoreMultiplier).toBe(2);
    expect(BLOCK_TYPES.diamond.multiplierDuration).toBe(10000);
  });
});
