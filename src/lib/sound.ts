/**
 * Web Audio API synthesizer for gamified kid feedback
 * Zero dependencies, zero external network requests, ultra low-latency
 */

let audioCtx: AudioContext | null = null;
let soundEnabled = true;

export function setSoundEnabled(enabled: boolean) {
  soundEnabled = enabled;
}

export function isSoundEnabled() {
  return soundEnabled;
}

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

/**
 * Play a high-pitched metallic coin chime when saving money or completing a chore
 */
export function playCoinSound() {
  if (!soundEnabled) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    const now = ctx.currentTime;

    osc.frequency.setValueAtTime(987.77, now); // B5
    osc.frequency.setValueAtTime(1318.51, now + 0.08); // E6

    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.35);
  } catch (e) {
    console.error('Audio play error:', e);
  }
}

/**
 * Play an ascending fanfare when reaching a milestone (25%, 50%, 75%, 100%) or badge unlock
 */
export function playMilestoneFanfare() {
  if (!soundEnabled) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    const now = ctx.currentTime;

    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const startTime = now + idx * 0.1;

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0.18, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.28);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + 0.3);
    });
  } catch (e) {
    console.error('Audio play error:', e);
  }
}

/**
 * Play a victory sound when 100% of a goal is reached
 */
export function playVictorySound() {
  if (!soundEnabled) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51];
    const now = ctx.currentTime;

    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const startTime = now + idx * 0.12;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0.2, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.4);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + 0.45);
    });
  } catch (e) {
    console.error('Audio play error:', e);
  }
}

/**
 * Play a rocket thruster rumble and ascending pitch launch sound effect
 */
export function playRocketLaunchSound() {
  if (!soundEnabled) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    // Thruster low rumble (synthesized using modulated low frequency oscillator)
    const rumbleOsc = ctx.createOscillator();
    const rumbleGain = ctx.createGain();
    rumbleOsc.type = 'sawtooth';
    rumbleOsc.frequency.setValueAtTime(65, now);
    rumbleOsc.frequency.exponentialRampToValueAtTime(220, now + 2.2);

    rumbleGain.gain.setValueAtTime(0.05, now);
    rumbleGain.gain.linearRampToValueAtTime(0.25, now + 0.6);
    rumbleGain.gain.exponentialRampToValueAtTime(0.01, now + 2.5);

    rumbleOsc.connect(rumbleGain);
    rumbleGain.connect(ctx.destination);

    rumbleOsc.start(now);
    rumbleOsc.stop(now + 2.6);

    // Whistling ascending rocket burn
    const jetOsc = ctx.createOscillator();
    const jetGain = ctx.createGain();
    jetOsc.type = 'triangle';
    jetOsc.frequency.setValueAtTime(180, now + 0.3);
    jetOsc.frequency.exponentialRampToValueAtTime(1400, now + 2.0);

    jetGain.gain.setValueAtTime(0.01, now + 0.3);
    jetGain.gain.linearRampToValueAtTime(0.18, now + 1.2);
    jetGain.gain.exponentialRampToValueAtTime(0.001, now + 2.4);

    jetOsc.connect(jetGain);
    jetGain.connect(ctx.destination);

    jetOsc.start(now + 0.3);
    jetOsc.stop(now + 2.5);
  } catch (e) {
    console.error('Rocket audio error:', e);
  }
}
