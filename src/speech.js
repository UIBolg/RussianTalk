let activeSequenceStop = null;

// Slower than the browser's default (1) so words are easier to catch while
// learning; and a short silent gap between sentences in a full-dialog
// playback, so one sentence doesn't run straight into the next.
const SPEECH_RATE = 0.8;
const PAUSE_BETWEEN_SENTENCES_MS = 700;

// A lower pitch AND a slower pace for the 'left' role (the other person in
// a dialogue), so the two roles sound different even when there's only one
// Russian voice installed on the visitor's device - which is the common
// case (see pickVoice below for why a *different installed voice* can't be
// counted on). Two separate levers on purpose: some browsers render
// Russian speech through a network voice that quietly ignores pitch
// changes (a real, observed gap - it was tried alone first and a live
// test showed no audible difference), so rate carries the difference on
// its own if pitch doesn't take effect, instead of the feature silently
// doing nothing again.
const LEFT_ROLE_PITCH = 0.4;
const DEFAULT_PITCH = 1;
const LEFT_ROLE_RATE = 0.62;

export function isSpeechSupported() {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}

let cachedVoices = null;

function loadVoices() {
  if (!isSpeechSupported()) return [];
  const voices = window.speechSynthesis.getVoices();
  if (voices.length) cachedVoices = voices;
  return cachedVoices || voices;
}

if (isSpeechSupported()) {
  // Voices often aren't ready on the very first call - the browser loads
  // them asynchronously and fires this once they're available.
  window.speechSynthesis.addEventListener('voiceschanged', () => {
    cachedVoices = window.speechSynthesis.getVoices();
  });
}

// The Web Speech API doesn't expose a voice's gender, so a name match
// (e.g. "Pavel," "Dmitri") is tried first for an obviously male-sounding
// voice. But most real devices that DO have a second Russian voice give
// it a generic name with no gender hint at all (e.g. two voices both just
// called "Google русский" or numbered "Russian 1"/"Russian 2") - a name
// match alone missed those and left both roles on the same voice, which a
// live check confirmed sounds identical. So if no name matches, this
// falls back to simply using any other installed Russian voice, gender
// hint or not - a genuinely different voice model always sounds
// meaningfully different, which beats pitch/rate tweaks on the same voice.
const MALE_VOICE_NAME_HINTS = [
  'male', 'yuri', 'yury', 'pavel', 'dmitri', 'dmitry', 'ivan', 'sergei', 'sergey',
  'boris', 'nikolai', 'mikhail', 'aleksei', 'alexei', 'maxim',
];

function findAlternateVoice(lang) {
  const langPrefix = lang.slice(0, 2).toLowerCase();
  const voices = loadVoices().filter((v) => v.lang?.toLowerCase().startsWith(langPrefix));
  if (voices.length < 2) return undefined; // nothing to switch to - only one Russian voice available
  const male = voices.find((v) => MALE_VOICE_NAME_HINTS.some((hint) => v.name.toLowerCase().includes(hint)));
  if (male) return male;
  const defaultVoice = voices.find((v) => v.default) || voices[0];
  return voices.find((v) => v !== defaultVoice);
}

// 'left' is always the other person in a dialogue (waiter, cashier, staff,
// friend...); 'right' is always "You," the learner's own line. 'right',
// and anything with no side at all (a saved flashcard, a popover word
// with no line context), always gets the default voice and pitch -
// unchanged from before this feature existed.
function pickVoice(lang, side) {
  if (side !== 'left') return undefined;
  return findAlternateVoice(lang);
}

function pickPitch(side) {
  return side === 'left' ? LEFT_ROLE_PITCH : DEFAULT_PITCH;
}

function pickRate(side) {
  return side === 'left' ? LEFT_ROLE_RATE : SPEECH_RATE;
}

function stopActiveSequence() {
  if (activeSequenceStop) {
    const stop = activeSequenceStop;
    activeSequenceStop = null;
    stop();
  }
}

export function speak(text, { lang = 'ru-RU', side, rate } = {}) {
  if (!isSpeechSupported()) return;
  stopActiveSequence();
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = lang;
  utterance.rate = rate ?? pickRate(side);
  utterance.pitch = pickPitch(side);
  const voice = pickVoice(lang, side);
  if (voice) utterance.voice = voice;
  window.speechSynthesis.speak(utterance);
}

export function stopSpeaking() {
  stopActiveSequence();
  if (isSpeechSupported()) window.speechSynthesis.cancel();
}

// Reads a list of { text, side } items one after another, moving to the
// next only once the previous one finishes - side (see pickVoice above)
// picks the right-sounding voice for each line, the same way speak() does.
// Returns a stop() function the caller can use to cancel it early.
// onStepStart(index) fires right before each item starts; onDone() fires
// exactly once, whether playback finished naturally, was stopped
// explicitly, or was interrupted by another speak()/speakSequence() call
// elsewhere in the app. An explicit `rate` (both here and in speak())
// overrides the normal side-based rate entirely - used by Stories' read-
// aloud, which has no dialogue "side" at all and instead shares whatever
// speed the student picked in 1000 Words' Listen mode
// (progress.settings.speechRate).
export function speakSequence(items, { lang = 'ru-RU', rate, onStepStart, onDone } = {}) {
  if (!isSpeechSupported() || !items.length) {
    onDone?.();
    return () => {};
  }
  stopActiveSequence();
  window.speechSynthesis.cancel();

  let finished = false;
  let index = 0;
  let pauseTimer = null;

  function finish() {
    if (finished) return;
    finished = true;
    if (pauseTimer) clearTimeout(pauseTimer);
    if (activeSequenceStop === stop) activeSequenceStop = null;
    onDone?.();
  }

  function playNext() {
    if (finished) return;
    if (index >= items.length) {
      finish();
      return;
    }
    const i = index;
    onStepStart?.(i);
    const item = items[i];
    const utterance = new SpeechSynthesisUtterance(item.text);
    utterance.lang = lang;
    utterance.rate = rate ?? pickRate(item.side);
    utterance.pitch = pickPitch(item.side);
    const voice = pickVoice(lang, item.side);
    if (voice) utterance.voice = voice;
    utterance.onend = () => {
      if (finished) return;
      index += 1;
      // A brief silent gap before the next sentence, instead of running
      // straight into it, so each one reads as a separate beat.
      pauseTimer = setTimeout(() => {
        pauseTimer = null;
        playNext();
      }, PAUSE_BETWEEN_SENTENCES_MS);
    };
    utterance.onerror = () => finish();
    window.speechSynthesis.speak(utterance);
  }

  function stop() {
    if (finished) return;
    finish();
    window.speechSynthesis.cancel();
  }

  activeSequenceStop = stop;
  playNext();
  return stop;
}

// Hands-free "Listen" loop for the 1000 Words feature: plays a list of
// { ru, en } words, each as Russian -> 0.9s pause -> English (optional,
// parenthetical notes stripped) -> 0.7s pause -> Russian again -> 1.5s
// pause, then the next word. Built as its own function, per the "build
// playback features as another small function in speech.js" rule above,
// because this needs a configurable rate and several different pause
// lengths within one item - neither speak() nor speakSequence() support
// that; everything still goes through the same SpeechSynthesisUtterance
// primitives, and starting this always stops any other speak()/
// speakSequence() in progress, the same "only one voice at a time" rule.
//
// Returns a controller: stop(), pause(), resume(), skip() (next word),
// back() (previous word). Pause/resume call the browser's own
// speechSynthesis.pause()/resume() for whichever utterance is mid-flight,
// and additionally hold off starting the next step during a silent gap -
// but pause/resume on the Web Speech API is known to behave inconsistently
// across browsers (the same honest limitation noted elsewhere in this
// file: this sandbox can't verify by listening, only by inspecting the
// calls made).
export function speakWordDrill(words, { rate = 1, includeEnglish = true, onStepStart, onDone } = {}) {
  const noop = () => {};
  if (!isSpeechSupported() || !words.length) {
    onDone?.();
    return { stop: noop, pause: noop, resume: noop, skip: noop, back: noop };
  }
  stopActiveSequence();
  window.speechSynthesis.cancel();

  let finished = false;
  let index = 0;
  let gapTimer = null;
  let pauseWaiters = null; // null = not paused; otherwise a pending promise's resolver

  function waitGate() {
    return pauseWaiters ? pauseWaiters.promise : Promise.resolve();
  }

  function wait(ms) {
    return new Promise((resolve) => {
      gapTimer = setTimeout(() => {
        gapTimer = null;
        resolve();
      }, ms);
    });
  }

  function speakOne(text, lang) {
    return new Promise((resolve) => {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang;
      utterance.rate = rate;
      utterance.onend = resolve;
      utterance.onerror = resolve;
      window.speechSynthesis.speak(utterance);
    });
  }

  function finish() {
    if (finished) return;
    finished = true;
    if (gapTimer) clearTimeout(gapTimer);
    if (activeSequenceStop === stop) activeSequenceStop = null;
    onDone?.();
  }

  async function runStep(i) {
    onStepStart?.(i);
    const { ru, en } = words[i];
    const cleanEn = (en || '').replace(/\([^)]*\)/g, '').trim();

    await speakOne(ru, 'ru-RU');
    await waitGate();
    if (finished || i !== index) return;
    await wait(900);
    await waitGate();
    if (finished || i !== index) return;

    if (includeEnglish && cleanEn) {
      await speakOne(cleanEn, 'en-US');
      await waitGate();
      if (finished || i !== index) return;
    }
    await wait(700);
    await waitGate();
    if (finished || i !== index) return;

    await speakOne(ru, 'ru-RU');
    await waitGate();
    if (finished || i !== index) return;
    await wait(1500);
    await waitGate();
    if (finished || i !== index) return;

    index += 1;
    play();
  }

  function play() {
    if (finished) return;
    if (index >= words.length) {
      finish();
      return;
    }
    runStep(index);
  }

  function stop() {
    if (finished) return;
    finish();
    window.speechSynthesis.cancel();
  }

  function pause() {
    if (finished || pauseWaiters) return;
    window.speechSynthesis.pause();
    let resolveFn;
    const promise = new Promise((resolve) => {
      resolveFn = resolve;
    });
    pauseWaiters = { promise, resolve: resolveFn };
  }

  function resume() {
    if (finished || !pauseWaiters) return;
    window.speechSynthesis.resume();
    pauseWaiters.resolve();
    pauseWaiters = null;
  }

  function jumpTo(i) {
    const clamped = Math.max(0, Math.min(words.length - 1, i));
    if (gapTimer) {
      clearTimeout(gapTimer);
      gapTimer = null;
    }
    window.speechSynthesis.cancel();
    index = clamped;
    play();
  }

  function skip() {
    jumpTo(index + 1);
  }

  function back() {
    jumpTo(index - 1);
  }

  activeSequenceStop = stop;
  play();
  return { stop, pause, resume, skip, back };
}
