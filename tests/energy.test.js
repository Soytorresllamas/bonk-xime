import { describe, it, expect } from 'vitest';
import { EnergySystem, CHAIN_COST, POWER_COST } from '../src/systems/EnergySystem.js';

describe('EnergySystem', () => {
  it('starts at 0', () => { expect(new EnergySystem().current).toBe(0); });

  it('gain increases current', () => {
    const e = new EnergySystem();
    e.gain(10); expect(e.current).toBe(10);
  });

  it('gain is capped at max', () => {
    const e = new EnergySystem(100);
    e.gain(60); e.gain(60); expect(e.current).toBe(100);
  });

  it('canAfford true when enough', () => {
    const e = new EnergySystem(); e.gain(40);
    expect(e.canAfford(40)).toBe(true);
  });

  it('canAfford false when not enough', () => {
    const e = new EnergySystem(); e.gain(39);
    expect(e.canAfford(40)).toBe(false);
  });

  it('spend deducts and returns true when affordable', () => {
    const e = new EnergySystem(); e.gain(60);
    expect(e.spend(40)).toBe(true);
    expect(e.current).toBe(20);
  });

  it('spend returns false and leaves current unchanged when not affordable', () => {
    const e = new EnergySystem(); e.gain(30);
    expect(e.spend(40)).toBe(false);
    expect(e.current).toBe(30);
  });

  it('fraction is current/max', () => {
    const e = new EnergySystem(100); e.gain(50);
    expect(e.fraction).toBe(0.5);
  });

  it('reset sets current to 0', () => {
    const e = new EnergySystem(); e.gain(80); e.reset();
    expect(e.current).toBe(0);
  });

  it('CHAIN_COST is 40 and POWER_COST is 80', () => {
    expect(CHAIN_COST).toBe(40);
    expect(POWER_COST).toBe(80);
  });
});
