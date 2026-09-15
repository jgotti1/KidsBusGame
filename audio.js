// Offline music and engine audio synthesized locally, with no audio downloads.
const busAudio = (() => {
  let context;
  let master;
  let music;
  let engine;
  let active = false;
  let moving = false;
  let enabled = true;

  function createLoop(buffer, volume) {
    const source = context.createBufferSource();
    const gain = context.createGain();
    source.buffer = buffer;
    source.loop = true;
    gain.gain.value = volume;
    source.connect(gain).connect(master);
    source.start();
    return gain;
  }

  function initialize() {
    if (context) return;
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    context = new AudioContext();
    master = context.createGain();
    master.gain.value = 0;
    master.connect(context.destination);

    // Traditional Wheels on the Bus melody, played softly like a music box.
    // Each pair is a MIDI pitch and a duration in beats; null is a rest.
    const melody = [
      [60, 0.5],
      [65, 0.5],
      [65, 0.5],
      [65, 0.5],
      [65, 1],
      [69, 1],
      [72, 1],
      [69, 1],
      [65, 2],
      [67, 1],
      [64, 1],
      [60, 2],
      [72, 1],
      [69, 1],
      [65, 2],
      [60, 0.5],
      [65, 0.5],
      [65, 0.5],
      [65, 0.5],
      [65, 1],
      [69, 1],
      [72, 1],
      [69, 1],
      [65, 2],
      [67, 2],
      [60, 2],
      [65, 3],
      [null, 2],
    ];
    const beat = 0.4;
    const length = melody.reduce((sum, [, beats]) => sum + beats, 0) * beat;
    const song = context.createBuffer(
      1,
      Math.ceil(length * context.sampleRate),
      context.sampleRate,
    );
    const samples = song.getChannelData(0);
    let offset = 0;
    melody.forEach(([note, beats]) => {
      const duration = beats * beat;
      if (note !== null) {
        const frequency = 440 * 2 ** ((note - 69) / 12);
        const start = Math.round(offset * context.sampleRate);
        const frames = Math.floor(duration * 0.9 * context.sampleRate);
        for (let i = 0; i < frames && start + i < samples.length; i++) {
          const t = i / context.sampleRate;
          const envelope =
            Math.min(1, t / 0.012) *
            Math.exp((-3 * t) / duration) *
            Math.min(1, (frames - i) / (context.sampleRate * 0.03));
          samples[start + i] =
            envelope *
            (Math.sin(2 * Math.PI * frequency * t) +
              0.2 * Math.sin(4 * Math.PI * frequency * t)) *
            0.6;
        }
      }
      offset += duration;
    });
    music = createLoop(song, 0.12);

    // A low engine rumble plus filtered road noise, mixed under the melody.
    const rumble = context.createBuffer(
      1,
      context.sampleRate * 4,
      context.sampleRate,
    );
    const road = rumble.getChannelData(0);
    let noise = 0;
    for (let i = 0; i < road.length; i++) {
      const t = i / context.sampleRate;
      noise = 0.97 * noise + 0.03 * (Math.random() * 2 - 1);
      const fade = Math.min(1, i / 1000, (road.length - 1 - i) / 1000);
      road[i] =
        fade *
        (0.3 * Math.sin(2 * Math.PI * 60 * t) +
          0.12 * Math.sin(2 * Math.PI * 90 * t) +
          noise * 0.8) *
        (0.8 + 0.2 * Math.sin(2 * Math.PI * 8 * t));
    }
    engine = createLoop(rumble, 0);
  }

  function update() {
    if (!context) return;
    const audible = active && enabled && !document.hidden;
    master.gain.setTargetAtTime(audible ? 1 : 0, context.currentTime, 0.05);
    engine.gain.setTargetAtTime(moving ? 0.28 : 0, context.currentTime, 0.15);
  }

  function resume() {
    // Called from Start and Sound taps to meet mobile audio gesture requirements.
    try {
      initialize();
      if (context?.state === "suspended") context.resume().catch(() => {});
      update();
    } catch {
      // A browser without working Web Audio can still play the learning game.
    }
  }

  document.addEventListener("visibilitychange", update);
  return {
    start(soundEnabled) {
      active = true;
      enabled = soundEnabled;
      moving = false;
      resume();
    },
    stop() {
      active = false;
      moving = false;
      update();
    },
    setMoving(value) {
      moving = value;
      update();
    },
    setEnabled(value) {
      enabled = value;
      if (enabled && active) resume();
      else update();
    },
  };
})();
