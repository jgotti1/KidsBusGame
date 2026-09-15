# School Bus Learning Adventure — Project Reference

## Workflow

Before committing any change, update this file (`AGENTS.md`) if the change affects anything it describes — commands, architecture, a standing design decision, or deployment. Keeping it current here is what keeps `CLAUDE.md` (which just imports this file) accurate too.

## Purpose and stack

A cheerful browser learning game for the owner's 6-year-old granddaughter. Plain HTML, CSS, and JavaScript only — no framework, build step, backend, accounts, or tracking. Open `index.html` directly to play, or serve the folder statically.

## Commands

No package manifest, dependencies, or test runner exist. Useful checks:

```sh
node --check game.js
node --check questions.js
node --check audio.js
npx --yes prettier@3.6.2 --check index.html style.css questions.js game.js audio.js README.md AGENTS.md
```

Use `--write` instead of `--check` to format an edited file. All existing files are Prettier 3.6.2-formatted; keep new edits readable (real indentation/line breaks, not minified or long run-on code).

There is no committed automated test suite. Any correctness checking has been ad hoc (Node `vm`/`Function` scripts with DOM/timer stubs) and is not persisted — don't claim browser/visual verification without actually running the page in a browser.

## Files

- `index.html` — welcome screen, bus interior, route, question dialog, ending dialog. Links `style.css` with a cache-busting query string (see **Deployment**).
- `style.css` — responsive layout, bus scenery, and all boarding/driving/unloading animation keyframes.
- `game.js` — gameplay state machine, scoring, passenger tracking, speech-synthesis narration, and screen transitions. The welcome-screen bus SVG is embedded here as a template string.
- `audio.js` — offline-synthesized background music and engine/road audio via the Web Audio API (no audio files); exposes a `busAudio` singleton. Must load before `game.js`.
- `questions.js` — question bank, built with a small `add(type, picture, prompt, choices, correct)` helper. Add new questions by pushing more entries or `.forEach`-generated groups; keep `audio.js` loaded before `game.js` in `index.html`.
- `README.md` — player-facing instructions and feature overview.

## Architecture

### Game state machine (`game.js`)

Top-level mutable state: `correct`, `wrong`, `current` (active question), `deck` (remaining questions this trip), `locked` (blocks double-answering the active question), `sound`, `startingBus` (true only for the unscored engine-start question), and `passengers` (emoji faces currently aboard, used to render bus windows and later the matching unloaded characters).

Core lifecycle: `ask()` pops the next question from `deck`, renders shuffled choice buttons, opens the `<dialog id="question">`, and calls `read()`. `answer(choice, button)` scores the pick, disables the choices, and always auto-advances — there is no manual "continue" button in the question dialog (see **Narration and pacing**). `goToNext(good)` (called only by the auto-advance timer, with the answer's correctness passed in directly) closes the dialog and routes to `driveToNextStop()` (or the boarding animation before it) when `good`, or back into `ask()` for a retry when not.

Trip progression: `driveToNextStop()` handles both the next-pickup and school-arrival cases; `unloadChildren(atSchool)` pops passengers one at a time into full-body SVG characters via `makeOutsideChild()`; `showOutsideReaction(atSchool)` drives the bus away (`.departing`, then `.bus-departed`) and runs the win/loss group animation before calling `finish()`. On a win, it fills `#scene-confetti` (via the shared `confettiMarkup()` helper, also used by the ending dialog's `#confetti`) as soon as the bus has pulled away. On a loss, the waiting parents (`.family-pair .parent-figure`, added earlier by `unloadChildren`) are visible and arm-waving starting from `.departing` — i.e. while the bus is still pulling away, not only after — via CSS, not JS. `returnChildrenHome()` is the loss-path entry point (bus drives home, doors open, `unloadChildren(false)`).

`prepareFamilies()` builds ten distinct child faces per trip across five skin tones, mapping each to a consistent parent face, hair color, curls, and glasses in `familyProfiles`, so a child's identity (and their waiting/reunited parent) stays consistent through boarding and unloading.

`buildQuestionDeck()` draws one shuffled question per active category per round (15 categories, 156 questions total in `questions.js`) so no single large category (e.g. letters) dominates a trip, and questions don't repeat within a trip.

### Narration and pacing (`speak`, `read`, auto-advance)

`speak(text, { rate, pitch, onEnd })` wraps `SpeechSynthesisUtterance`; `onEnd` fires on both `onend` and `onerror` so callers get a completion signal even if the utterance is cancelled. If sound is off or `speechSynthesis` is unavailable, `onEnd` fires synchronously instead of speaking.

`read()`/`readChoice()` speak the question prompt first, then each answer choice **in the order the buttons actually appear on screen** (not `current.choices`' unshuffled order), chaining one `speak()` call per choice via `onEnd`. Each choice gets a `.read-highlight` CSS class (a simulated hover) while it's being read. The chain checks `locked` and that `current` hasn't changed before each step, so answering mid-read or a new question loading cleanly aborts it and clears the highlight.

There is no continue button for either a correct or incorrect answer (not yet at 3 wrong): `answer()` always auto-advances via `goToNext(good)` ~2 seconds after the feedback line finishes speaking, with a 4-second safety timeout in case the speech `onend`/`onerror` events never fire (a known unreliability on iOS Safari) — the game must never stall waiting on a speech event alone. On the second wrong answer specifically, the spoken/displayed feedback appends a warning — "One more wrong question and school is canceled, careful!" — before the same pause-then-advance. The third wrong answer is a separate, earlier-returning branch in `answer()` that always ends the trip via `returnChildrenHome()`, not `goToNext()`.

### Audio (`audio.js`)

`busAudio` synthesizes an instrumental "Wheels on the Bus" melody and an engine/road-noise loop directly into `AudioBuffer`s (no downloaded/recorded audio). `start(soundEnabled)`/`stop()` gate the whole system; `setMoving(bool)` layers the engine rumble during driving segments; `setEnabled(bool)` follows the Sound toggle. Master gain also mutes automatically on `visibilitychange` when the tab is hidden. `resume()` is called from both the Start and Sound-toggle click handlers specifically to satisfy mobile browsers' requirement that audio context creation/resume happen synchronously inside a user-gesture handler.

### Motion

All gameplay CSS animations (bus driving, wheels, doors, boarding/unloading, cheering/sad reactions) run unconditionally — **`prefers-reduced-motion` is deliberately not honored**. It was removed after mobile testing showed the OS-level Reduce Motion accessibility setting was silently disabling all gameplay animation; since motion is core to how this game communicates progress (not decorative), the product decision was to always animate rather than respect that preference. Do not reintroduce `@media (prefers-reduced-motion: reduce)` rules without checking with the owner first.

## Standing design decisions

These came from explicit product direction and should not be silently reverted:

- Winning line: **"Yay! We made it to school!"** Losing line: **"Oh man, no school today."** (not "Booo", "Waaaa", or a happy no-school chant).
- No answer (right or wrong) requires a button tap to continue; the question dialog has no continue button at all (see **Narration and pacing**). A second wrong answer speaks/shows a "one more wrong and school is canceled" warning.
- Exterior side-view yellow bus with a visible front hood, wide folding door (16% of bus width), and two smaller, lower road wheels (`width: clamp(44px, 12%, 110px)`, `bottom: -12%`) that don't cover the passenger windows.
- The lower passenger windows must show the **same faces and skin tones as the children who actually boarded**, not generic icons; unloaded children reuse those exact skin tones/hair styles as full-body SVG characters.
- Welcome-screen credit: "Created by MargottiCode @margotticode.com", linking to `https://margotticode.com` in a new tab with `rel="noopener noreferrer"`.
- Winning celebration: confetti falls in the ride scene itself (`#scene-confetti`) once the bus has pulled away, in addition to the ending dialog's own confetti.
- Losing reaction: the waiting parents wave their arms starting as the bus pulls away (`.departing`), not only once it's gone (`.bus-departed`/`.disappointed`).

## Deployment

The GitHub repo (`origin/main`) is **not** the live site and has no CI/auto-deploy configured. The played version is manually hosted on Bluehost at `https://busgame.margotticode.com`, independent of GitHub — pushing to `origin/main` only updates the repo. After any change, the edited files (`index.html`, `style.css`, `game.js`, `audio.js`, `questions.js` as applicable) must also be re-uploaded to Bluehost via cPanel File Manager or FTP/SFTP, and any Bluehost/Cloudflare cache purged if the change doesn't appear.

`index.html` links `style.css` with a cache-busting query string (`style.css?v=N`) so browsers/CDNs don't keep serving a stale stylesheet after a redeploy. Bump `N` whenever `style.css` changes and is redeployed.
