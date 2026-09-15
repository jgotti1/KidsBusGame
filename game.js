const $ = (id) => document.getElementById(id);
const busArt = `<svg viewBox="0 0 660 440" role="img" aria-label="Happy yellow school bus"><defs><linearGradient id="yellow" x2="0" y2="1"><stop stop-color="#ffda51"/><stop offset="1" stop-color="#ffbd32"/></linearGradient></defs><ellipse cx="338" cy="374" rx="260" ry="23" fill="#66a581" opacity=".2"/><path d="M0 314 Q100 230 230 301 Q425 210 660 295V440H0" fill="#94c999"/><path d="M0 362 Q330 282 660 366V440H0" fill="#b4d9a4"/><path d="M0 407 Q330 332 660 411" fill="none" stroke="#f9e8b7" stroke-width="52"/><g transform="rotate(-3 340 250)"><rect x="110" y="104" width="421" height="222" rx="42" fill="url(#yellow)" stroke="#bf821e" stroke-width="4"/><path d="M520 211h38q29 0 29 30v81H502" fill="#ffc337" stroke="#bf821e" stroke-width="4"/><rect x="132" y="146" width="338" height="96" rx="15" fill="#497c85"/><g fill="#bfedf0" stroke="#ffd150" stroke-width="10"><path d="M140 154h65v80h-65z"/><path d="M212 154h65v80h-65z"/><path d="M284 154h65v80h-65z"/><path d="M356 154h65v80h-65z"/><path d="M428 154h35v80h-35z"/></g><g font-size="47"><text x="144" y="225">👧🏽</text><text x="217" y="225">🧒🏻</text><text x="288" y="225">👦🏾</text><text x="360" y="225">👧🏻</text></g><path d="M480 150h32v155h-32z" fill="#91cdd6" stroke="#ad7924" stroke-width="5"/><path d="M496 153v150" stroke="#ad7924" stroke-width="4"/><path d="M125 259h335M125 278h335" stroke="#ce9027" stroke-width="6"/><rect x="112" y="308" width="481" height="19" rx="8" fill="#385468"/><g fill="#304957" stroke="#223b4c" stroke-width="4"><circle cx="206" cy="328" r="43"/><circle cx="504" cy="328" r="43"/></g><g fill="#e0e8e4" stroke="#829aa0" stroke-width="7"><circle cx="206" cy="328" r="23"/><circle cx="504" cy="328" r="23"/></g><rect x="553" y="260" width="27" height="18" rx="7" fill="#fff4c1"/><text x="247" y="131" font-size="17" font-weight="900" fill="#5d531e" letter-spacing="4">SCHOOL BUS</text><path d="M537 294q17 12 32-1" stroke="#7c652a" stroke-width="4" fill="none" stroke-linecap="round"/></g><g fill="#fff" opacity=".95"><path d="M65 95q-20-29 13-36 12-35 43-12 35-4 36 30 22 21-9 24H65"/><path d="M458 56q-5-23 23-23 12-30 35-12 33-7 36 22 30 17 2 25h-89"/></g><circle cx="565" cy="110" r="36" fill="#ffe393"/><g fill="#498569"><path d="M51 316v-81l-35 51h22l-29 30z"/><path d="M617 320v-110l-38 60h22l-32 50z"/></g></svg>`;
$("hero-art").innerHTML = busArt;
let correct = 0,
  wrong = 0,
  current = null,
  deck = [],
  locked = false,
  sound = true,
  startingBus = true,
  passengers = [],
  autoAdvanceTimer = null;
const shuffle = (a) => {
  a = [...a];
  for (let i = a.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};
// Rotate categories instead of letting the larger letter banks dominate a ride.
function buildQuestionDeck() {
  const groups = new Map();
  QUESTIONS.forEach((question) => {
    if (!groups.has(question.type)) groups.set(question.type, []);
    groups.get(question.type).push(question);
  });
  groups.forEach((questions, type) => groups.set(type, shuffle(questions)));
  const order = [];
  while (groups.size) {
    const types = shuffle([...groups.keys()]);
    if (types.length > 1 && types[0] === order.at(-1)?.type) {
      [types[0], types[1]] = [types[1], types[0]];
    }
    types.forEach((type) => {
      const pool = groups.get(type);
      order.push(pool.pop());
      if (!pool.length) groups.delete(type);
    });
  }
  return order.reverse();
}

const familyProfiles = new Map();
let familyRoute = [];
function prepareFamilies() {
  familyProfiles.clear();
  const tones = shuffle(["🏻", "🏼", "🏽", "🏾", "🏿"]);
  familyRoute = Array.from({ length: 10 }, (_, i) => {
    const face = ["👧", "👦"][Math.floor(i / 5)] + tones[i % 5];
    familyProfiles.set(face, {
      parent: ["👩", "👨", "🧑"][i % 3] + tones[i % 5],
      hair: ["#29231f", "#69422d", "#c78538", "#3b2824", "#b45432"][i % 5],
      curls: i % 3 === 0,
      glasses: i % 4 === 0,
    });
    return face;
  });
}

function route() {
  $("route").innerHTML =
    `<span class="route-bus">🚌</span>` +
    Array.from(
      { length: 10 },
      (_, i) =>
        `<span class="route-stop ${i < correct ? "done" : ""}" ${i === correct ? 'aria-current="step"' : ""}>${i < correct ? "✓" : i + 1}</span>`,
    ).join("") +
    '<span class="route-school">🏫</span>';
}
function speak(text, { rate = 0.85, pitch = 1, onEnd } = {}) {
  if (!sound || !("speechSynthesis" in window)) {
    if (onEnd) onEnd();
    return;
  }
  window.speechSynthesis.cancel();
  const utter = new SpeechSynthesisUtterance(text);
  const voices = window.speechSynthesis.getVoices();
  utter.voice =
    voices.find(
      (v) =>
        v.lang.startsWith("en") && /Samantha|Karen|Susan|Zira/i.test(v.name),
    ) ||
    voices.find((v) => v.lang.startsWith("en")) ||
    null;
  utter.lang = "en-US";
  utter.rate = rate;
  utter.pitch = pitch;
  if (onEnd) {
    utter.onend = onEnd;
    utter.onerror = onEnd;
  }
  window.speechSynthesis.speak(utter);
}
// Reads choices in their on-screen order, highlighting each like a hover
// while it's spoken. Guards against a stale question or a since-answered
// question still finishing a chain of callbacks.
function readChoice(question, buttons, index) {
  buttons.forEach((b) => b.classList.remove("read-highlight"));
  if (locked || current !== question || index >= buttons.length) return;
  const button = buttons[index];
  button.classList.add("read-highlight");
  speak(button.textContent, {
    onEnd: () => readChoice(question, buttons, index + 1),
  });
}
function read(introduction = "") {
  const question = current;
  const buttons = [...$("choices").children];
  speak(
    `${introduction}${current.prompt} ${/Letter|Number/.test(current.type) ? current.picture + ". " : ""} Your choices are:`,
    { onEnd: () => readChoice(question, buttons, 0) },
  );
}
function ask(introduction = "") {
  locked = false;
  current = deck.pop();
  $("category").textContent = startingBus ? "Start the bus" : current.type;
  $("picture").textContent = current.picture;
  $("prompt").textContent = current.prompt;
  $("feedback").textContent = "Take your time. You’ve got this!";
  $("choices").replaceChildren();
  shuffle(current.choices).forEach((choice) => {
    const b = document.createElement("button");
    b.textContent = choice;
    b.onclick = () => answer(choice, b);
    $("choices").append(b);
  });
  $("question").showModal();
  read(introduction);
}
function answer(choice, button) {
  if (locked) return;
  locked = true;
  const good = choice === current.correct;
  if (!good) wrong++;
  else if (!startingBus) correct++;
  button.classList.add(good ? "right" : "incorrect");
  [...$("choices").children].forEach((b) => {
    b.disabled = true;
    b.classList.remove("read-highlight");
    if (b.textContent === current.correct) b.classList.add("right");
  });
  $("correct").textContent = correct;
  $("wrong").textContent = wrong;
  $("feedback").textContent = good
    ? startingBus
      ? "You did it! Let’s start the bus!"
      : "Wonderful! A new friend is hopping aboard."
    : wrong === 2
      ? `Good try! The answer is ${current.correct}. One more wrong question and school is canceled, careful!`
      : `Good try! The answer is ${current.correct}. Let’s keep learning.`;
  if (wrong === 3) {
    $("feedback").textContent = "Sorry, try again. No school today.";
    speak($("feedback").textContent);
    route();
    setTimeout(returnChildrenHome, 2500);
    return;
  }
  route();
  // No button to continue: the game reads the feedback line (praise, or the
  // answer plus a pause) then moves itself to the next question or stop.
  // Speech "end" events are unreliable on iOS Safari, so a safety timer also
  // guarantees the game keeps moving even if that event never fires.
  clearTimeout(autoAdvanceTimer);
  let advanced = false;
  const proceed = () => {
    if (advanced) return;
    advanced = true;
    autoAdvanceTimer = setTimeout(() => goToNext(good), 2000);
  };
  setTimeout(proceed, 4000);
  speak($("feedback").textContent, { onEnd: proceed });
}
function confettiMarkup(count = 24) {
  return Array.from(
    { length: count },
    (_, i) =>
      `<i style="--x:${Math.random() * 100}%;--delay:${Math.random() * 2}s;--color:${["#ffc842", "#74bcb0", "#f19aa1", "#7cafd7"][i % 4]}"></i>`,
  ).join("");
}
function finish() {
  busAudio.stop();
  const won = correct === 10;
  $("end-icon").textContent = won ? "🏫 🌟" : "🚌 💛";
  $("end-title").textContent = won
    ? "Yay! We made it to school!"
    : "Oh man, no school today.";
  $("end-copy").textContent = won
    ? "Ten friends, ten discoveries, and one happy school day. Wonderful work!"
    : `Everyone is safely home. You found ${correct} correct ${correct === 1 ? "answer" : "answers"}! Let’s try again.`;
  $("confetti").innerHTML = won ? confettiMarkup() : "";
  $("restart").textContent = won ? "Let’s ride again ↻" : "Try again ↻";
  $("ending").showModal();
  speak($("end-title").textContent, {});
}
const DRIVE_DURATION = 3000;

// Keep the earned score while the number of children aboard counts down.
function returnChildrenHome() {
  $("question").close();
  $("welcome").hidden = true;
  $("features").hidden = true;
  $("ride").hidden = false;
  $("family").hidden = true;
  $("family").classList.remove("boarding");
  $("door").classList.remove("open");
  $("ride-title").textContent = "Let’s take everyone safely home.";
  $("ride").classList.add("driving");
  busAudio.setMoving(true);

  setTimeout(() => {
    $("ride").classList.remove("driving");
    busAudio.setMoving(false);
    $("stop-house").textContent = "🏡";
    $("ride-title").textContent = "We’re home! Time to hop off.";
    unloadChildren(false);
  }, DRIVE_DURATION);
}

function renderPassengers() {
  $("passengers").replaceChildren();
  Array.from({ length: 10 }, (_, i) => passengers[i] || "").forEach((face) => {
    const head = document.createElement("span");
    head.className = "passenger-head";
    head.textContent = face;
    $("passengers").append(head);
  });
  $("passengers").setAttribute(
    "aria-label",
    `${passengers.length} friends on the bus`,
  );
}

// Full-body characters keep each passenger's skin tone and hair style.
function makeOutsideChild(face, happy, index, parent = false) {
  const profile = familyProfiles.get(face) || {};
  const hairColor = profile.hair || "#493328";
  const child = document.createElement("span");
  child.className = `full-child ${happy ? "happy-child" : "sad-child"}`;
  if (parent) child.classList.add("parent-figure");
  child.setAttribute("role", "img");
  child.setAttribute(
    "aria-label",
    parent
      ? "Sad parent raising their arms"
      : happy
        ? "Smiling child"
        : "Sad child",
  );
  const tones = ["🏻", "🏼", "🏽", "🏾", "🏿"];
  const skin = ["#f7d5b5", "#e9ba91", "#c88e65", "#97603f", "#63402f"][
    Math.max(
      0,
      tones.findIndex((tone) => face.includes(tone)),
    )
  ];
  const shirt = ["#ef797e", "#629ed8", "#aa83d3", "#60b79b", "#efad45"][
    index % 5
  ];
  const hair = (parent ? profile.parent?.includes("👩") : face.includes("👧"))
    ? '<path d="M20 23Q6 30 12 57L24 47M50 23Q64 30 58 57L46 47" fill="#493328"/>'
    : "";
  const mouth = happy ? "M27 35Q35 46 43 35" : "M27 41Q35 31 43 41";
  child.innerHTML = `<svg viewBox="0 0 70 130" aria-hidden="true">
    <ellipse cx="35" cy="124" rx="24" ry="4" fill="#506c5b" opacity=".16"/>
    <g stroke="#354f69" stroke-width="10" stroke-linecap="round">
      <path d="M28 89L25 116"/><path d="M42 89L45 116"/>
    </g>
    <path d="M17 120h13M40 120h13" stroke="#293f4d" stroke-width="8" stroke-linecap="round"/>
    <g class="child-arms" stroke="${skin}" stroke-width="9" stroke-linecap="round" fill="none">
      <path d="M23 60L12 ${happy || parent ? "43" : "83"}"/><path d="M47 60L58 ${happy || parent ? "43" : "83"}"/>
    </g>
    <path d="M23 53Q35 49 47 53L50 89H20Z" fill="${shirt}"/>
    <path d="M30 47v8q5 6 10 0v-8" fill="${skin}"/>
    ${hair}
    <circle cx="35" cy="29" r="23" fill="${skin}"/>
    <path d="M12 27Q9 2 35 3Q60 2 58 26L48 17Q35 24 22 15Z" fill="#493328"/>
    <g fill="#342e2a"><circle cx="27" cy="29" r="2.4"/><circle cx="43" cy="29" r="2.4"/></g>
    <path d="${mouth}" stroke="#743e35" stroke-width="2.8" fill="none" stroke-linecap="round"/>
    ${happy ? "" : '<path d="M22 22l7 3M41 25l7-3" stroke="#493328" stroke-width="2" fill="none"/>'}
  </svg>`;
  child.innerHTML = child.innerHTML.replaceAll("#493328", hairColor);
  const details = `${profile.curls ? `<g fill="${hairColor}"><circle cx="17" cy="14" r="8"/><circle cx="28" cy="9" r="8"/><circle cx="40" cy="9" r="8"/><circle cx="52" cy="14" r="8"/></g>` : ""}${profile.glasses ? '<g fill="none" stroke="#374b66" stroke-width="2"><circle cx="27" cy="29" r="6"/><circle cx="43" cy="29" r="6"/><path d="M33 29h4"/></g>' : ""}`;
  child.innerHTML = child.innerHTML.replace("</svg>", `${details}</svg>`);
  child.style.animationDelay = `${index * -0.13}s`;
  return child;
}

function showOutsideReaction(atSchool) {
  const celebrate = () => {
    const chant = atSchool
      ? "Yay! We made it to school!"
      : "Oh man, no school today.";
    $("ride-title").textContent = chant;
    $("outside-kids").classList.add(atSchool ? "cheering" : "disappointed");
    if (atSchool) $("scene-confetti").innerHTML = confettiMarkup();
    if (correct) speak(chant);
    setTimeout(finish, correct ? 4000 : 700);
  };

  // Only the empty bus moves: the school and children stay in place.
  $("ride-title").textContent = atSchool
    ? "Bye, bus! Hello, school!"
    : "Bye, bus! Our families are here.";
  $("ride").classList.add("departing");
  busAudio.setMoving(true);
  setTimeout(() => {
    $("ride").classList.remove("departing");
    $("ride").classList.add("bus-departed");
    busAudio.setMoving(false);
    celebrate();
  }, DRIVE_DURATION);
}

function unloadChildren(atSchool) {
  $("outside-kids").classList.toggle("family-reunion", !atSchool);
  $("door").classList.add("open");
  let aboard = passengers.length;

  function letChildOff() {
    if (aboard === 0) {
      $("door").classList.remove("open");
      showOutsideReaction(atSchool);
      return;
    }

    const face = passengers.pop();
    const childIndex = correct - aboard;
    const child = makeOutsideChild(face, atSchool, childIndex);
    child.classList.add("exiting-child");
    child.style.animationDelay = "0s";
    child.setAttribute("aria-hidden", "true");
    $("door").parentElement.append(child);
    aboard--;
    renderPassengers();
    $("ride-title").textContent =
      `${aboard} ${aboard === 1 ? "friend" : "friends"} left on the bus`;
    setTimeout(() => {
      child.remove();
      const friend = makeOutsideChild(face, atSchool, childIndex);
      if (atSchool) {
        $("outside-kids").append(friend);
      } else {
        const pair = document.createElement("div");
        pair.className = "family-pair";
        const parent = makeOutsideChild(face, false, childIndex, true);
        pair.append(parent, friend);
        $("outside-kids").append(pair);
      }
      letChildOff();
    }, 1000);
  }

  // The door finishes opening before the first child steps off.
  setTimeout(letChildOff, 500);
}

function driveToNextStop() {
  const headingToSchool = correct === 10;
  $("family").hidden = true;
  $("family").classList.remove("boarding");
  $("ride").classList.add("driving");
  busAudio.setMoving(true);
  $("ride-title").textContent = headingToSchool
    ? "Next stop: school!"
    : "Off we go! Let’s find our next friend.";

  setTimeout(() => {
    $("ride").classList.remove("driving");
    busAudio.setMoving(false);
    if (headingToSchool) {
      $("arrival").hidden = false;
      $("ride-title").textContent = "Hello, school!";
      unloadChildren(true);
      return;
    }

    const face = familyRoute[correct];
    $("child").textContent = face;
    $("mom").textContent = familyProfiles.get(face).parent;
    $("stop-house").textContent = ["🏡", "🏠", "🌳"][correct % 3];
    $("family").hidden = false;
    $("ride-title").textContent = `A new friend at stop ${correct + 1}`;
    // Let the player see the waiting family before the question appears.
    setTimeout(ask, 700);
  }, DRIVE_DURATION);
}

$("start").onclick = () => {
  busAudio.start(sound);
  deck = buildQuestionDeck();
  prepareFamilies();
  ask("Let’s get this bus rolling! Answer this question to start the bus. ");
};
function goToNext(good) {
  clearTimeout(autoAdvanceTimer);
  $("question").close();
  if ("speechSynthesis" in window) window.speechSynthesis.cancel();
  if (wrong === 3) {
    return;
  }
  if (good) {
    $("welcome").hidden = true;
    $("features").hidden = true;
    $("ride").hidden = false;
    if (startingBus) {
      startingBus = false;
      driveToNextStop();
      return;
    }
    $("door").classList.add("open");
    $("family").classList.add("boarding");
    $("ride-title").textContent = "Welcome aboard, friend!";
    setTimeout(() => {
      passengers.push($("child").textContent);
      renderPassengers();
      $("door").classList.remove("open");
      // Give the door time to close before the bus pulls away.
      setTimeout(driveToNextStop, 500);
    }, 1500);
  } else ask();
}
$("restart").onclick = () => {
  busAudio.stop();
  $("ending").close();
  correct = 0;
  wrong = 0;
  startingBus = true;
  $("outside-kids").replaceChildren();
  $("outside-kids").classList.remove(
    "cheering",
    "disappointed",
    "family-reunion",
  );
  $("scene-confetti").replaceChildren();
  $("ride").classList.remove("departing", "bus-departed");
  $("correct").textContent = 0;
  $("wrong").textContent = 0;
  passengers = [];
  renderPassengers();
  $("arrival").hidden = true;
  $("family").hidden = false;
  $("family").classList.remove("boarding");
  $("ride").classList.remove("driving");
  busAudio.setMoving(false);
  $("ride").hidden = true;
  $("welcome").hidden = false;
  $("features").hidden = false;
  route();
  $("start").focus();
};
$("listen").onclick = () => read();
$("sound").onclick = () => {
  sound = !sound;
  busAudio.setEnabled(sound);
  $("sound").setAttribute("aria-pressed", String(sound));
  $("sound").innerHTML = `♫ <span>Sound ${sound ? "on" : "off"}</span>`;
  if (!sound && "speechSynthesis" in window) window.speechSynthesis.cancel();
};
[$("question"), $("ending")].forEach((d) =>
  d.addEventListener("cancel", (e) => e.preventDefault()),
);
if (!("speechSynthesis" in window)) {
  $("listen").hidden = true;
}
route();
renderPassengers();
