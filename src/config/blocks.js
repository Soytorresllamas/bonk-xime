export const BLOCK_TYPES = {
  wood: {
    hp: 1, color: 0x8B4513, topColor: 0xA0522D,
    energy: 10, memeText: 'ez bonk',
  },
  stone: {
    hp: 2, color: 0x666677, topColor: 0x9999aa,
    energy: 10, scoreBonus: 20, memeText: 'stonks',
  },
  iron: {
    hp: 3, color: 0x505060, topColor: 0x8888a0,
    energy: 10, memeText: 'much iron, very hard',
  },
  doge: {
    hp: 1, color: 0xB8860B, topColor: 0xDAA520,
    energy: 50, memeText: 'wow such energy',
  },
  trap: {
    hp: 1, color: 0x991100, topColor: 0xff2200,
    energy: 10, timerPenalty: 2, memeText: 'BONK TO THE JAIL',
  },
  diamond: {
    hp: 5, color: 0x007799, topColor: 0x00ccff,
    energy: 10, scoreMultiplier: 2, multiplierDuration: 10000,
    memeText: 'to the moon',
  },
};

export const BLOCK_TYPE_KEYS = Object.keys(BLOCK_TYPES);
