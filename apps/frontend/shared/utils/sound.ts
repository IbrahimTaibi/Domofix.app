export function playNotificationChime() {
  try {
    if (typeof document !== 'undefined' && document.visibilityState !== 'visible') {
      return;
    }
    const AudioCtx = (window as any).AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    gain.gain.setValueAtTime(0.001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.2, ctx.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.2);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.22);
    setTimeout(() => { try { ctx.close(); } catch {} }, 300);
  } catch {
  }
}

export function playNotificationAudioFile() {
  try {
    const url = process.env.NEXT_PUBLIC_NOTIFICATION_SOUND_URL
    const maxMs = Number(process.env.NEXT_PUBLIC_NOTIFICATION_SOUND_MAX_DURATION_MS || '500')
    const gainFactorRaw = Number(process.env.NEXT_PUBLIC_NOTIFICATION_SOUND_GAIN || '1.6')
    const gainFactor = Number.isFinite(gainFactorRaw) ? Math.max(0.1, Math.min(gainFactorRaw, 4)) : 1.6
    if (url && typeof Audio !== 'undefined') {
      const audio = new Audio(url)
      audio.crossOrigin = 'anonymous'
      audio.volume = 1.0
      const AudioCtx = (window as any).AudioContext || (window as any).webkitAudioContext
      const ctx = AudioCtx ? new AudioCtx() : null
      let stopCtx = () => {}
      if (ctx) {
        try {
          const source = ctx.createMediaElementSource(audio)
          const gain = ctx.createGain()
          gain.gain.setValueAtTime(gainFactor, ctx.currentTime)
          source.connect(gain)
          gain.connect(ctx.destination)
          stopCtx = () => { try { ctx.close() } catch {} }
        } catch {}
      }
      const stop = () => { try { audio.pause(); audio.currentTime = 0 } catch {} ; stopCtx() }
      audio.play().catch(() => {})
      setTimeout(stop, Math.max(0, Math.min(maxMs, 5000))) // hard cap at 5s
    } else {
      playNotificationChime()
    }
  } catch {
    playNotificationChime()
  }
}