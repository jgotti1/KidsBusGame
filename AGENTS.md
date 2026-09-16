# School Bus Learning Adventure — Project Reference

## Workflow

Before committing any change, update this file (`AGENTS.md`) if the change affects anything it describes — commands, architecture, a standing design decision, or deployment. Keeping it current here is what keeps `CLAUDE.md` (which just imports this file) accurate too.

**Never `git commit` (or push) a code change until the owner has actually tested it and confirmed it's good.** Make the edit, run the available static checks (syntax/Prettier), and describe what to test — but leave it uncommitted and wait for their go-ahead before committing.

## Purpose and stack

A cheerful browser learning game originally created for the owner's granddaughter, with selectable question banks for ages 5–6 and 7–9. Plain HTML, CSS, and JavaScript only — no framework, build step, backend, accounts, or tracking. Open `index.html` directly to play, or serve the folder statically.

## Commands

No package manifest, dependencies, or test runner exist. Useful checks:

```sh
node --check game.js
node --check questions-5-6.js
node --check questions-7-9.js
node --check audio.js
npx --yes prettier@3.6.2 --check index.html style.css questions-5-6.js questions-7-9.js game.js audio.js README.md AGENTS.md
```

Use `--write` instead of `--check` to format an edited file. All existing files are Prettier 3.6.2-formatted; keep new edits readable (real indentation/line breaks, not minified or long run-on code).

There is no committed automated test suite. Any correctness checking has been ad hoc (Node `vm`/`Function` scripts with DOM/timer stubs) and is not persisted — don't claim browser/visual verification without actually running the page in a browser.

## Files

- `index.html` — welcome screen, age-selection dialog, bus interior, route, question dialog, ending dialog. Links `style.css`, `questions-5-6.js`, `questions-7-9.js`, `audio.js`, and `game.js` each with a cache-busting query string (see **Deployment**).
- `.htaccess` — Bluehost/Apache cache headers: HTML is served with `Cache-Control: no-store` and `CDN-Cache-Control: no-store` (so the entry page and its `?v=N` links are not retained), while `.css`/`.js` get long-lived immutable caching, since a real content change always comes with a bumped `?v=N` in `index.html`, not the same URL going stale.
- `style.css` — responsive layout, bus scenery, and all boarding/driving/unloading animation keyframes.
- `game.js` — gameplay state machine, scoring, passenger tracking, speech-synthesis narration, and screen transitions. The welcome-screen bus SVG is embedded here as a template string.
- `audio.js` — offline-synthesized background music and engine/road audio via the Web Audio API (no audio files); exposes a `busAudio` singleton. Must load before `game.js`.
- `questions-5-6.js` — standalone 315-question bank for ages 5–6, used when that age group is selected.
- `questions-7-9.js` — standalone 315-question bank for ages 7–9, used when that age group is selected.
- `README.md` — player-facing instructions and feature overview.

## Architecture

### Game state machine (`game.js`)

Top-level mutable state: `correct`, `wrong`, `current` (active question), `ageGroup` (selected for the current trip), `deck` (remaining questions this trip), `locked` (blocks double-answering the active question), `sound`, `startingBus` (true only for the unscored engine-start question), and `passengers` (emoji faces currently aboard, used to render bus windows and later the matching unloaded characters).

Core lifecycle: `ask()` pops the next question from `deck`, renders shuffled choice buttons, opens the `<dialog id="question">`, and calls `read()`. `answer(choice, button)` scores the pick, disables the choices, and always auto-advances — there is no manual "continue" button in the question dialog (see **Narration and pacing**). `goToNext(good)` (called only by the auto-advance timer, with the answer's correctness passed in directly) closes the dialog and routes to `driveToNextStop()` (or the boarding animation before it) when `good`, or back into `ask()` for a retry when not.

Trip progression: `driveToNextStop()` handles both the next-pickup and school-arrival cases; `unloadChildren(atSchool)` pops passengers one at a time into full-body SVG characters via `makeOutsideChild()`; `showOutsideReaction(atSchool)` drives the bus away (`.departing`, then `.bus-departed`) and runs the win/loss group animation before calling `finish()`. On a win, it fills `#scene-confetti` (via the shared `confettiMarkup()` helper, also used by the ending dialog's `#confetti`) as soon as the bus has pulled away. On a loss, the waiting parents (`.family-pair .parent-figure`, added earlier by `unloadChildren`) are visible and arm-waving starting from `.departing` — i.e. while the bus is still pulling away, not only after — via CSS, not JS. `returnChildrenHome()` is the loss-path entry point (bus drives home, doors open, `unloadChildren(false)`).

`prepareFamilies()` builds ten distinct child faces per trip across five skin tones, mapping each to a consistent parent face, hair color, curls, and glasses in `familyProfiles`, so a child's identity (and their waiting/reunited parent) stays consistent through boarding and unloading.

`buildQuestionDeck()` draws one shuffled question per active category per round (20 categories for ages 5–6, 15 for ages 7–9; 315 questions in each bank) so no single large category (e.g. letters) dominates a trip, and questions don't repeat within a trip.

### Age-group question banks (`questions-5-6.js`, `questions-7-9.js`)

`QUESTIONS_5_6` in `questions-5-6.js` and `QUESTIONS_7_9` in `questions-7-9.js` each hold 315 questions as independent, self-contained arrays with no shared helpers or load-order dependencies. Both age files load before `game.js` in `index.html`. Add entries directly to the appropriate array. Each age-bank entry retains the gameplay fields and adds `ageGroup` and an age-prefixed unique ID. The younger bank includes the original questions plus small-number arithmetic, number order, animal families/features, plants, and simple science. The older bank includes reading comprehension, grammar, animal/plant science, Earth/space, experiments, place value, skip counting, money (US nickels), time, multiplication/division, fractions, geometry, and two-digit arithmetic. The `start` button opens `<dialog id="age-selection">`, speaks an intro line, then narrates the two age choices in on-screen order via `readAgeChoice()`, applying the same `.read-highlight` simulated-hover treatment `readChoice()` uses for in-game answer choices (checked against `$("age-selection").open` so a chosen/cancelled dialog stops the chain, mirroring the `locked`/`current` guard in the question reader). The `ages-5-6` and `ages-7-9` buttons call `startTrip(selectedAgeGroup)`, which sets `ageGroup`, clears any leftover highlight, closes the age dialog, starts audio, prepares families, and builds the deck exclusively from that bank. The opening engine-start question comes from the selected bank too. Escape may dismiss the age dialog and cancels its narration without starting a trip. `.age-choices` lays out the two buttons in equal columns. The selection lasts for the current trip. Restart clears it and returns to the welcome screen, so the next Start asks again. The original `questions.js` was removed.

### Narration and pacing (`speak`, `read`, auto-advance)

`speak(text, { rate, pitch, onEnd })` wraps `SpeechSynthesisUtterance`; `onEnd` fires on both `onend` and `onerror` so callers get a completion signal even if the utterance is cancelled, but is deduplicated internally so it fires **at most once** per `speak()` call — some browsers fire both events for the same cancelled utterance, which previously could cascade through `readChoice()`'s recursion (each step calls `speechSynthesis.cancel()`, which could double-trigger the next step) and flood the speech engine. If sound is off or `speechSynthesis` is unavailable, `onEnd` fires synchronously instead of speaking.

`read()`/`readChoice()` speak the question prompt first, then each answer choice **in the order the buttons actually appear on screen** (not `current.choices`' unshuffled order), chaining one `speak()` call per choice via `onEnd`. Each choice gets a `.read-highlight` CSS class (a simulated hover) while it's being read. The chain checks `locked` and that `current` hasn't changed before each step, so answering mid-read or a new question loading cleanly aborts it and clears the highlight.

There is no continue button for either a correct or incorrect answer (not yet at 3 wrong): `answer()` always auto-advances via `goToNext(good)` ~2 seconds after the feedback line finishes speaking, with a 4-second safety timeout in case the speech `onend`/`onerror` events never fire (a known unreliability on iOS Safari) — the game must never stall waiting on a speech event alone. On the second wrong answer specifically, the spoken/displayed feedback appends a warning — "One more wrong question and school is canceled, careful!" — before the same pause-then-advance. The third wrong answer is a separate, earlier-returning branch in `answer()` that always ends the trip via `returnChildrenHome()`, not `goToNext()`.

### Audio (`audio.js`)

`busAudio` synthesizes an instrumental "Wheels on the Bus" melody and an engine/road-noise loop directly into `AudioBuffer`s (no downloaded/recorded audio). `start(soundEnabled)`/`stop()` gate the whole system; `setMoving(bool)` layers the engine rumble during driving segments; `setEnabled(bool)` follows the Sound toggle. Master gain also mutes automatically on `visibilitychange` when the tab is hidden. `startTrip()` calls `busAudio.start(sound)` synchronously from the age-choice click handler; `start()` invokes the internal `resume()` helper to satisfy mobile audio gesture requirements. The Sound toggle calls `setEnabled(bool)`, which also resumes audio when enabling sound during an active trip. The initial Start tap opens age selection; background music begins only after an age group is chosen.

### Motion

All gameplay CSS animations (bus driving, wheels, doors, boarding/unloading, cheering/sad reactions) run unconditionally — **`prefers-reduced-motion` is deliberately not honored**. It was removed after mobile testing showed the OS-level Reduce Motion accessibility setting was silently disabling all gameplay animation; since motion is core to how this game communicates progress (not decorative), the product decision was to always animate rather than respect that preference. Do not reintroduce `@media (prefers-reduced-motion: reduce)` rules without checking with the owner first.

## Standing design decisions

These came from explicit product direction and should not be silently reverted:

- Start must prompt for ages **5–6** or **7–9** before each trip. Use only the selected bank throughout that trip; restart returns to welcome and clears the selection. No age or selection is stored between trips.
- Winning line: **"Yay! We made it to school!"** Losing line: **"Oh man, no school today."** (not "Booo", "Waaaa", or a happy no-school chant).
- No answer (right or wrong) requires a button tap to continue; the question dialog has no continue button at all (see **Narration and pacing**). A second wrong answer speaks/shows a "one more wrong and school is canceled" warning.
- Exterior side-view yellow bus with a visible front hood, wide folding door (16% of bus width), and two smaller, lower road wheels (`width: clamp(44px, 12%, 110px)`, `bottom: -12%`) that don't cover the passenger windows.
- The lower passenger windows must show the **same faces and skin tones as the children who actually boarded**, not generic icons; unloaded children reuse those exact skin tones/hair styles as full-body SVG characters.
- Welcome-screen credit: "Created by MargottiCode @margotticode.com", linking to `https://margotticode.com` in a new tab with `rel="noopener noreferrer"`.
- Winning celebration: confetti falls in the ride scene itself (`#scene-confetti`) once the bus has pulled away, in addition to the ending dialog's own confetti.
- Losing reaction: the waiting parents wave their arms starting as the bus pulls away (`.departing`), not only once it's gone (`.bus-departed`/`.disappointed`).

## Deployment

The GitHub repo (`origin/main`) is **not** the live site and has no CI/auto-deploy configured. The played version is manually hosted on Bluehost at `https://busgame.margotticode.com`, independent of GitHub — pushing to `origin/main` only updates the repo. After any change, the edited files (`index.html`, `style.css`, `game.js`, `audio.js`, `questions-5-6.js`, `questions-7-9.js` as applicable) must also be re-uploaded to Bluehost via cPanel File Manager or FTP/SFTP, and any Bluehost/Cloudflare cache purged if the change doesn't appear.

`index.html` links `style.css`, `questions-5-6.js`, `questions-7-9.js`, `audio.js`, and `game.js` each with their own cache-busting query string (e.g. `style.css?v=N`, `game.js?v=N`) so browsers/CDNs don't keep serving a stale file after a redeploy. Bump a file's own `N` whenever _that_ file changes and is redeployed — the other files' version numbers don't need to move too.

`.htaccess` (uploaded to the Bluehost document root alongside the other files) sets `Cache-Control: no-store` and `CDN-Cache-Control: no-store` on HTML so browsers and CDN layers do not retain the entry page (and its `?v=N` links), while `.css`/`.js` get a one-year immutable cache — safe only because a real change always ships with a bumped `?v=N`, never the same URL. If a change still doesn't appear after redeploying, purge the Bluehost/Cloudflare cache and verify the domain's document root.

### Age-selection deployment and verification

For the age-selection change, upload `index.html`, `style.css`, `game.js`, `questions-5-6.js`, and `questions-7-9.js` together. The current links are `style.css?v=3`, `game.js?v=3`, both age banks at `?v=1`, and unchanged `audio.js?v=2`. The old `questions.js` is no longer loaded or part of the project.

Syntax and Prettier checks passed, as did ad hoc Node checks for the age prompt, both bank selections, exclusive use of the selected bank, 315 unique IDs per deck, audio starting on selection, and restart/reselection. A follow-up fix added `readAgeChoice()` so the age-selection dialog narrates its two choices with the same simulated-hover highlight as in-game questions (previously the dialog spoke only the intro line and then went silent, which read as the prompt stalling/quitting even though the dialog itself stayed open and the buttons stayed clickable). That fix was checked with a headless Chromium run (Playwright against the system Chrome binary, with `speechSynthesis` stubbed to fake instant `onend` callbacks) confirming: the dialog stays open the whole time, both choices are spoken in on-screen order with `.read-highlight` toggling on then off, and choosing an age still sets `ageGroup`, clears the highlight, and starts the trip. This is still not real browser/device verification of actual speech audio or touch interaction. The owner still needs to test both age choices, choice narration/highlighting, question narration, advancing through stops, and restarting in a real browser before any code commit or push. The age-selection changes have not been deployed to Bluehost.
