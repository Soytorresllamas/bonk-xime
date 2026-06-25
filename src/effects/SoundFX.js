let _ctx = null;
function ctx() {
  if (!_ctx) _ctx = new (window.AudioContext || window.webkitAudioContext)();
  return _ctx;
}

function play(freq, endFreq, duration, type = 'square', volume = 0.25) {
  const c = ctx();
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.connect(gain); gain.connect(c.destination);
  osc.type = type;
  osc.frequency.setValueAtTime(freq, c.currentTime);
  osc.frequency.exponentialRampToValueAtTime(endFreq, c.currentTime + duration);
  gain.gain.setValueAtTime(volume, c.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + duration);
  osc.start(); osc.stop(c.currentTime + duration);
}

export const SoundFX = {
  bonk()    { play(220, 80,  0.12, 'square', 0.2); },
  destroy() { play(320, 60,  0.18, 'sawtooth', 0.25); },
  chain()   { play(440, 110, 0.22, 'square', 0.3); },
  power()   { play(600, 50,  0.35, 'sawtooth', 0.4); },
  noEnergy(){ play(120, 100, 0.08, 'sine', 0.15); },
  step()    { play(200, 160, 0.05, 'sine', 0.04); },
};
