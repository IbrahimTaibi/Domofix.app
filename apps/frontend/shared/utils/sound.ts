export function playNotificationChime() {
  try {
    if (typeof document !== 'undefined' && document.visibilityState !== 'visible') {
      return; // avoid playing when tab is hidden
    }
    const AudioCtx = (window as any).AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    // Two quick tones for a pleasant chime
    osc.frequency.setValueAtTime(880, ctx.currentTime); // A5
    gain.gain.setValueAtTime(0.001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.06, ctx.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.2);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.22);
    setTimeout(() => { try { ctx.close(); } catch {} }, 300);
  } catch {
    // ignore audio errors (e.g., autoplay restrictions)
  }
}

export function playNotificationAudioFile() {
  try {
    const url = process.env.NEXT_PUBLIC_NOTIFICATION_SOUND_URL
    const maxMs = Number(process.env.NEXT_PUBLIC_NOTIFICATION_SOUND_MAX_DURATION_MS || '500')
    if (url && typeof Audio !== 'undefined') {
      const audio = new Audio(url)
      audio.volume = 1.0
      const stop = () => { try { audio.pause(); audio.currentTime = 0 } catch {} }
      audio.play().catch(() => {})
      setTimeout(stop, Math.max(0, Math.min(maxMs, 5000))) // hard cap at 5s
    } else {
      playNotificationChime()
    }
  } catch {
    playNotificationChime()
  }
}