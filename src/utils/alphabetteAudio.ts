import type { SavedCreation, WorkshopDefinition } from '../data/workshops';

export type AlphabetteAudioStatus = 'idle' | 'loading' | 'playing';

export interface AlphabetteAudioState {
  status: AlphabetteAudioStatus;
  targetId: string | null;
}

type AudioStateListener = (state: AlphabetteAudioState) => void;

export interface VoiceLike {
  name: string;
  lang: string;
  localService?: boolean;
  default?: boolean;
}

/**
 * Cleans emojis, markdown and typographic symbols so the French voice
 * reads smooth, warm, natural sentences with comfortable pauses.
 */
export function sanitizeTextForSpeech(raw: string): string {
  if (!raw) return '';

  let cleaned = raw
    // Strip pictographs, emojis and variation selectors
    .replace(/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE00}-\u{FE0F}\u{200D}]/gu, ' ')
    // Strip markdown bold/italic/headings if any
    .replace(/[*_#`~]+/g, ' ')
    // Common French abbreviations & symbols
    .replace(/\bn°\s*/gi, 'numéro ')
    .replace(/\s*&\s*/g, ' et ')
    .replace(/(\d+)\s*%/g, '$1 pour cent')
    // Bullets, arrows & middots -> gentle pauses
    .replace(/\s*[·•➔➜➤—–]\s*/g, ', ')
    .replace(/\s*->\s*/g, ', ')
    .replace(/[«»“”"]/g, ' ')
    // Paragraph breaks -> full stops for natural breathing pause
    .replace(/\n{2,}/g, '. ')
    .replace(/\n+/g, ', ')
    // Tidy repeated punctuation
    .replace(/\s+([,.;:!?])/g, '$1')
    .replace(/([.!?])\s*,+/g, '$1')
    .replace(/,\s*\./g, '.')
    .replace(/\.{2,}/g, '...')
    .replace(/\s{2,}/g, ' ')
    .trim();

  if (cleaned && !/[.!?…]$/.test(cleaned)) {
    cleaned += '.';
  }
  return cleaned;
}

/**
 * Splits cleaned text into natural, sentence-aligned segments (<= 190 chars)
 * to preserve natural French prosody and prevent Chrome's 15-second utterance cutoff bug.
 */
export function splitTextIntoSpeechChunks(text: string, maxChunkLength = 190): string[] {
  const cleaned = sanitizeTextForSpeech(text);
  if (!cleaned) return [];
  if (cleaned.length <= maxChunkLength) return [cleaned];

  const sentences = cleaned.match(/[^.!?…]+(?:[.!?…]+|$)/g) || [cleaned];
  const chunks: string[] = [];
  let current = '';

  const pushCurrent = () => {
    const trimmed = current.trim();
    if (trimmed) chunks.push(trimmed);
    current = '';
  };

  for (const rawSentence of sentences) {
    const sentence = rawSentence.trim();
    if (!sentence) continue;

    if (sentence.length > maxChunkLength) {
      pushCurrent();
      const clauses = sentence.split(/(?<=[,;:])\s+/);
      let sub = '';
      for (const clause of clauses) {
        if ((sub + ' ' + clause).trim().length <= maxChunkLength) {
          sub = (sub + ' ' + clause).trim();
        } else {
          if (sub) chunks.push(sub);
          if (clause.length <= maxChunkLength) {
            sub = clause;
          } else {
            const words = clause.split(/\s+/);
            let wordChunk = '';
            for (const w of words) {
              if ((wordChunk + ' ' + w).trim().length <= maxChunkLength) {
                wordChunk = (wordChunk + ' ' + w).trim();
              } else {
                if (wordChunk) chunks.push(wordChunk);
                wordChunk = w;
              }
            }
            sub = wordChunk;
          }
        }
      }
      if (sub) chunks.push(sub);
      continue;
    }

    if ((current + ' ' + sentence).trim().length <= maxChunkLength) {
      current = (current + ' ' + sentence).trim();
    } else {
      pushCurrent();
      current = sentence;
    }
  }

  pushCurrent();
  return chunks;
}

/**
 * Ranks available browser voices to select the most natural, warm French voice
 * (prioritizing Google's free built-in French voice on Chrome/Android, then
 * Natural/Neural/Enhanced voices, while avoiding robotic compact/eSpeak voices).
 */
export function selectBestFrenchVoice<T extends VoiceLike>(voices: T[]): T | null {
  if (!Array.isArray(voices) || voices.length === 0) return null;

  const frenchVoices = voices.filter((v) =>
    v.lang.toLowerCase().replace('_', '-').startsWith('fr')
  );
  if (frenchVoices.length === 0) return null;

  let best: T | null = null;
  let bestScore = -Infinity;

  for (const voice of frenchVoices) {
    const name = voice.name.toLowerCase();
    const lang = voice.lang.toLowerCase().replace('_', '-');
    let score = 0;

    // Prefer France French over other regional variants unless enhanced
    if (lang === 'fr-fr') score += 20;

    // Google built-in natural voice (Chrome desktop & Android — free, unlimited)
    if (name.includes('google')) score += 180;

    // Modern neural / natural / enhanced voices (Edge, Safari, macOS, iOS)
    if (/natural|neural|wavenet|online|enhanced|premium/.test(name)) score += 95;
    if (/denise|vivienne|eloise|henri|thomas|amelie|audrey|aurelie|hortense|celine|lea/.test(name)) {
      score += 55;
    }

    // Avoid robotic fallback engines when better voices exist
    if (/espeak|mbrola|compact|festival/.test(name)) score -= 80;

    if (voice.default) score += 5;

    if (score > bestScore) {
      bestScore = score;
      best = voice;
    }
  }

  return best;
}

/**
 * Builds complete, natural French narration for any creation type
 * (standard, visual, quiz, or multi-chapter interactive adventure).
 */
export function buildReadableCreationText(
  creation: SavedCreation,
  workshop?: WorkshopDefinition
): string {
  const parts: string[] = [creation.title];

  if (creation.subtitle && creation.subtitle.trim() !== creation.title.trim()) {
    parts.push(creation.subtitle);
  }

  const isQuiz =
    workshop?.mode === 'quiz' ||
    (Array.isArray(creation.quizQuestions) && creation.quizQuestions.length > 0);

  if (isQuiz && creation.quizQuestions && creation.quizQuestions.length > 0) {
    creation.quizQuestions.forEach((q, idx) => {
      const optsText = q.options
        .map((opt, optIdx) => `Choix ${String.fromCharCode(65 + optIdx)} : ${opt}`)
        .join('. ');
      parts.push(`Question ${idx + 1} : ${q.question}. ${optsText}.`);
    });
    return parts.join('. ');
  }

  const isInteractive =
    workshop?.mode === 'interactive' ||
    (Array.isArray(creation.interactiveHistory) && creation.interactiveHistory.length > 0);

  if (isInteractive && creation.interactiveHistory && creation.interactiveHistory.length > 0) {
    creation.interactiveHistory.forEach((chap) => {
      if (chap.choiceMade) {
        parts.push(`Votre choix : ${chap.choiceMade}`);
      }
      parts.push(`${chap.chapterTitle}. ${chap.content}`);
    });
    const last = creation.interactiveHistory[creation.interactiveHistory.length - 1];
    if (last?.choices && last.choices.length > 0) {
      parts.push(`Voici vos propositions pour continuer : ${last.choices.join(' ; ou bien : ')}.`);
    }
    return parts.join('. ');
  }

  if (creation.content) {
    parts.push(creation.content);
  }

  if (creation.tips && creation.tips.length > 0) {
    parts.push(`Les petits conseils de l’Atelier : ${creation.tips.join('. ')}`);
  }

  return parts.join('. ');
}

/**
 * Unified Alphabette Audio Player — 100% client-side, 100% gratuit, sans serveur, sans quota.
 * Utilise la voix française naturelle intégrée (Google français en priorité sur Chrome/Android,
 * voix Neural/Enhanced sur Edge/Apple) avec découpage fluide phrase par phrase anti-coupure.
 */
class AlphabetteAudioPlayer {
  private state: AlphabetteAudioState = { status: 'idle', targetId: null };
  private listeners = new Set<AudioStateListener>();
  private sessionId = 0;
  private cachedVoices: SpeechSynthesisVoice[] = [];
  private activeTimer: number | null = null;
  private keepAliveInterval: number | null = null;

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.refreshVoices();
      window.speechSynthesis.addEventListener?.('voiceschanged', () => {
        this.refreshVoices();
      });
    }
  }

  private refreshVoices(): SpeechSynthesisVoice[] {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return [];
    const list = window.speechSynthesis.getVoices();
    if (list && list.length > 0) {
      this.cachedVoices = list;
    }
    return this.cachedVoices;
  }

  private async ensureVoicesLoaded(timeoutMs = 350): Promise<SpeechSynthesisVoice[]> {
    const existing = this.refreshVoices();
    if (existing.length > 0) return existing;
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return [];

    return new Promise((resolve) => {
      let resolved = false;
      const done = () => {
        if (resolved) return;
        resolved = true;
        resolve(this.refreshVoices());
      };
      const onVoices = () => {
        if (window.speechSynthesis.getVoices().length > 0) {
          window.speechSynthesis.removeEventListener?.('voiceschanged', onVoices);
          done();
        }
      };
      window.speechSynthesis.addEventListener?.('voiceschanged', onVoices);
      window.setTimeout(() => {
        window.speechSynthesis.removeEventListener?.('voiceschanged', onVoices);
        done();
      }, timeoutMs);
    });
  }

  subscribe(listener: AudioStateListener): () => void {
    this.listeners.add(listener);
    listener(this.state);
    return () => {
      this.listeners.delete(listener);
    };
  }

  getState(): AlphabetteAudioState {
    return this.state;
  }

  private setState(next: AlphabetteAudioState) {
    this.state = next;
    for (const listener of this.listeners) {
      listener(next);
    }
  }

  private clearTimers() {
    if (this.activeTimer !== null && typeof window !== 'undefined') {
      window.clearTimeout(this.activeTimer);
      this.activeTimer = null;
    }
    if (this.keepAliveInterval !== null && typeof window !== 'undefined') {
      window.clearInterval(this.keepAliveInterval);
      this.keepAliveInterval = null;
    }
  }

  stop() {
    this.sessionId++;
    this.clearTimers();

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }

    this.setState({ status: 'idle', targetId: null });
  }

  async toggle(text: string, targetId = 'global'): Promise<void> {
    if (this.state.status !== 'idle' && this.state.targetId === targetId) {
      this.stop();
      return;
    }
    await this.play(text, targetId);
  }

  private speakChunk(
    chunk: string,
    voice: SpeechSynthesisVoice | null,
    currentSession: number
  ): Promise<boolean> {
    return new Promise((resolve) => {
      if (this.sessionId !== currentSession) {
        resolve(false);
        return;
      }

      const utterance = new SpeechSynthesisUtterance(chunk);
      utterance.lang = voice?.lang || 'fr-FR';
      utterance.rate = 0.93;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;
      if (voice) {
        utterance.voice = voice;
      }

      let finished = false;
      let started = false;

      const finish = (ok: boolean) => {
        if (finished) return;
        finished = true;
        if (this.activeTimer !== null) {
          window.clearTimeout(this.activeTimer);
          this.activeTimer = null;
        }
        resolve(ok);
      };

      utterance.onstart = () => {
        started = true;
      };
      utterance.onend = () => finish(true);
      utterance.onerror = () => finish(false);

      // Watchdog: avoid getting stuck if browser/device has no TTS engine
      this.activeTimer = window.setTimeout(() => {
        if (!started && !finished) {
          finish(false);
        }
      }, 2200);

      try {
        window.speechSynthesis.speak(utterance);
      } catch {
        finish(false);
      }
    });
  }

  async play(rawText: string, targetId = 'global'): Promise<void> {
    this.stop();
    const currentSession = this.sessionId;

    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      return;
    }

    const chunks = splitTextIntoSpeechChunks(rawText, 190);
    if (chunks.length === 0) return;

    // Immediate playing state (0 server latency)
    this.setState({ status: 'playing', targetId });

    const voices = await this.ensureVoicesLoaded(350);
    if (this.sessionId !== currentSession) return;

    const preferredVoice = selectBestFrenchVoice(voices);

    // Subtle keep-alive prevents Chrome background pause on long narrations
    this.keepAliveInterval = window.setInterval(() => {
      if (this.sessionId !== currentSession) return;
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }
    }, 5000);

    for (let i = 0; i < chunks.length; i++) {
      if (this.sessionId !== currentSession) return;

      const ok = await this.speakChunk(chunks[i], preferredVoice, currentSession);
      if (this.sessionId !== currentSession) return;
      if (!ok && i === 0 && voices.length === 0) {
        // Headless / no OS voices available: stop cleanly without hanging
        break;
      }

      // Gentle breathing pause between sentences
      if (i < chunks.length - 1) {
        await new Promise<void>((resolve) => {
          this.activeTimer = window.setTimeout(resolve, 110);
        });
      }
    }

    this.clearTimers();
    if (this.sessionId === currentSession) {
      this.setState({ status: 'idle', targetId: null });
    }
  }
}

export const alphabetteAudio = new AlphabetteAudioPlayer();
