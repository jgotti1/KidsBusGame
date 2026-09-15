# School Bus Learning Adventure — Project Handoff

## Purpose and stack

A cheerful browser learning game for the owner's 6-year-old granddaughter. Use plain HTML, CSS, and JavaScript, large touch controls, and responsive desktop/iPad/mobile layouts. No backend, build step, accounts, or tracking. Open `index.html` directly to play.

## Files

- `index.html`: welcome screen, bus interior, route, question dialog, ending dialog.
- `style.css`: responsive layout, bus scenery, boarding/driving/unloading animations.
- `game.js`: gameplay state, scoring, speech synthesis, passengers, and transitions. The welcome bus SVG is embedded here.
- `audio.js`: offline synthesized music and engine audio; loaded before `game.js`.
- `questions.js`: 156 generated questions covering animals, letters, phonics, numbers, counting, colors, and shapes.
- `README.md`: running instructions and game overview.

## User preferences

- Keep files readable, with indentation and line breaks. Existing files were formatted using Prettier 3.6.2. Avoid minified or long run-on code when editing.
- Act on requested game changes; keep explanations short and plain.
- Latest design follows the supplied yellow bus reference: exterior side view with a visible front hood, wide folding door, two road wheels, and ten passenger windows. Keep large, visible child faces during boarding.
- The lower passenger area must show the **same faces and skin tones as the children who boarded**, not repeated generic icons. When children get off, use full-body SVG characters retaining their skin tones and hair styles, with happy or sad expressions for the ending.
- Latest no-school reaction: **“Oh man, no school today.”** Do not revert to “Booo,” “Waaaa,” or a happy no-school chant.
- The exterior bus door uses 16% of the bus width, preserving wide panels while scaling with the bus.
- Welcome credit: “Created by MargottiCode @margotticode.com”. The domain links to `https://margotticode.com` in a new tab with `noopener noreferrer`.
- Winning reaction: **“Yay! We made it to school!”** All ten children must be outside the bus celebrating before the ending dialog appears.

## Current game flow

1. Start announces “Let’s get this bus rolling! Answer this question to start the bus.” This introduction and the first question are spoken together to avoid speech cancellation.
2. The initial question only starts the engine. A correct answer adds neither a point nor a passenger. The player taps **Start the bus!**, then the bus drives to pickup 1.
3. Incorrect starter answers count toward the three-mistake limit.
4. At each pickup, the player answers a new question. Correct pickup answers add a point. Tap **Hop aboard!** to animate boarding.
5. Boarding lasts 1.5 seconds. The child's face is saved in the `passengers` array and rendered in the bus windows. The door closes; after 0.5 seconds, the bus drives for 3 seconds.
6. Scenery and road markings move during driving, with subtle bus bouncing and rotating road wheels. The next family appears, then the next question opens after 0.7 seconds.
7. Ten correct **pickup** answers bring ten passengers to school. After the final drive, children unload individually as smiling full-body characters. The empty bus drives off to the right for 3 seconds with rotating wheels and engine audio, revealing the school. Children then jump and cheer for 4 seconds before the winning dialog.
8. On the third wrong answer, feedback announces “Sorry, try again. No school today.” The next button is hidden and the loss sequence starts automatically after 2.5 seconds.
9. The bus drives home for 3 seconds, opens the door, and lets the current passengers off one at a time (1 second each). The count aboard decreases without changing the earned score.
10. After unloading, the bus departs for 3 seconds to reveal matching parents beside their children. Parents have sad faces and animated raised arms. Outside, full-body children with sad faces gently sway and say “Oh man, no school today.” The group animation runs for 4 seconds before **Try again** appears. With no passengers, skip the group delay and finish after 0.7 seconds.
11. Restart clears scores, passenger faces, outside children, and animation state, returning to the welcome screen and starter question phase.

## Implementation details

- `startingBus` distinguishes the unscored starter question from pickups.
- `correct` tracks successful pickups; `wrong` tracks all wrong answers.
- `passengers` stores the exact emoji faces taken from `#child` after boarding.
- `renderPassengers()` builds ten `.passenger-head` window slots in a five-column, two-row grid. Empty slots have no face; occupied slots preserve the corresponding passenger identity.
- `driveToNextStop()` handles first pickup, later pickups, and school arrival.
- `returnChildrenHome()` starts the loss drive.
- `unloadChildren(atSchool)` handles both endings, popping passenger faces and creating full-body SVG children in `#outside-kids` via `makeOutsideChild()`.
- `showOutsideReaction(atSchool)` handles the bus departure in both endings and happy/sad group reactions. Departure uses `.departing` then `.bus-departed`, keeping scenery stationary; restart clears these classes, `.disappointed`, and `.family-reunion`.
- `finish()` shows the ending dialog only after unloading and the group reaction.
- Questions and answer choices are shuffled. A trip consumes a category-balanced deck from `buildQuestionDeck()`: one shuffled question from each active category per round. There are 15 categories, including 48 newer pattern, arithmetic, rhyming, sorting, comparison, world, and everyday-life questions. Questions do not repeat within a trip.
- `locked` prevents multiple scoring from the same question.
- Speech uses browser speech synthesis; Sound off mutes it. Voice availability varies by device. `speak()` accepts optional rate/pitch settings, but the current no-school line uses normal defaults.
- Artwork is SVG, CSS, and emoji. Optional Google Fonts have system-font fallbacks.
- CSS honors `prefers-reduced-motion` by disabling transitions and animations while JS timers still advance the game.

## Validation and limitations

Previous checks passed:

- JavaScript syntax checks and Prettier formatting checks.
- All 156 questions have valid, unique answer choices and a correct answer included.
- Starter does not score or board anyone; bus drives to stop 1.
- Ten-pickup win, three-mistake loss, duplicate-answer protection, restart.
- Exact drop-off counts, delayed ending dialogs, and retained score after unloading.
- Exact pickup faces retained in passenger seats and when unloading all ten children.
- Audio activation, engine mixing, mute/unmute, hidden-tab muting, and stopping (mock Web Audio checks).

Gameplay checks used Node's `vm` with a minimal DOM stub and queued timers. They were ad hoc checks, not committed tests. **Actual browser rendering, mobile layout, and device speech have not been verified in this session.** Do not claim visual/browser testing based on the Node checks.

Useful commands:

```sh
node --check game.js
node --check questions.js
node --check audio.js
npx --yes prettier@3.6.2 --check index.html style.css questions.js game.js audio.js README.md AGENTS.md
```

Use `--write` instead of `--check` to format edited files. No dependencies or package manifest are required for playing.

## Current status

All requested changes have been implemented. No pending user-requested feature remains. Read the current source before modifying it; this handoff describes the state at the end of the chat, and the user may make later edits.

## Background music and driving sound

- `audio.js`, loaded before `game.js`, exposes `busAudio`. It synthesizes an instrumental Wheels on the Bus melody and an engine/road loop with Web Audio; no downloaded recordings or vocals.
- Start activates music; every driving segment layers engine rumble over it. Stopping the bus removes the engine layer, while music continues during questions and unloading. Ending/restart stop audio. Sound controls all audio, including speech. Hidden tabs mute music/engine.
- Keep the Sound button available even if speech synthesis is absent: Web Audio may still work. Device listening/browser checks remain necessary.

## Reference-style ride view

The ride scene uses `.ride-scene`, `.side-bus`, a CSS front hood, wide door, and two `.road-wheel` elements with visible hub spokes. `.driving` rotates wheels and bounces the bus; removing that class stops both at pickups and endings. Reduced-motion preferences disable movement. Boarding and unloading animations are positioned at the exterior door. Existing older interior CSS remains scoped out by the newer `.ride-scene` rules. Actual browser visual verification remains outstanding.

- Tires were reduced and lowered to avoid covering passenger windows: `.road-wheel` uses `width: clamp(44px, 12%, 110px)` and `bottom: -12%`. Keep the lower row of faces unobstructed.

## Family profiles and question variety

- `prepareFamilies()` creates ten distinct child faces per ride across five skin tones. `familyProfiles` maps each face to a consistent parent face, hair color, curls, and glasses. `familyRoute` picks the next family. Appearance is varied without assigning nationalities from appearance.
- `makeOutsideChild(face, happy, index, parent)` uses the family profile for full-body children and parents. Loss unloading creates `.family-pair` groups with one parent and child each. Parents are revealed after `.bus-departed` and animate their raised arms during `.disappointed`.
- School ending still has ten smiling children jumping for joy with no parent reunion.
- Latest mock checks: all 156 question records valid; 50 shuffled decks gave 13 distinct opening categories; ten unique pickup faces; matching parent-pair counts for losses with 0, 3, and 9 children; successful school ending; bus departure in both endings; restart cleanup. Visual browser/device verification remains outstanding.
