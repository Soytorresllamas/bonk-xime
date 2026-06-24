import { BLOCK_TYPES } from './blocks.js';

const WAVE_TIERS = [
  { maxWave: 5,        timer: 60, gridW: 5, gridH: 4, types: ['wood', 'stone'] },
  { maxWave: 15,       timer: 45, gridW: 6, gridH: 5, types: ['wood', 'stone', 'iron', 'doge', 'trap'] },
  { maxWave: 29,       timer: 30, gridW: 7, gridH: 5, types: ['wood', 'stone', 'iron', 'doge', 'trap', 'diamond'] },
  { maxWave: Infinity, timer: 25, gridW: 7, gridH: 6, types: ['wood', 'stone', 'iron', 'doge', 'trap', 'diamond'] },
];

export function isDogWave(waveNum) {
  return waveNum >= 1 && waveNum % 10 === 0;
}

export function getWaveTier(waveNum) {
  return WAVE_TIERS.find(t => waveNum <= t.maxWave);
}

export function generateWave(waveNum) {
  if (isDogWave(waveNum)) {
    const blocks = [];
    for (let row = 0; row < 4; row++)
      for (let col = 0; col < 5; col++)
        blocks.push({ col, row, type: 'doge' });
    return { blocks, timer: 30, gridW: 5, gridH: 4, isDoge: true };
  }

  const tier = getWaveTier(waveNum);
  const blocks = [];
  for (let row = 0; row < tier.gridH; row++)
    for (let col = 0; col < tier.gridW; col++)
      blocks.push({ col, row, type: tier.types[Math.floor(Math.random() * tier.types.length)] });

  return { blocks, timer: tier.timer, gridW: tier.gridW, gridH: tier.gridH, isDoge: false };
}
