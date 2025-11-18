// Singleton AudioContext instance (shared across all notifications)
// This prevents browser quota exhaustion (browsers limit to ~6 contexts)
let sharedAudioContext: AudioContext | null = null;

/**
 * Get or create the shared AudioContext instance
 * Implements singleton pattern to avoid browser quota exhaustion
 */
function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;

  const AudioCtx = (window as any).AudioContext || (window as any).webkitAudioContext;
  if (!AudioCtx) {
    console.warn('[Sound] AudioContext not available');
    return null;
  }

  // Create context if it doesn't exist
  if (!sharedAudioContext) {
    try {
      sharedAudioContext = new AudioCtx();
      console.log('[Sound] Created shared AudioContext');
    } catch (error) {
      console.error('[Sound] Failed to create AudioContext:', error);
      return null;
    }
  }

  // Resume context if it's suspended (common in browsers to save resources)
  if (sharedAudioContext.state === 'suspended') {
    sharedAudioContext.resume().catch((error) => {
      console.warn('[Sound] Failed to resume AudioContext:', error);
    });
  }

  return sharedAudioContext;
}

export function playNotificationChime() {
  try {
    const ctx = getAudioContext();
    if (!ctx) {
      console.warn('[Sound] AudioContext not available');
      return;
    }

    console.log('[Sound] Playing notification chime');
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
    // Note: We no longer close the context - it's reused for future notifications
  } catch (error) {
    console.error('[Sound] Failed to play notification chime:', error);
  }
}

export function playNotificationAudioFile() {
  try {
    const url = process.env.NEXT_PUBLIC_NOTIFICATION_SOUND_URL;
    const maxMs = Number(process.env.NEXT_PUBLIC_NOTIFICATION_SOUND_MAX_DURATION_MS || '500');
    const gainFactorRaw = Number(process.env.NEXT_PUBLIC_NOTIFICATION_SOUND_GAIN || '1.6');
    const gainFactor = Number.isFinite(gainFactorRaw) ? Math.max(0.1, Math.min(gainFactorRaw, 4)) : 1.6;

    if (url && typeof Audio !== 'undefined') {
      console.log('[Sound] Playing notification audio file:', url);
      const audio = new Audio(url);
      audio.crossOrigin = 'anonymous';
      audio.volume = 1.0;

      const ctx = getAudioContext();
      let source: MediaElementAudioSourceNode | null = null;

      if (ctx) {
        try {
          source = ctx.createMediaElementSource(audio);
          const gain = ctx.createGain();
          gain.gain.setValueAtTime(gainFactor, ctx.currentTime);
          source.connect(gain);
          gain.connect(ctx.destination);
        } catch (error) {
          console.warn('[Sound] Failed to create audio context:', error);
        }
      }

      const stop = () => {
        try {
          audio.pause();
          audio.currentTime = 0;
          // Disconnect source to prevent memory leaks
          if (source && source.disconnect) {
            source.disconnect();
          }
          // Clear src to release audio data
          audio.src = '';
        } catch {}
      };

      audio.play().catch((error) => {
        console.error('[Sound] Failed to play audio file:', error);
      });

      setTimeout(stop, Math.max(0, Math.min(maxMs, 5000))); // hard cap at 5s
    } else {
      console.log('[Sound] No audio URL configured, falling back to chime');
      playNotificationChime();
    }
  } catch (error) {
    console.error('[Sound] Error in playNotificationAudioFile:', error);
    playNotificationChime();
  }
}