# KidsBusGame — School Bus Adventure

A cheerful learning game for ages 5–9, created by **MargottiCode** — [margotticode.com](https://margotticode.com) — and designed together with my 5-year-old granddaughter, who directed the gameplay and rules as we went.

## Run

Open `index.html` in a browser. No installation, build step, or backend is required. To play on an iPad or another device, publish this folder to a static web host and open its URL in the browser.

## Play

1. Tap **Let’s go!**, then choose **Ages 5–6** or **Ages 7–9** for this trip. The game announces “Let’s get this bus rolling!” and reads the opening question.
2. Answer the opening question correctly. This opening question starts the engine without adding a point or passenger. The bus drives to pickup 1.
3. At each stop, answer a learning question. After a correct answer, A child boards, the door closes, and the bus drives for three seconds to the next stop.
4. Earn **10 correct pickup answers** to reach school. All ten children get off with full bodies and smiling faces. The empty bus pulls away to reveal the school, then the children jump for joy and cheer **“Yay! We made it to school!”** before the winning screen appears.
5. After **3 wrong answers**, including mistakes on the opening question, the game announces “Sorry, try again. No school today.” It automatically drives home and lets each passenger off. The bus pulls away after unloading, revealing each full-body child beside a matching parent. The parents have sad faces and raise their arms; the children sway gently and say **“Oh man, no school today.”** before **Try again** appears.

Children unload one at a time. The outside group animation lasts four seconds; if the bus is empty, the game skips that group delay. Answers advance automatically after spoken feedback and a short pause. Restart returns to the welcome screen; tap Start to choose an age group for the next trip.

## Questions and sound

The ages 5–6 bank covers picture words, letter matching, first sounds, counting, number recognition, colors, and shapes. The bank also includes patterns, adding, taking away, rhyming, sorting, comparisons, everyday life, and nature questions. Each trip rotates through the selected bank’s shuffled categories without repeating questions, so large letter banks do not dominate the ride. Tap **Listen** to hear the current question again.

A soft instrumental **Wheels on the Bus** melody plays during gameplay. Engine rumble and road noise overlap the music while the bus drives. The **Sound** button controls music, engine sounds, and speech together. Music and engine audio stop at the ending and mute while the tab is hidden.

Music and engine sounds are synthesized locally using Web Audio, with no audio downloads or recorded vocals. Speech uses the browser’s available voices. Audio support and pronunciation vary by device.

## Visuals and accessibility

- Reference-style yellow bus with a visible front hood, wide folding door, and two smaller, lower road wheels that keep passenger windows clear and spin only while driving.
- A varied cast includes five skin tones, different hair colors, curls, glasses, and mother, father, and other parent figures. Each child keeps a consistent matching family profile throughout the ride.
- Ten passenger windows show the exact faces and skin tones of children who boarded, with their skin tones and hair styles carried into the full-body characters when they get off.
- Large answer buttons, responsive layouts, and read-aloud questions.
- Gameplay animations always run to show trip progress.
- Welcome screen credit links to [margotticode.com](https://margotticode.com) in a new tab.

Artwork uses inline SVG, CSS, and emoji. Optional Google Fonts fall back to system fonts offline. There are no accounts, tracking, or stored personal data.

## Project files

| File               | Purpose                                                     |
| ------------------ | ----------------------------------------------------------- |
| `index.html`       | Screens, controls, and dialogs                              |
| `style.css`        | Responsive visuals and animations                           |
| `questions-5-6.js` | 315 questions for ages 5–6                                  |
| `questions-7-9.js` | 315 questions for ages 7–9                                  |
| `audio.js`         | Synthesized melody and driving sounds                       |
| `game.js`          | Scoring, speech, passengers, and game transitions           |
| `AGENTS.md`        | Project handoff and instructions for future coding sessions |

The game uses two equally sized banks: `QUESTIONS_5_6` in `questions-5-6.js` and `QUESTIONS_7_9` in `questions-7-9.js`, with 315 questions each. The selected bank supplies every question for the current trip, including the opening question. Ages 5–6 add small-number math, animal families and features, plants, and simple science. Ages 7–9 cover reading meaning, grammar, arithmetic, time, US coin values, fractions, geometry, animal and plant science, Earth and space, and experiments.

Add questions directly to the array in the appropriate age file, keeping each ID unique and including `ageGroup`, `type`, `picture`, `prompt`, three `choices`, and `correct`. Both age files load before `game.js` in `index.html`. Keep `audio.js` loaded before `game.js`.

## Development checks

```sh
node --check game.js
node --check questions-5-6.js
node --check questions-7-9.js
node --check audio.js
npx --yes prettier@3.6.2 --check index.html style.css questions-5-6.js questions-7-9.js game.js audio.js README.md AGENTS.md
```

Use `--write` instead of `--check` to format files. Prettier is only a development tool; it is not needed to play.

Ad hoc Node checks have covered question validity, game progression, both endings, passenger identity, restart, and audio controls using browser mocks. These checks are not committed tests. Real browser rendering, iPad layout, and listening checks still need device verification.

## Hosting

The game is a static site, so any static host works. It is deployed on Vercel (project `kids-bus-game`) and served at `https://busgame.margotticode.com`, whose DNS record stays at Bluehost (an `A` record for `busgame` pointing to `76.76.21.21`). Deploy with `npx vercel@latest deploy --prod --scope john-74e3`. `vercel.json` sets the same cache headers as `.htaccess`.

## Portfolio card

The block below is machine-readable project info for a portfolio site (invisible on GitHub). Keep it in sync when the project, URL or tech changes. To build a card: read this JSON and use `title`, `tagline`/`description`, `thumbnail`, `tech`, and link to `liveUrl` and `repoUrl`.

<!-- portfolio-card:start
{
  "title": "School Bus Adventure",
  "category": "game",
  "tagline": "A cheerful learning game where kids answer questions to pick up friends and ride the bus to school.",
  "description": "A browser learning game for ages 5–9 with separate question banks for ages 5–6 and 7–9. Kids answer narrated questions to pick up ten children and reach school, and a Level 2 classroom round follows a win. Everything is read aloud, and the music and engine sounds are synthesized in the browser, with no accounts, tracking or backend.",
  "liveUrl": "https://busgame.margotticode.com",
  "repoUrl": "https://github.com/jgotti1/KidsBusGame",
  "thumbnail": "https://raw.githubusercontent.com/jgotti1/KidsBusGame/main/docs/preview.jpg",
  "tech": [
    "HTML",
    "CSS",
    "JavaScript",
    "Web Audio API",
    "Web Speech API",
    "SVG",
    "Vercel"
  ],
  "features": [
    "Two age-based question banks with 315 questions each",
    "Questions and answer choices read aloud with a voice picker",
    "Animated bus ride with children who match their families",
    "Level 2 classroom mode with a teacher and whiteboard",
    "Music and engine sounds synthesized with Web Audio"
  ],
  "platforms": [
    "desktop",
    "tablet",
    "mobile"
  ],
  "status": "live",
  "origin": "Designed with my 5-year-old granddaughter, who directed the gameplay and rules as we built it"
}
portfolio-card:end -->
