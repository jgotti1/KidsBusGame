/* Self-contained question bank; no network or image downloads needed. */
const QUESTIONS = [];
function add(type, picture, prompt, choices, correct) {
  QUESTIONS.push({
    id: QUESTIONS.length + 1,
    type,
    picture,
    prompt,
    choices,
    correct,
  });
}
const animals = [
  ["🐱", "Cat", "Bat", "Mat"],
  ["🐶", "Dog", "Log", "Fog"],
  ["🐷", "Pig", "Dig", "Big"],
  ["🐔", "Hen", "Pen", "Ten"],
  ["🦊", "Fox", "Box", "Pot"],
  ["🐮", "Cow", "Bow", "Now"],
  ["🐝", "Bee", "See", "Tree"],
  ["🐟", "Fish", "Dish", "Ship"],
  ["🦆", "Duck", "Truck", "Sock"],
  ["🐸", "Frog", "Dog", "Log"],
  ["🦁", "Lion", "Tiger", "Bear"],
  ["🐻", "Bear", "Pear", "Deer"],
  ["🐑", "Sheep", "Sleep", "Ship"],
  ["🐐", "Goat", "Boat", "Coat"],
  ["🐴", "Horse", "House", "Mouse"],
  ["🐭", "Mouse", "House", "Moose"],
  ["🐰", "Rabbit", "Carrot", "Parrot"],
  ["🐢", "Turtle", "Tiger", "Turkey"],
  ["🐘", "Elephant", "Lion", "Monkey"],
  ["🐒", "Monkey", "Donkey", "Rabbit"],
  ["🦓", "Zebra", "Horse", "Giraffe"],
  ["🦉", "Owl", "Cow", "Crow"],
  ["🐌", "Snail", "Whale", "Snake"],
  ["🦀", "Crab", "Cat", "Crow"],
  ["🐳", "Whale", "Shark", "Seal"],
];
animals.forEach(([pic, a, b, c]) =>
  add("Animal words", pic, "Which word matches the picture?", [a, b, c], a),
);
for (let i = 0; i < 26; i++) {
  const a = String.fromCharCode(65 + i),
    b = String.fromCharCode(65 + ((i + 5) % 26)),
    c = String.fromCharCode(65 + ((i + 11) % 26));
  add(
    "Letter discovery",
    a,
    "Which little letter matches?",
    [a.toLowerCase(), b.toLowerCase(), c.toLowerCase()],
    a.toLowerCase(),
  );
}
const words = [
  ["🍎", "Apple"],
  ["⚽", "Ball"],
  ["🐱", "Cat"],
  ["🐶", "Dog"],
  ["🥚", "Egg"],
  ["🐟", "Fish"],
  ["🐐", "Goat"],
  ["🎩", "Hat"],
  ["🧊", "Ice"],
  ["🫙", "Jar"],
  ["🪁", "Kite"],
  ["🍋", "Lemon"],
  ["🌙", "Moon"],
  ["🪺", "Nest"],
  ["🐙", "Octopus"],
  ["🐷", "Pig"],
  ["👑", "Queen"],
  ["🌈", "Rainbow"],
  ["☀️", "Sun"],
  ["🌳", "Tree"],
  ["☂️", "Umbrella"],
  ["🎻", "Violin"],
  ["🍉", "Watermelon"],
  ["🧶", "Yarn"],
  ["🦓", "Zebra"],
];
words.forEach(([pic, word], i) => {
  let a = word[0];
  add(
    "First sounds",
    pic,
    `What letter starts ${word.toLowerCase()}?`,
    [
      a,
      String.fromCharCode(65 + ((a.charCodeAt(0) - 65 + 4) % 26)),
      String.fromCharCode(65 + ((a.charCodeAt(0) - 65 + 9) % 26)),
    ],
    a,
  );
});
for (let n = 1; n <= 10; n++) {
  add(
    "Counting",
    Array(n).fill("⭐").join(" "),
    "How many stars can you count?",
    [String(n), String(n === 10 ? 8 : n + 1), String(n === 1 ? 3 : n - 1)],
    String(n),
  );
  add(
    "Number discovery",
    String(n),
    "Which number is this?",
    [
      "zero",
      "one",
      "two",
      "three",
      "four",
      "five",
      "six",
      "seven",
      "eight",
      "nine",
      "ten",
    ].filter((_, i) => [n, (n + 1) % 11, (n + 3) % 11].includes(i)),
    [
      "zero",
      "one",
      "two",
      "three",
      "four",
      "five",
      "six",
      "seven",
      "eight",
      "nine",
      "ten",
    ][n],
  );
}
[
  ["🔴", "Red", "Blue", "Green"],
  ["🔵", "Blue", "Yellow", "Red"],
  ["🟢", "Green", "Purple", "Blue"],
  ["🟡", "Yellow", "Red", "Green"],
  ["🟣", "Purple", "Orange", "Blue"],
  ["🟠", "Orange", "Green", "Purple"],
  ["⬛", "Black", "White", "Red"],
  ["⬜", "White", "Black", "Blue"],
].forEach(([p, a, b, c]) =>
  add("Colors", p, "What color do you see?", [a, b, c], a),
);
[
  ["●", "Circle", "Square", "Triangle"],
  ["■", "Square", "Circle", "Triangle"],
  ["▲", "Triangle", "Square", "Circle"],
  ["★", "Star", "Circle", "Square"],
].forEach(([p, a, b, c]) =>
  add("Shapes", p, "What shape is this?", [a, b, c], a),
);

// Short, varied activities beyond letter and picture-word matching.
[
  ["🔴 🔵 🔴 🔵 ❓", "What comes next?", ["🔴", "🔵", "🟢"], "🔴"],
  ["⭐ 🌙 ⭐ 🌙 ❓", "What comes next?", ["⭐", "🌙", "☀️"], "⭐"],
  ["🐱 🐶 🐶 🐱 🐶 ❓", "What comes next?", ["🐶", "🐱", "🐭"], "🐶"],
  ["1 2 3 ❓", "Which number comes next?", ["4", "5", "2"], "4"],
  ["2 4 6 ❓", "Count by twos. What comes next?", ["8", "7", "9"], "8"],
  ["🟡 🟡 🟢 🟡 🟡 ❓", "What comes next?", ["🟢", "🟡", "🔵"], "🟢"],
].forEach(([pic, prompt, choices, answer]) =>
  add("Patterns", pic, prompt, choices, answer),
);
[
  ["🍎 + 🍎", "One apple plus one apple makes how many?", ["2", "1", "3"], "2"],
  [
    "⭐⭐ + ⭐",
    "Two stars plus one star makes how many?",
    ["3", "2", "4"],
    "3",
  ],
  [
    "🐟🐟 + 🐟🐟",
    "Two fish plus two fish makes how many?",
    ["4", "3", "5"],
    "4",
  ],
  ["3 + 2", "What is three plus two?", ["5", "4", "6"], "5"],
  ["4 + 1", "What is four plus one?", ["5", "3", "6"], "5"],
  ["5 + 2", "What is five plus two?", ["7", "6", "8"], "7"],
].forEach(([pic, prompt, choices, answer]) =>
  add("Adding", pic, prompt, choices, answer),
);
[
  [
    "🍪🍪🍪",
    "You eat one of these three cookies. How many are left?",
    ["2", "3", "1"],
    "2",
  ],
  [
    "🎈🎈",
    "One of these two balloons flies away. How many are left?",
    ["1", "2", "0"],
    "1",
  ],
  ["5 − 1", "What is five take away one?", ["4", "3", "5"], "4"],
  ["4 − 2", "What is four take away two?", ["2", "1", "3"], "2"],
  ["3 − 3", "What is three take away three?", ["0", "1", "3"], "0"],
  ["6 − 1", "What is six take away one?", ["5", "4", "6"], "5"],
].forEach(([pic, prompt, choices, answer]) =>
  add("Taking away", pic, prompt, choices, answer),
);
[
  [
    "🐘 🐭",
    "Which animal is usually bigger?",
    ["Elephant", "Mouse", "Both the same"],
    "Elephant",
  ],
  ["☀️", "What is the opposite of hot?", ["Cold", "Warm", "Big"], "Cold"],
  ["⬆️", "What is the opposite of up?", ["Down", "Over", "Up"], "Down"],
  [
    "🐢 🐆",
    "Which animal usually moves more slowly?",
    ["Turtle", "Cheetah", "Both the same"],
    "Turtle",
  ],
  [
    "🌞 🌙",
    "What is the opposite of day?",
    ["Night", "Morning", "Lunch"],
    "Night",
  ],
  [
    "🐘 🪶",
    "Which is heavier: an elephant or a feather?",
    ["Elephant", "Feather", "Both the same"],
    "Elephant",
  ],
].forEach(([pic, prompt, choices, answer]) =>
  add("Opposites and comparing", pic, prompt, choices, answer),
);
[
  ["🐱", "Which word rhymes with cat?", ["Hat", "Dog", "Sun"], "Hat"],
  ["🐶", "Which word rhymes with dog?", ["Log", "Cat", "Bed"], "Log"],
  ["☀️", "Which word rhymes with sun?", ["Run", "Sit", "Top"], "Run"],
  ["🐝", "Which word rhymes with bee?", ["Tree", "Ball", "Hat"], "Tree"],
  ["🐷", "Which word rhymes with pig?", ["Big", "Small", "Red"], "Big"],
  ["🛏️", "Which word rhymes with bed?", ["Red", "Blue", "Green"], "Red"],
].forEach(([pic, prompt, choices, answer]) =>
  add("Rhyming", pic, prompt, choices, answer),
);
[
  ["🍎 🍌 🚗", "Which one is not a fruit?", ["Car", "Apple", "Banana"], "Car"],
  ["🐶 🐱 👟", "Which one is not an animal?", ["Shoe", "Dog", "Cat"], "Shoe"],
  [
    "🧦 👕 🥕",
    "Which one is not clothing?",
    ["Carrot", "Sock", "Shirt"],
    "Carrot",
  ],
  [
    "🚗 🚌 🐟",
    "Which one is not a road vehicle?",
    ["Fish", "Car", "Bus"],
    "Fish",
  ],
  [
    "🥁 🎸 🍎",
    "Which one is not a musical instrument?",
    ["Apple", "Drum", "Guitar"],
    "Apple",
  ],
  [
    "🔴 🔵 ■",
    "Which one has corners?",
    ["Square", "Red circle", "Blue circle"],
    "Square",
  ],
].forEach(([pic, prompt, choices, answer]) =>
  add("Sorting", pic, prompt, choices, answer),
);
[
  [
    "🌧️",
    "What helps keep you dry in the rain?",
    ["Umbrella", "Sunglasses", "Sandals"],
    "Umbrella",
  ],
  [
    "❄️",
    "What keeps your hands warm in snow?",
    ["Mittens", "Socks", "Hat"],
    "Mittens",
  ],
  [
    "🌱",
    "What does a plant need to grow?",
    ["Water", "Candy", "Shoes"],
    "Water",
  ],
  ["🐦", "What does a bird use to fly?", ["Wings", "Fins", "Paws"], "Wings"],
  ["🐟", "Where does a fish live?", ["Water", "A tree", "A bed"], "Water"],
  ["👂", "What do you use to hear music?", ["Ears", "Eyes", "Nose"], "Ears"],
].forEach(([pic, prompt, choices, answer]) =>
  add("Our world", pic, prompt, choices, answer),
);
[
  [
    "🧼 🙌",
    "What should you do before eating?",
    ["Wash hands", "Paint hands", "Put on mittens"],
    "Wash hands",
  ],
  [
    "🪥",
    "What do you use to brush your teeth?",
    ["Toothbrush", "Hairbrush", "Spoon"],
    "Toothbrush",
  ],
  [
    "🤝",
    "Your friend shares a toy. What can you say?",
    ["Thank you", "Go away", "Give me more"],
    "Thank you",
  ],
  [
    "😢",
    "Your friend feels sad. What is a kind thing to do?",
    ["Ask if they need help", "Laugh at them", "Hide their toy"],
    "Ask if they need help",
  ],
  [
    "📚",
    "What do you do with a storybook?",
    ["Read it", "Eat it", "Wear it"],
    "Read it",
  ],
  [
    "🌙 🛏️",
    "You feel sleepy at bedtime. What do you do?",
    ["Go to bed", "Start a race", "Pack lunch"],
    "Go to bed",
  ],
].forEach(([pic, prompt, choices, answer]) =>
  add("Everyday life", pic, prompt, choices, answer),
);
