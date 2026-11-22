import { TOPICS } from '../data.js';
import { cardsForTopic } from '../selectors.js';
import WordsWidget from './WordsWidget.jsx';

export default function Home({ flashcards, onOpenTopic, onOpenWords, onStartWordsStudy }) {
  return (
    <section>
      <div className="home-head">
        <h1>Choose a situation</h1>
        <p>Each topic is a set of real dialogs. Read them in Russian, tap anything to translate, and save words as you go.</p>
      </div>
      <WordsWidget onOpenWords={onOpenWords} onStartStudy={onStartWordsStudy} />
      <div className="topic-grid">
        {TOPICS.map((t) => {
          const has = t.dialogs.length > 0;
          const savedCount = cardsForTopic(flashcards, t.id).length;
          return (
            <button key={t.id} className="topic-card" onClick={() => onOpenTopic(t.id)}>
              <div className="line" style={{ background: t.color }} />
              <div>
                <div className="icon">{t.icon}</div>
                <h3>{t.title}</h3>
                <div className="ru">{t.ru}</div>
              </div>
              <div className={`meta ${has ? 'ready' : ''}`}>
                {has
                  ? `${t.dialogs.length} dialog${t.dialogs.length > 1 ? 's' : ''} · ${savedCount} saved`
                  : 'No dialogs yet'}
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
