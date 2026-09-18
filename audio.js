// Offline music and engine audio synthesized locally, with no audio downloads.
const busAudio = (() => {
  let context;
  let master;
  let music;
  let classroomMusic;
  let track = "bus";
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

  // Renders a melody (MIDI pitch, beats) into a looping music-box buffer.
  function buildSong(melody, beat) {
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
    return song;
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
    music = createLoop(buildSong(melody, 0.4), 0.12);
    // Twinkle Twinkle Little Star, slower and softer for the classroom.
    const phraseA = [
      72,
      72,
      79,
      79,
      81,
      81,
      [79, 2],
      77,
      77,
      76,
      76,
      74,
      74,
      [72, 2],
    ];
    const phraseB = [79, 79, 77, 77, 76, 76, [74, 2]];
    const twinkle = [phraseA, phraseB, phraseB, phraseA]
      .flat(1)
      .map((n) => (Array.isArray(n) ? n : [n, 1]));
    twinkle.push([null, 2]);
    classroomMusic = createLoop(buildSong(twinkle, 0.55), 0);

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
    music.gain.setTargetAtTime(
      track === "bus" ? 0.12 : 0,
      context.currentTime,
      0.05,
    );
    classroomMusic.gain.setTargetAtTime(
      track === "classroom" ? 0.08 : 0,
      context.currentTime,
      0.05,
    );
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
    start(soundEnabled, which = "bus") {
      active = true;
      track = which;
      enabled = soundEnabled;
      moving = false;
      resume();
    },
    stop() {
      active = false;
      moving = false;
      update();
    },
    // Plays a run of hand claps (short filtered noise bursts) for the teacher.
    clap(times = 8) {
      try {
        if (!context || !active || !enabled || document.hidden) return;
        const length = Math.floor(context.sampleRate * 0.07);
        const burst = context.createBuffer(1, length, context.sampleRate);
        const data = burst.getChannelData(0);
        for (let i = 0; i < length; i++) {
          data[i] = (Math.random() * 2 - 1) * Math.exp((-i / length) * 7);
        }
        for (let n = 0; n < times; n++) {
          const source = context.createBufferSource();
          const filter = context.createBiquadFilter();
          const gain = context.createGain();
          source.buffer = burst;
          filter.type = "bandpass";
          filter.frequency.value = 1800;
          gain.gain.value = 0.7;
          source.connect(filter).connect(gain).connect(master);
          source.start(context.currentTime + n * 0.4);
        }
      } catch {
        // Clapping is decoration; the game continues without it.
      }
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
