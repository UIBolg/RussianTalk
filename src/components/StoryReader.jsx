import { useEffect, useState } from 'react';
import { STORIES_BY_ID, tokenKind } from '../storiesData.js';
import { speak, speakSequence, stopSpeaking } from '../speech.js';
import SpeakerButton from './SpeakerButton.jsx';
import WordPopover from './WordPopover.jsx';

export default function StoryReader({ wp, storyId, onOpenQuiz }) {
  const story = STORIES_BY_ID[storyId];
  const [openRank, setOpenRank] = useState(null);
  const [revealedGloss, setRevealedGloss] = useState(new Set());
  const [showAllTranslations, setShowAllTranslations] = useState(false);
  const [revealedSentences, setRevealedSentences] = useState(new Set());
  const [readingIndex, setReadingIndex] = useState(null);
  const [readEnglishToo, setReadEnglishToo] = useState(false);
  const rate = wp.progress.settings.speechRate ?? 0.85;

  // Mark a story as "read" the first time its reader is opened - reading
  // doesn't touch any word's spaced-repetition box, only the quiz-driven
  // "add to study" and the popover's own button do that (see
  // wordProgress.js's markStoryRead).
  useEffect(() => {
    wp.markStoryRead(storyId);
    stopSpeaking();
    setReadingIndex(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storyId]);

  useEffect(() => () => stopSpeaking(), []);

  if (!story) return null;

  function toggleGloss(key) {
    setRevealedGloss((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  function toggleSentence(i) {
    if (showAllTranslations) return;
    setRevealedSentences((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  }

  function playWhole() {
    const items = [];
    story.sentences.forEach((sent, i) => {
      items.push({ text: sent.ru, meta: { i } });
      if (readEnglishToo) items.push({ text: sent.en, meta: { i } });
    });
    setReadingIndex(0);
    speakSequence(items, {
      rate,
      onStepStart: (idx) => setReadingIndex(items[idx].meta.i),
      onDone: () => setReadingIndex(null),
    });
  }

  function playSentence(i) {
    setReadingIndex(i);
    speak(story.sentences[i].ru, { rate });
    // No reliable per-utterance onend hook through plain speak(), so just
    // clear the highlight after a moment rather than leaving it stuck.
    setTimeout(() => setReadingIndex((cur) => (cur === i ? null : cur)), 4000);
  }

  const learnedCount = story.listWords.filter((r) => wp.status(r) !== 'new').length;

  return (
    <div className="story-reader">
      <h2 className="topic-title">
        {story.title.ru} <span className="ru">{story.title.en}</span>
      </h2>

      <div className="w1000-study-settings">
        <button className="chip" onClick={playWhole}>🔊 Read whole story</button>
        <label className="w1000-toggle">
          <input type="checkbox" checked={readEnglishToo} onChange={(e) => setReadEnglishToo(e.target.checked)} />
          Read English too
        </label>
        <label className="w1000-toggle">
          <input type="checkbox" checked={showAllTranslations} onChange={(e) => setShowAllTranslations(e.target.checked)} />
          Show all translations
        </label>
      </div>

      <div className="story-sentences">
        {story.sentences.map((sent, i) => {
          const showTranslation = showAllTranslations || revealedSentences.has(i);
          return (
            <div
              key={i}
              className={`story-sentence ${readingIndex === i ? 'reading' : ''}`}
              onClick={() => toggleSentence(i)}
            >
              <div className="story-sentence-ru">
                {sent.tokens.map((t, ti) => {
                  const kind = tokenKind(t);
                  if (kind === 'plain') return <span key={ti}>{t[0]}</span>;
                  if (kind === 'word') {
                    return (
                      <span
                        key={ti}
                        className="story-word-link"
                        onClick={(e) => { e.stopPropagation(); setOpenRank(t[1]); }}
                      >
                        {t[0]}
                      </span>
                    );
                  }
                  if (kind === 'name') return <span key={ti} className="story-name">{t[0]}</span>;
                  // gloss: a word not on the 1000-word list, tap to reveal its meaning
                  const glossKey = `${i}-${ti}`;
                  return (
                    <span
                      key={ti}
                      className="story-gloss"
                      onClick={(e) => { e.stopPropagation(); toggleGloss(glossKey); }}
                    >
                      {t[0]}
                      {revealedGloss.has(glossKey) && <span className="story-gloss-tip">{t[2]}</span>}
                    </span>
                  );
                })}
                <SpeakerButton text={sent.ru} label="Play this sentence" rate={rate} className="story-sentence-speak" />
              </div>
              {showTranslation && <div className="translation-line shown">{sent.en}</div>}
            </div>
          );
        })}
      </div>

      <div className="story-progress-line">
        Words from this story you've learned: {learnedCount}/{story.listWords.length}
      </div>

      <button className="account-btn" onClick={onOpenQuiz}>Test yourself →</button>

      {openRank && <WordPopover rank={openRank} wp={wp} onClose={() => setOpenRank(null)} />}
    </div>
  );
}
