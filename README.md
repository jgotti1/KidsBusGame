# KidsBusGame — School Bus Adventure

A cheerful learning game for ages 5–6, created by **MargottiCode** — [margotticode.com](https://margotticode.com).

## Run

Open `index.html` in a browser. No installation, build step, or backend is required. To play on an iPad or another device, publish this folder to a static web host and open its URL in the browser.

## Play

1. Tap **Let’s go!** The game announces “Let’s get this bus rolling!” and reads the opening question.
2. Answer correctly and tap **Start the bus!** This opening question starts the engine without adding a point or passenger. The bus drives to pickup 1.
3. At each stop, answer a learning question and tap **Hop aboard!** after a correct answer. A child boards, the door closes, and the bus drives for three seconds to the next stop.
4. Earn **10 correct pickup answers** to reach school. All ten children get off with full bodies and smiling faces. The empty bus pulls away to reveal the school, then the children jump for joy and cheer **“Yay! We made it to school!”** before the winning screen appears.
5. After **3 wrong answers**, including mistakes on the opening question, the game announces “Sorry, try again. No school today.” It automatically drives home and lets each passenger off. The bus pulls away after unloading, revealing each full-body child beside a matching parent. The parents have sad faces and raise their arms; the children sway gently and say **“Oh man, no school today.”** before **Try again** appears.

Children unload one at a time. The outside group animation lasts four seconds; if the bus is empty, the game skips that group delay. Other answers wait for a tap to continue, so the player can take their time. Restart returns to the welcome screen with a fresh trip.

## Questions and sound

The 156-question bank covers picture words, letter matching, first sounds, counting, number recognition, colors, and shapes. The bank also includes patterns, adding, taking away, rhyming, sorting, comparisons, everyday life, and nature questions. Each trip rotates through 15 shuffled categories without repeating questions, so large letter banks do not dominate the ride. Tap **Listen** to hear the current question again.

A soft instrumental **Wheels on the Bus** melody plays during gameplay. Engine rumble and road noise overlap the music while the bus drives. The **Sound** button controls music, engine sounds, and speech together. Music and engine audio stop at the ending and mute while the tab is hidden.

Music and engine sounds are synthesized locally using Web Audio, with no audio downloads or recorded vocals. Speech uses the browser’s available voices. Audio support and pronunciation vary by device.

## Visuals and accessibility

- Reference-style yellow bus with a visible front hood, wide folding door, and two smaller, lower road wheels that keep passenger windows clear and spin only while driving.
- A varied cast includes five skin tones, different hair colors, curls, glasses, and mother, father, and other parent figures. Each child keeps a consistent matching family profile throughout the ride.
- Ten passenger windows show the exact faces and skin tones of children who boarded, with their skin tones and hair styles carried into the full-body characters when they get off.
- Large answer buttons, responsive layouts, and read-aloud questions.
- Reduced-motion preferences disable CSS animations and transitions.
- Welcome screen credit links to [margotticode.com](https://margotticode.com) in a new tab.

Artwork uses inline SVG, CSS, and emoji. Optional Google Fonts fall back to system fonts offline. There are no accounts, tracking, or stored personal data.

## Project files

| File           | Purpose                                                     |
| -------------- | ----------------------------------------------------------- |
| `index.html`   | Screens, controls, and dialogs                              |
| `style.css`    | Responsive visuals and animations                           |
| `questions.js` | Question bank                                               |
| `audio.js`     | Synthesized melody and driving sounds                       |
| `game.js`      | Scoring, speech, passengers, and game transitions           |
| `AGENTS.md`    | Project handoff and instructions for future coding sessions |

Add questions in `questions.js` using `add(category, picture, prompt, choices, correct)`. Keep `audio.js` loaded before `game.js`.

## Development checks

```sh
node --check game.js
node --check questions.js
node --check audio.js
npx --yes prettier@3.6.2 --check index.html style.css questions.js game.js audio.js README.md AGENTS.md
```

Use `--write` instead of `--check` to format files. Prettier is only a development tool; it is not needed to play.

Ad hoc Node checks have covered question validity, game progression, both endings, passenger identity, restart, and audio controls using browser mocks. These checks are not committed tests. Real browser rendering, iPad layout, and listening checks still need device verification.
