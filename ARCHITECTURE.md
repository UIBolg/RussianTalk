# How RusTalk Is Built (Plain Language)

This document explains how the app is put together, written for someone
who doesn't code. If you're about to add a feature, read the "Pattern
For Adding New Features" and "Things Not To Do" sections below first.

This describes the app as it stands today. It reflects a deliberate
product decision: saved words are global, shared across every
conversation (see the "Things Not To Do" section for why this isn't
the same as the "please" bug that was fixed earlier the same day).

## 1. Folder Structure — What Each Piece Is For

Think of the app like a small restaurant. Some files are the building
itself, some are the recipe book, some are the staff who do specific
jobs.

- **`index.html`** — The front door / picture frame. It's the one page
  a browser actually opens; almost everything else gets loaded inside
  it. You'll basically never need to touch this.

- **`src/main.jsx`** — The light switch. A few lines that just turn the
  app on and mount it into the page. Never touch this either.

- **`src/App.jsx`** — The restaurant manager. It doesn't cook or serve
  anything itself, but it keeps track of the two things that matter
  across the *whole* app: which screen you're currently looking at
  (topic list / a topic / all flashcards), and the master list of
  saved flashcards. It hands both down to whichever screen is showing.

- **`src/data.js`** — The recipe book / phrasebook. Every topic
  ("Cafés," "Shopping," etc.) and every conversation script (with the
  Russian text, the English translation, and which words are
  clickable) lives here, and *only* here. If you're adding a new
  conversation, this is the only file with actual Russian content in
  it.

- **`src/selectors.js`** — The one shared recipe card for "how do I
  count/find saved words for a topic or a dialog?" Any time you need
  to answer a question like "how many words has the user saved from
  this topic," you look it up here — you don't write that calculation
  again from scratch somewhere else. (This file didn't exist until
  today; it replaced four separate copies of the same calculation.)

- **`src/speech.js`** — The one shared "read this out loud" helper.
  It uses the browser's own built-in narrator (no internet call, no
  extra software) to read Russian text aloud. Anything that needs to
  speak text calls the `speak()` function here — nothing else should
  talk to the browser's narrator directly.

- **`src/pdfExport.js`** — The one shared "turn part of the page into
  a downloaded PDF" helper (`exportElementAsPDF(element, filename)`).
  Unlike `speech.js`, this one does need two small outside libraries
  (`jspdf`, `html2canvas`) since browsers don't offer a built-in way
  to save a file directly — see "How Exporting a Dialog Works" below.

- **`src/styles.css`** — The one shared paint-and-furniture catalog.
  All the colors, fonts, and spacing used anywhere in the app are
  defined once at the top (as named "tokens," like "amber" or
  "ink-soft") and every screen just points at those names instead of
  picking its own colors.

- **`src/languageHacks.js`** — A second, smaller recipe book, just for
  the "Language Hacks" section (see below): root-word families,
  prefixes, cases, the aspect decision tree, motion verbs, sentence
  skeletons, and the Arabic↔Russian comparison cards. Kept separate
  from `data.js` because it isn't dialog content — no `topicId`, no
  `DIALOGS` entry — but it follows the exact same rule: this is the
  only file with that content in it, and components only render it.

- **`src/components/`** — The staff, each with one job:
  - `TopBar.jsx` — the header bar with the logo and the Flashcards button
  - `Home.jsx` — the grid of topic cards you see first
  - `TopicView.jsx` — a single topic's screen (the Dialogs/Flashcards tabs)
  - `DialogMenu.jsx` — the sidebar list of conversations within a topic
  - `ChatPanel.jsx` — the actual chat bubbles, the word popover, and
    the per-sentence save button
  - `TicketGrid.jsx` — the flashcard "ticket" grid (reused in two places).
    Each ticket is a plain card showing the Russian text (a word, or a
    whole sentence) and English translation together — no flip, no
    audio icon here; that only happens in the training quiz (see
    `TrainingModal.jsx` below). A small "Word"/"Sentence" tag on each
    ticket shows which kind it is (see "How Sentence Flashcards Work"
    further down).
  - `GlobalFlashcards.jsx` — the "All flashcards" screen
  - `TrainingModal.jsx` — the "Train All" quiz popup: one flip-able card
    at a time, Russian word + 🔊 on the front, English translation on
    the back, flips when tapped
  - `EmptyState.jsx` — the small "nothing here yet" placeholder message
  - `SpeakerButton.jsx` — the reusable 🔊 button that reads a piece of
    text out loud when tapped. Any new "read this aloud" button
    anywhere in the app should reuse this component, not build its own.
  - `LanguageHacks.jsx` — the "Language Hacks" page shell: a
    `back-row`/title like every other screen, then a `topic-tab` row
    that switches between 8 sub-components, each in its own file
    (`RootTree.jsx`, `PrefixMap.jsx`, `CaseWheel.jsx`,
    `AspectHelper.jsx`, `MotionVerbs.jsx`, `SkeletonBuilder.jsx`,
    `ArabicRussianCards.jsx`, `TopFifteen.jsx`) — see "How the Language
    Hacks Section Works" below.

- **`.github/workflows/deploy.yml`** — The auto-publish robot. Every
  time changes are pushed to `main`, this automatically rebuilds the
  app and puts it live on the public website link. You don't run this
  by hand.

- **`package.json`** — The shopping list of outside tools the app
  needs to run: React itself, the build tool (Vite), the Supabase
  client, and the two small libraries behind PDF export (`jspdf`,
  `html2canvas`).

- **`vite.config.js`** — Settings for the tool that packages the app
  up for the web. Rarely needs touching.

## 2. The Pattern For Adding New Features

A simple checklist for "where does my change go?":

1. **Adding a new conversation or topic?** → Only `src/data.js`. Don't
   put Russian text or dialog content anywhere else. (This is for
   *dialogs* specifically — a scripted back-and-forth a student reads
   bubble by bubble. A browsable grammar reference belongs in
   `languageHacks.js`; a generated drill/exercise belongs in its own
   practice file — see "How Practice Content Works" below. Three
   different content shapes, three different homes — don't force one
   into another just because they all show up as a homepage card.)
2. **Adding a new screen, or a new reusable visual piece (a button
   style, a card, a modal)?** → A new file in `src/components/`, one
   component per file.
3. **Need to count, find, or filter saved flashcards in some new way?**
   → Add the calculation to `src/selectors.js` and reuse it. Don't
   write a fresh `flashcards.filter(...)` inline in a component if a
   similar one might already exist (or should exist) in that file.
4. **Tracking a saved word or sentence?** → Track it by *its text plus
   its type* (`word` or `sentence`) — one word equals one flashcard,
   shared globally across every topic and conversation it appears in,
   and separately, one sentence equals one flashcard the same way. See
   "How Sentence Flashcards Work Alongside Word Flashcards" below.
   Don't re-introduce a "word + conversation" key (see "Things Not To
   Do" for why).
5. **A screen needs to remember something only it cares about** (like
   "which tab is selected" or "which dialog is open")? → Keep that
   local to that screen's own file, the same simple way every other
   screen does it. Only things that matter *everywhere* (like the
   saved-flashcards list) belong up in `App.jsx`.
6. **Need to read some text out loud?** → Use the existing
   `SpeakerButton` component and the `speak()` function in
   `src/speech.js`. Don't write a new way of talking to the browser's
   narrator.

## 3. Naming Conventions

So new code blends in with the existing style:

- **Component files**: One component per file, filename in
  `PascalCase` (capitalized, no spaces) matching the component's name
  exactly — e.g. `TicketGrid.jsx` contains and exports `TicketGrid`.
- **Regular variables and functions**: `camelCase` (lowercase first
  word, capitalized after) — e.g. `dialogId`, `savedWords`,
  `startTraining`.
- **Dialog IDs** (inside `data.js`): lowercase words joined with
  dashes, describing the scene — e.g. `"coffee-formal"`,
  `"buying-ticket"`.
- **Topic IDs**: a single lowercase word — e.g. `"cafes"`,
  `"shopping"`.
- **"Something happened" functions passed between screens**: always
  start with `on` — e.g. `onSaveCard`, `onRemoveCard`, `onOpenTopic`.
  This is how a child screen tells the parent "the user did a thing,
  you decide what happens." (`onSaveCard`/`onRemoveCard` handle both
  word flashcards and sentence flashcards — see below.)

## 4. How Audio Playback Works

The app can read Russian text out loud (the 🔊 buttons on each sentence
and each word). This uses the browser's own built-in narrator (called
the "Web Speech API" if you look it up) — the same kind of voice your
phone or computer already uses for things like reading messages aloud.
That means: no internet call, no API key, no added library — it fits
the app's "everything is local" rule perfectly.

How it's wired up:

- `src/speech.js` holds the one `speak(text)` function that actually
  talks to the browser's narrator, and tells it to read the text as
  Russian.
- `src/components/SpeakerButton.jsx` is the one reusable 🔊 button.
  Give it some text and a label, and it handles the rest.
- It's used in two places in `ChatPanel.jsx`: next to each speaker's
  name (reads the whole line), and inside the little translation popup
  that appears over a word (reads just that word). That popup opens
  either by hovering the word (on a computer) or tapping it (on a
  touchscreen, where there's no "hover") — either way, the same popup
  shows the translation, the 🔊 button, and the "Save as flashcard"
  button together, so you can hear a word before deciding to save it,
  on any device, without a separate icon cluttering the sentence text.

**An honest limitation, not a bug**: whether the audio actually sounds
right depends on whether the visitor's own phone or computer has a
Russian voice installed — that's controlled by their device, not by
this app, the same way a phone might or might not have a Russian
keyboard installed. No website can install a voice onto someone else's
device. If a visitor's device has no Russian voice, the button will
still try to speak, but it may read the text with a foreign accent
rather than sounding native. If you're building on this later, don't
try to detect or "fix" this — there's nothing to fix from the app's
side.

If you add more places that need to read text aloud, always reuse
`SpeakerButton` and `speak()` — don't write a second version of this.

**Speed and pacing**: every utterance (single word, single sentence,
or a "Listen to full dialog" sequence) plays at a fixed `rate: 0.8` —
slower than the browser's default of 1 — since this is for learners,
not native-speed listening. `speakSequence` in `src/speech.js` also
waits `PAUSE_BETWEEN_SENTENCES_MS` (700ms) of silence after each
sentence finishes before starting the next one, so a full dialog
reads as separate beats instead of one run-on stream. Both constants
live at the top of `speech.js` — change them there, not per-call, so
every use of audio in the app stays in sync.

**Differentiating the two roles**: every dialog line has a `side`
(`'left'` for the other person — waiter, cashier, staff, friend...;
`'right'` for "You," the learner's own line). `speech.js` uses this to
make the `'left'` role sound different from `'right'` in three
layered ways, from most to least impactful:

- **A distinct voice, whether or not it has a "male" name**
  (`findAlternateVoice()`): first tries a name match against a male
  hint list (e.g. "Pavel," "Dmitri" - there's no gender field on a Web
  Speech voice, so this part is always just a best-effort guess). If
  that finds nothing, it now falls back to simply using *any other*
  installed Russian voice, regardless of what it's named. This
  fallback exists because on a real device with two Russian voices
  that are both generically named (e.g. both just "Google русский" or
  "Russian 1"/"Russian 2"), the name-match-only version found neither
  and left both roles on the identical voice - confirmed live, then
  fixed by no longer requiring a gender-sounding name to use a second
  voice that's actually there. A real second voice model is the
  strongest, most convincing difference available; nothing else here
  gets close.
- **Rate**: `'left'` lines also play distinctly slower
  (`LEFT_ROLE_RATE = 0.62`) than `'right'` (the normal
  `SPEECH_RATE = 0.8`) - the one lever that reliably comes through
  even when there's only one Russian voice at all, including on a
  network/cloud voice rather than one installed locally.
- **Pitch**: `'left'` lines also play at a distinctly lower pitch
  (`LEFT_ROLE_PITCH = 0.4`) than `'right'` (`pitch: 1`). Weakest of
  the three - some browsers' network Russian voice appears to
  silently ignore pitch entirely - but still applied every time as a
  bonus in case the engine does honor it.

`'right'` lines, and anything with no side at all (a saved flashcard,
which has no "other role"), always keep the browser's default rate,
pitch, and voice — unchanged from before this feature existed.
`speak()` and `speakSequence()` both take a `side`, and `SpeakerButton`
forwards a `side` prop the same way it already forwards `text`/`label`.

**Honest limitation that's still real**: this sandbox has no actual
text-to-speech engine to listen to, so every change here was verified
by inspecting the `rate`/`pitch`/`voice` values handed to
`SpeechSynthesisUtterance` (with mocked voice lists standing in for
real device configurations, including one modeling two same-named
Russian voices), not by hearing the result. Confirming the *app* is
asking for something different is not the same as confirming every
browser's speech engine *renders* that request audibly - that gap is
exactly what made a pitch-only version, then a pitch+rate version,
both look correct here while a real device kept sounding identical.
If a future change to this feature still doesn't sound different in
real use after being verified this same way, suspect that same gap
again before assuming the app's logic is wrong - and prioritize
finding a genuinely different installed voice over tuning rate/pitch
numbers further; a real second voice model is the only lever here
that doesn't depend on the engine choosing to honor a numeric knob.

**How the training quiz's audio button avoids flipping the card**:
the "Train All" quiz (`TrainingModal.jsx`) shows one flip-able card at
a time — tapping it anywhere flips it from the Russian word to the
English translation, using a real 3D CSS flip (`perspective` +
`rotateY` + `backface-visibility`, the same technique as everywhere
else a flip is needed in this app). The front also has a 🔊 button
(reusing `SpeakerButton`, not a new one) so a student can hear the
word before deciding to flip. This works with no extra code because
`SpeakerButton` already stops its click from "bubbling up" to
whatever it's sitting inside (`e.stopPropagation()`) — that's what
lets it live safely inside the word popover's "Save" button too. So
the card's own "tap anywhere to flip" handler never even hears about
a tap that landed on the speaker button; it only reacts to taps
elsewhere on the card. Nothing new was invented for this — it's the
same reuse pattern used everywhere else in this section.

Note this flip/audio behavior lives only in the training quiz. The
"All flashcards" ticket grid (`TicketGrid.jsx`) is deliberately plain
— it shows the Russian word and English translation together on one
static card, with no flip and no audio icon. If you're tempted to add
flip/audio there too, check with whoever's driving the product first —
it was tried once and explicitly moved to the training quiz instead.

**Reading a whole dialog out loud, one sentence after another**: the
"🔊 Listen to full dialog" button at the top of each conversation
(in `ChatPanel.jsx`) uses a second function in `src/speech.js`,
`speakSequence(texts, { onStepStart, onDone })`. Give it a list of
sentences and it reads them one at a time, only starting the next once
the browser reports the previous one finished — like a relay race, not
a fixed timer. `onStepStart(index)` fires right before each sentence
starts (that's what highlights the sentence currently being read, so a
student who glances at the screen can follow along — though the
feature works fine audio-only, without looking, which is the main use
case). `onDone()` fires exactly once no matter *why* it stopped:
it finished normally, someone pressed the stop button, or something
else interrupted it.

**The "only one thing talks at a time" rule lives in `speech.js`
itself**, not in any component: calling the ordinary `speak()`
function (tapping any single sentence or word) automatically stops a
`speakSequence()` that's mid-playback first. This is why tapping a
single word's speaker button while "Listen to full dialog" is running
correctly interrupts the full playback, without `ChatPanel.jsx` having
to know or care that a sequence was active — and it's also why
switching to a different dialog, or leaving the screen entirely, stops
playback automatically: those already call `stopSpeaking()`, which now
stops an in-progress sequence the same way. If you build another
playback feature later (auto-play the next dialog, a playback speed
setting, etc.), build it as another small function in `speech.js` that
calls `speak()`/`speakSequence()` the same way, so this "only one voice
at a time" guarantee keeps holding everywhere for free.

## 5. How Sentence Flashcards Work Alongside Word Flashcards

A student can save two kinds of flashcard: a single word (the original
feature) or a whole sentence. Both use the exact same flashcard shape
— `{ word, tr, dialogId, topicId, type }` — the only new thing is
`type`, which is either `'word'` or `'sentence'`. For a sentence
flashcard, the `word` field just holds the whole Russian sentence
instead of one word; nothing else about the shape changes.

Because of that, almost nothing had to be duplicated:

- **The training quiz's flip card doesn't know or care.** It just
  puts `.word` on the front (with a speaker button) and `.tr` on the
  back — that was already true before sentence flashcards existed, so
  `TrainingModal.jsx` needed zero changes to support them.
- **Saving/removing is one function each**, `saveCard`/`removeCard`
  in `App.jsx` (exposed to screens as `onSaveCard`/`onRemoveCard`),
  used for both kinds. They accept a `type` (defaulting to `'word'`
  if you don't pass one), and treat "is this already saved" as
  matching *both* the text and the type — so a word and a sentence
  are never confused with each other, even in the unlikely case their
  text matched.
- **The sentence-save button** (the 🔖 icon next to each sentence's
  🔊 button in `ChatPanel.jsx`) reuses the exact same
  save/remove/require-login decision the word popover already made —
  it's not a new rule, just the existing one applied to a sentence's
  text instead of a word's.
- **The "All flashcards" list** (`TicketGrid.jsx`) shows a small
  "Word" or "Sentence" tag on each ticket (reusing the same
  blue/green color tokens used elsewhere in the app) so the two kinds
  are easy to tell apart while still living in the same list.

**Database note**: sentence flashcards need one extra column
(`type`) in the Supabase `flashcards` table, added via a one-time SQL
script (handed over the same way the original table setup was).
Word-saving was deliberately built to keep working normally even
before that SQL has been run — only saving a *sentence* depends on
it; trying to save one before the column exists just fails quietly
(the same as any other database hiccup this app already handles) and
doesn't affect word flashcards at all.

## 6. How Exporting a Dialog Works

The "⬇️ Download PDF" button next to "Listen to full dialog" in
`ChatPanel.jsx` downloads a real PDF file directly — no print dialog,
no "Save as PDF" step for the student to find. Browsers don't give a
web page any way to save a file without going through the print
dialog on their own, so this needed two small libraries:
`html2canvas` (takes a snapshot of the conversation exactly as
styled) and `jsPDF` (turns that snapshot into a downloadable file,
split across as many A4 pages as it needs). The shared logic lives in
`src/pdfExport.js`, in one function, `exportElementAsPDF(element,
filename, { title, subtitle })` — give it any DOM element, a
filename, and an optional title/subtitle and it handles the rest.

**Only the conversation lines are snapshotted, not the title/sub
block** — `ChatPanel.jsx` wraps just the `d.lines.map(...)` bubbles in
their own `linesRef`, separate from `panelRef` (the whole panel,
still used for other things). That's because the PDF draws its own
branded header instead of reusing the on-screen title — see below.

**The PDF has a real header and footer, drawn directly by `jsPDF`
(not part of the screenshot).** The header — a small amber "RusTalk"
mark and tagline, the dialog's title and subtitle, a divider line —
only appears on **page 1**, like a document cover, not repeated on
every page. The footer (a divider, "RusTalk," and "Page X of Y") does
repeat on every page. Everything is drawn with `jsPDF`'s own
text/shape calls in `src/pdfExport.js`'s `drawHeader`/`drawFooter`
helpers, using the same named colors as `src/styles.css` (amber, ink,
ink-soft, line) so it matches the app's look without picking new
colors. A `margin` (40pt) keeps the header, footer, and every page of
content off the paper's edge.

Because only page 1 reserves space for the header, **page 1 fits less
conversation content than later pages do** — `exportElementAsPDF`
tracks two different content-area heights (`firstSlicePx` vs.
`laterSlicePx`) and picks the right one per page instead of assuming
every page has the same amount of room.

**Why each page gets its own cropped slice of the screenshot,
instead of one giant image redrawn on every page**: pasting the same
tall image on every page and trusting the physical page edge to crop
it only works if nothing else needs to live below that image — but
the footer does. So each page instead gets a freshly cropped,
correctly-sized slice of the original canvas (via an offscreen `<canvas>` and
`drawImage` with a source rectangle), sized to fit exactly between the
(page-specific) content top and the footer. This was a real bug the
first time this was built: the footer's reserved space and the
image's actual boundary didn't agree, so page content visibly
overlapped the footer text. If you touch the pagination math again,
keep the slice-per-page approach - don't go back to one full-height
image with page-edge clipping, and keep accounting for page 1 having
less room than the rest.

Those two libraries are fairly large, so `ChatPanel.jsx` only fetches
them the moment someone actually clicks the button (`await
import('../pdfExport.js')`), instead of loading them for every
visitor up front. This is the same "only pay for what you use"
thinking as the rest of the app, just applied to code size instead of
network calls.

Right before snapshotting, `ChatPanel.jsx` sets a local `isExporting`
flag that does two things while it's true: it hides everything that
isn't the conversation itself (the "Listen"/"Download" buttons, word
and sentence save icons, the hint text), and it forces every English
translation line to show — normally `.translation-line` only shows
on hover or tap, which doesn't mean anything for a still snapshot, so
export mode shows it unconditionally. Nothing is actually removed
from the dialog; the controls just reappear the moment the download
finishes. Everything else (the chat bubble colors, fonts, layout) is
untouched, so the exported page looks like the same conversation,
just with every translation visible at once and the app's controls
stripped away.

If you add a new interactive-only control to `ChatPanel.jsx` later
(another button, another icon), hide it the same way — wrap it in
`{!isExporting && (...)}` — otherwise it'll show up uselessly in the
downloaded PDF.

## 7. How ID-Only Login Works

Logging in used to mean typing an email and a password. Now a student just
types one ID (e.g. `nagham`) and hits Continue — no password field exists
anywhere in the UI. This was a deliberate, explicit product decision, not an
oversight, and it comes with a real, accepted tradeoff: **anyone who knows
or guesses another student's ID can log in as them and see or delete their
saved flashcards.** That's fine for a low-stakes classroom setting, which is
the only setting this app is meant for — don't "fix" it by adding a
password back in.

**Why this still uses Supabase Auth under the hood.** Every flashcard is
protected by a Row Level Security policy keyed on `auth.uid() = user_id` —
that's the entire reason one student can't see another's flashcards in the
database. Supabase Auth is what hands out that `auth.uid()`, and it always
wants an email + password pair, even though neither is ever shown to a
student. So `src/auth.js` fakes both:

- `idToEmail(id)` turns the typed ID into a fake address like
  `nagham@id.rustalk.local` — never a real inbox, never emailed to anyone.
- Every account, for every student, is created and signed in with the exact
  same fixed password (a constant in `src/auth.js`). It's effectively public
  (like the anon key already committed in `supabaseClient.js`) — the ID is
  the only thing standing between a student's account and anyone else, by
  design.

**`signInWithId(id)`** (`src/auth.js`) is the single entry point for both
logging in and signing up, because from a student's point of view there's
no difference: they just type their ID.
1. It first tries to log in with that ID's fake email + the shared password.
2. If no account exists yet, it signs one up instead — the first person to
   type a given ID is the one who claims it. From then on, typing that same
   ID again always logs into that same account.

**Required one-time Supabase setting.** The fake email addresses this
relies on can never receive a confirmation link, so the project's
Authentication → Providers → Email → "Confirm email" setting must be
switched **off** in the Supabase dashboard. This can't be done from the
app's code — it's a project setting. If it's still on, `signInWithId` will
detect that sign-up succeeded but no session came back, and surfaces a
message telling whoever runs the site to turn it off, instead of leaving
the student stuck with no explanation. (This also means the earlier
"confirmation email" behavior from when accounts used real email addresses
no longer applies — there is no real email to confirm anymore.)

- **Don't reintroduce a password field.** The user explicitly chose
  "ID alone, no password" after being shown the tradeoff above.
- **Don't validate ID uniqueness with a separate check.** Supabase's own
  email-uniqueness constraint on the derived fake email already does this —
  the first sign-up for a given ID succeeds and claims it; that's the
  intended mechanism, not a gap to close.

## 8. How the Language Hacks Section Works

"Language Hacks" (nav button: "💡 Hacks", `view === 'hacks'` in
`App.jsx`) is not a dialog topic and doesn't go through `TopicView.jsx`
at all — it's a standalone visual reference for the highest-leverage
Russian patterns (word roots, prefixes, cases, aspect, motion verbs,
sentence skeletons, and Arabic↔Russian parallels), aimed at a beginner
who thinks in patterns rather than rote grammar tables. No flashcards,
no login, no dialog content — just `src/languageHacks.js` rendered by
`LanguageHacks.jsx` and its 8 sub-components.

**Why a separate data file instead of adding to `data.js`.**
`data.js` is specifically the dialog/topic phrasebook — every entry
has a `topicId` and lives inside `TOPICS`/`DIALOGS`. Language Hacks
content (a root-word family, a prefix's arrow and color, a case's
example sentence) doesn't fit that shape and isn't a dialog a student
reads bubble-by-bubble, so it gets its own file instead of forcing a
mismatched shape into `data.js`.

**One shared color system across every sub-component.** `HACK_COLORS`
in `languageHacks.js` defines six accent colors — three are the
existing `--amber`/`--frost`/`--sage` tokens, the other three are the
exact hex values already used elsewhere in the app as topic colors
(hotels/smalltalk's plum, emergencies' brick red, banksim's teal) —
reused here rather than inventing a second palette. Every prefix in
`PREFIXES` is assigned one of these colors plus a spatial arrow
(`→` into, `←` out of, `↑` upward, `⇄` across, etc.), and
`PREFIX_INFO` (a lookup built from `PREFIXES`) is what `RootTree.jsx`
and `MotionVerbs.jsx` both read from — so "при-" is the same color and
arrow in the Prefix Map, inside a root-word branch, and inside the
идти/ехать prefix family. If you add a 13th prefix, add it once to
`PREFIXES` and every component picks it up automatically; don't
hand-pick a color inside an individual component.

**Component-by-component, briefly:**
- `RootTree.jsx` — tabs between the two root families in
  `ROOT_FAMILIES` (`ключ`, `нести`); each branch is a button that
  toggles open, but the meaning stays hidden behind a guess-then-reveal
  prompt until tapped (see section 9).
- `PrefixMap.jsx` — a grid over `PREFIXES`; each card is a
  guess-then-reveal button (see section 9), not a plain read-only grid.
- `CaseWheel.jsx` — not a literal wheel/SVG diagram (kept as a
  responsive card grid instead, for the same mobile-friendliness
  reason as everything else here) — `CASES` marked `primary: true`
  render larger/first, the rest smaller below. `highlightExample()`
  wraps the relevant word from the example sentence in `<mark>` using
  the case's own color.
- `AspectHelper.jsx` — walks `ASPECT_TREE`, a small nested
  yes/no-branching object, by keeping an array of the choices made so
  far and re-deriving the current node from the root every render
  (`path.reduce`-style) instead of storing "current node" directly —
  that's what makes "Start over" trivial (just clear the array).
- `MotionVerbs.jsx` — `MOTION_VERB_PAIRS` (straight-arrow "one trip" vs
  loop-icon "habitual") plus `MOTION_PREFIX_FAMILY`, which reuses
  `PREFIX_INFO` for its chips' colors, same as `RootTree.jsx`.
- `SkeletonBuilder.jsx` — picks a skeleton from `SKELETONS`, then a
  filler from `SKELETON_FILLERS[skeleton.id]` (keyed by skeleton id),
  and assembles the sentence with a plain `.replace('___', filler.ru)`.
  A 🎰 Spin button and streak counter sit on top of this (see section 9).
- `ArabicRussianCards.jsx` — reuses the exact `.flip-card`/
  `.flip-card-inner`/`.flip-card-face` 3D-flip mechanics already built
  for `TrainingModal.jsx`'s training-quiz cards, just in a taller
  variant (`.hack-flip-card`) since these cards hold more text than a
  single word.
- `TopFifteen.jsx` — an index-based stepper over `TOP_FIFTEEN` (a plain
  array of strings), presented as a swipeable "Stories"-style deck: a
  segmented progress bar instead of dots, and the card itself is
  tappable (left third = back, rest = forward), same `useState` step
  pattern as `AspectHelper.jsx`.

**A real mobile bug this surfaced, not something to redo:** adding a
4th `.nav-btn` ("💡 Hacks") to the top bar pushed the nav row past the
viewport width on narrow phones, forcing the *entire page* to scroll
horizontally — confirmed with a 375px-wide Playwright check before
this shipped. The fix was **not** to touch Language Hacks' own layout
(none of its sections caused the overflow); it was a small mobile
media query on `.nav-actions` in `styles.css` that lets the nav row
itself scroll horizontally, containing the overflow instead of letting
it leak into the page. If you add a 5th top-level nav button later,
re-run that same narrow-viewport overflow check — don't assume it
still fits.

## 9. How the Mascot/"Stickiness" Layer Works

Language Hacks' 8 sections got a second pass on top of the base
content: every abstract grammar concept now has a vivid, consistent
mascot/mini-scene attached to it, plus light localStorage-backed
gamification. This is a **layer on top of** section 8, not a
replacement — the underlying data/component split from section 8
still holds.

**Why mascots live in content data, not components.** Same reasoning
as the color system in section 8: `Mascot.jsx` is a dumb presentation
component (emoji in a colored circle, optional CSS animation) that
takes `emoji`/`color`/`animation` as props. The actual mascot
identity — which emoji, what name, what scene text, which of the 5
shared animations — lives in `languageHacks.js` (`PREFIXES[].mascot`,
`ROOT_FAMILIES[].mascotEmoji`/`mascotName`, `CASES[].personality`/
`personaEmoji`/`joke`, and the new `MASCOTS` export for Aspect/Motion).
Renaming a mascot or changing its scene is a data edit, never a
component edit.

**`MASCOTS` (in `languageHacks.js`)** holds the two mascot pairs that
don't attach to a single list item: `MASCOTS.aspect.perfective`/
`imperfective` (Perfective Pete / Imperfective Ira) and
`MASCOTS.motion.oneDirection`/`multiDirection` (Straight-Line Sasha /
Loop-the-Loop Lena). `AspectHelper.jsx` and `MotionVerbs.jsx` read from
here so the same two characters show up everywhere that concept
reappears, instead of each component inventing its own labels.

**5 shared animations, not bespoke art per mascot.** `Mascot.jsx`
takes an `animation` prop that maps to one of 5 CSS classes
(`.mascot-anim-pop/fade/shake/burst/launch`, keyframed in
`styles.css`), and every one of the 12 prefixes is assigned exactly
one of these 5 in its `mascot.animation` field — a diver "pops" in,
smoke "fades" out, a piñata "bursts", a firework "launches", etc. This
is the deliberate scope for "simple CSS/SVG, doesn't need polished
art": one small reusable animation vocabulary, not 12 one-off effects.
All 5 are disabled under `prefers-reduced-motion: reduce`.

**Guess-then-reveal (active recall).** `RootTree.jsx` and
`PrefixMap.jsx` both keep a `revealed` `Set` of item keys instead of a
single "open" value, so each word/prefix independently starts hidden
behind a "What do you think this means? Tap to check →" prompt and
stays revealed once tapped. The с-/со- prefix card additionally shows
a keyword-mnemonic box (`.prefix-card-mnemonic`) only after reveal —
that's the one spot using the "sounds like an English/Arabic word"
trick (`PREFIXES[].mnemonic`), since it's the one prefix where the
hook is clean; don't force a mnemonic onto every prefix just for
consistency.

**`hackProgress.js`** is a single-purpose localStorage helper, same
pattern as `speech.js`/`selectors.js` — read/write are wrapped in
try/catch so a blocked or full localStorage degrades to "the feature
just doesn't persist," never a thrown error. It tracks two independent
things under two keys:
- `rustalk-hacks-progress` — a `{sectionId: timestamp}` map, written by
  `recordSectionView()` every time `LanguageHacks.jsx` changes tabs
  (and by `RootTree`/`PrefixMap`/`AspectHelper`/`ArabicRussianCards`/
  `TopFifteen` on individual item reveals, using their own
  `prefix:word` / `top15:index`-style sub-ids — these sub-ids aren't
  read by anything yet, they're just future-proofing the same key
  shape). `getComeBackTo()` reads this map to find the
  least-recently-viewed *other* section already visited, which
  `LanguageHacks.jsx` shows as a dismissible "👋 Come back to X"
  nudge banner recomputed on every tab change.
- `rustalk-hacks-skeleton-streak` — a `{count, seen}` object,
  `seen` being an array of `"skeletonId::fillerRu"` strings so the 🔥
  streak in `SkeletonBuilder.jsx` only increments on a genuinely new
  sentence combination, not on re-picking one already built this
  session (or a previous one — it persists across reloads).

**Nav tab checkmarks.** `LanguageHacks.jsx` seeds a `viewed` Set from
`getViewedSections()` on mount and adds to it on every tab change, so
tabs already visited this browser show a small "✓" (`.hack-tab-check`)
next to their label — a cheap "you've been here" signal, not a
progress requirement.

**Sentence-builder slot machine.** The 🎰 Spin button in
`SkeletonBuilder.jsx` picks a random *different* filler index (a
one-line "if it lands on the same index, bump it by one" guard, no
`while` loop) and briefly dips `.skeleton-result-ru`'s opacity via a
`spinning` class for a 260ms transition — a small physical-feeling
payoff rather than an instant swap.

**If you add a new Language Hacks section or a 9th sub-component**,
give it a mascot (reuse `MASCOTS`/`PREFIX_INFO` if the concept already
has one — don't invent a second mascot for the same idea), wire a
guess-before-reveal step if there's a meaning to guess, and call
`recordSectionView()` on whatever id makes sense so it participates in
the checkmark/nudge system. You don't need a new localStorage key for
it — reuse `rustalk-hacks-progress`.

## 10. How Practice Content Works

The app has three distinct content shapes now, not two — worth being
explicit about, since it's easy to assume "not a dialog" only ever
means "put it with Language Hacks":

| Content type | Lives in | Shape | Screen family |
|---|---|---|---|
| Dialogs | `data.js` | scripted conversation, read bubble by bubble | `TopicView.jsx` / `ChatPanel.jsx` |
| Reference | `languageHacks.js` | browsable patterns, no right/wrong answer | `LanguageHacks.jsx` + 8 sub-components |
| Practice/exercise | `practiceItems.js` + one file per feature (e.g. `numberWords.js`) | generated drill content with a correct answer, often timed | `PracticeView.jsx` + one component per `kind` |

**Practice content is generated, not authored.** Numbers (1–1000) is
the first practice feature: rather than 1000 hand-typed Russian
strings in a data file (nothing to proofread against, easy to typo),
`numberWords.js` holds a small `numberToRussianWords(n)` formation
function built from lookup tables (units/teens/tens/hundreds) — the
same rule a student would be taught. Both the flashcard deck and the
quiz call this function per number; there's no giant array of numbers
sitting in a file. If a future practice feature (verb conjugation,
etc.) is naturally rule-based the same way, generate it the same way
— don't hand-author what a formation function can produce correctly
every time.

**`practiceItems.js` is a small registry, not the content itself.**
One entry per practice feature, shaped just enough like a topic
(`id`, `title`, `ru`, `icon`, `color`) that `Home.jsx` can render it
with the *exact same* `.topic-card` markup as a real topic — plus one
extra field, `kind` (e.g. `'numbers'`), that tells the app which
practice screen to open. Adding a new practice feature later means
one new entry here plus its own content file — never touching the
numbers code to do it.

**The homepage renders topics and practice items identically, but
routes them differently.** `Home.jsx` builds one combined list
(`[...TOPICS, ...PRACTICE_ITEMS]`) and maps every entry through the
same `<button className="topic-card">` markup — a student sees no
visual difference between a topic and a practice card. The only
branch is the click handler: a topic calls `onOpenTopic(id)` (existing
behavior); a practice item calls `onOpenPractice(id)`, which sets
`view: 'practice'` in `App.jsx` instead of `view: 'topic'`. Same
card, same grid, different destination — the data underneath stays
genuinely separate even though the surface looks the same.

**`PracticeView.jsx` is the practice equivalent of `TopicView.jsx`.**
It looks up the clicked item in `PRACTICE_ITEMS` by id, reads its
`kind`, and renders the matching screen — currently just
`NumbersPractice.jsx`, which uses the same `.topic-tabs`/`.topic-tab`
pattern as `TopicView.jsx` and `LanguageHacks.jsx` to switch between
Flashcards and Quiz. New `kind` values get their own component the
same way; `PracticeView.jsx` itself should stay a thin lookup-and-
render switch, not grow feature-specific logic.

**Numbers flashcards reuse the exact flip-card mechanics already
built** — the same `.flip-card`/`.flip-card-inner`/`.flip-card-face`
3D-flip CSS and the same `SpeakerButton` used by `TrainingModal.jsx`
and `ArabicRussianCards.jsx`. Nothing new was invented for "a card
that flips and can talk" — that pattern gets reused a third time here.

**Deliberately not wired into the global saved-flashcards system.**
Unlike a dialog's words, numbers aren't something a student picks one
at a time to save — the whole generated deck is always there to
browse, closer to Language Hacks than to a topic's flashcards. So
numbers practice doesn't call `onSaveCard`/`onRemoveCard`, doesn't
touch Supabase, and doesn't appear in "All Flashcards" or the Train
All quiz — it's a standalone screen, like Language Hacks, not an
extension of the saved-word system. If a future practice feature
*does* want individual saveable items, that's a deliberate product
decision to make explicitly when it comes up, not something to default
into by reusing `saveCard` just because it's there.

## 11. Things Not To Do

- **Saved words are tracked globally by word text — one word equals
  one flashcard, no matter how many topics or conversations it appears
  in.** If you save "please" in one conversation, it shows as already
  saved everywhere else "please" appears too, and there is only ever
  one "please" flashcard in the list. This is an intentional design
  choice, not an oversight — don't "fix" it by pairing the word with
  which conversation it came from. (Sentence flashcards follow the
  same "global by text" rule, just in their own separate `type`, so a
  saved sentence and a saved word never collide with each other — see
  "How Sentence Flashcards Work Alongside Word Flashcards" above.)
- **Don't write a new save/remove function for a new kind of
  flashcard.** `saveCard`/`removeCard` in `App.jsx` already handle any
  flashcard shaped like `{ word, tr, dialogId, topicId, type }` — add
  a new `type` value and reuse them, the same way sentence flashcards
  reused them instead of getting their own `saveSentence`/
  `removeSentence` functions.

  (Earlier the same day, the app briefly tracked words per-conversation
  instead — a fix for what looked like a bug: saving "please" in one
  conversation made it show as saved, and deletable, in a completely
  different one. After reviewing it, the per-conversation behavior was
  deliberately reversed back to global-by-word-text, because "one word,
  one flashcard, everywhere it appears" is the intended design for this
  app. If you're reading this and considering "fixing" the global
  behavior again, don't — it's a confirmed decision, not a leftover
  bug.)
- **Never write a new counting/filtering function for flashcards if
  one already exists in `src/selectors.js`.** Add a new one there
  instead of copy-pasting the filter logic into a component. That
  duplication (the same calculation written out four separate times)
  is exactly what was cleaned up today.
- **Don't introduce a different way of remembering things** (a new
  state-management library, global variables, browser storage, etc.)
  for just one screen. Every screen currently uses the same plain,
  simple technique (React's built-in `useState`). Mixing styles is how
  codebases become confusing to work on.
- **Don't fetch dialog content from the internet or an API.** All
  content is deliberately kept as plain data in `src/data.js` so the
  app stays simple, fast, and works without any backend.
- **Don't leave debug leftovers in.** No `console.log` statements,
  commented-out code, or half-finished features should be committed —
  there currently are none; keep it that way.
- **Don't build a second way of reading text out loud.** Reuse
  `SpeakerButton` and `src/speech.js` — see "How Audio Playback Works"
  above.
