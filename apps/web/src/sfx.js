let context;
export function playSfx(kind, volume = 0.4) {
  if (!volume) return;
  try {
    context ||= new (window.AudioContext || window.webkitAudioContext)();
    context.resume();
    const notes = {
      click: [420],
      book: [640, 880, 1100],
      correct: [523, 659, 784],
      wrong: [220, 164],
      reward: [523, 659, 784, 1046],
    }[kind] || [420];
    notes.forEach((frequency, index) => {
      const oscillator = context.createOscillator(),
        gain = context.createGain();
      const start = context.currentTime + index * 0.09;
      oscillator.type = 'sine';
      oscillator.frequency.value = frequency;
      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(volume * 0.16, start + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.2);
      oscillator.connect(gain);
      gain.connect(context.destination);
      oscillator.start(start);
      oscillator.stop(start + 0.21);
    });
  } catch {
    /* Gameplay remains usable without Web Audio support. */
  }
}
