import { BLOCK_TYPES } from '../config/blocks.js';

export class ScoreSystem {
  constructor() {
    this.score = 0;
    this.multiplier = 1;
    this._multiplierTimer = null;
  }

  // Returns points earned (after multiplier). Throws on unknown block type.
  addBlockScore(blockType, waveNum) {
    const def = BLOCK_TYPES[blockType];
    if (!def) throw new Error(`Unknown block type: ${blockType}`);
    const base = (def.hp * 10 * waveNum) + (def.scoreBonus ?? 0);
    const earned = base * this.multiplier;
    this.score += earned;
    return earned;
  }

  activateMultiplier(value, duration) {
    this.multiplier = value;
    clearTimeout(this._multiplierTimer);
    this._multiplierTimer = setTimeout(() => { this.multiplier = 1; }, duration);
  }

  // Returns bonus added (500 if timeRemaining > 15, else 0).
  addWaveBonus(timeRemainingSeconds) {
    if (timeRemainingSeconds > 15) {
      this.score += 500;
      return 500;
    }
    return 0;
  }

  getBest() {
    try {
      return parseInt(globalThis.localStorage?.getItem('bonk_best') ?? '0', 10) || 0;
    } catch { return 0; }
  }

  saveBest() {
    try {
      const top5 = this.getTop5();
      top5.push(this.score);
      top5.sort((a, b) => b - a);
      const trimmed = top5.slice(0, 5);
      globalThis.localStorage?.setItem('bonk_best', String(trimmed[0] ?? 0));
      globalThis.localStorage?.setItem('bonk_top5', JSON.stringify(trimmed));
    } catch { /* no-op in non-browser */ }
  }

  getTop5() {
    try {
      return JSON.parse(globalThis.localStorage?.getItem('bonk_top5') ?? '[]')
        .map(Number).filter(n => !isNaN(n));
    } catch { return []; }
  }

  reset() {
    this.score = 0;
    this.multiplier = 1;
    clearTimeout(this._multiplierTimer);
    this._multiplierTimer = null;
  }
}
