import ISounds from '../Sound/ISounds';
import Bus from '../Bus';

let sounds: ISounds = null;
let soundSupported: boolean = false;
let soundOn: boolean = false;

Bus.subscribe('Sound.Toggle', () => {
  toggle();
});

function initialize(snds: ISounds) {
  sounds = snds;
  soundSupported = true;
  soundOn = true;

  for (let name in sounds) {
    const audio = sounds[name];
    (audio as any).hackPlaying = false;
    (audio as any).hackPaused = true;

    audio.onplaying = () => {
      (audio as any).hackPlaying = true;
      (audio as any).hackPaused = false;
    };

    audio.onpause = () => {
      (audio as any).hackPlaying = false;
      (audio as any).hackPaused = true;
    };
  }
}

function play(name: string, resuming: boolean = false): void {
  if (!soundSupported || !soundOn) return;

  const audio = sounds[name];

  if (!resuming) {
    audio.currentTime = 0; // Restart if already playing, no overlaps
  }

  if ((audio as any).hackPaused) {
    if (audio === sounds.clock) {
      audio.loop = true;
    }

    audio.play();
  }
}

function pause(name: string): void {
  if (!soundSupported) return;

  const audio = sounds[name];

  if (!(audio as any).hackPaused) {
    audio.pause();
  };
}

function stop(name: string): void {
  if (!soundSupported) return;

  const audio = sounds[name];

  audio.pause();
  audio.currentTime = 0;
}

function pauseAll(): void {
  for (let name in sounds) {
    pause(name);
  }
}

function resumeAll(): void {
  for (let name in sounds) {
    const audio = sounds[name];
    if (audio.paused && audio.currentTime > 0 && !audio.ended) {
      play(name, true);
    }
  }
}

function stopAll(): void {
  for (let name in sounds) {
    stop(name);
  }
}

function toggle(): void {
  if (!soundSupported) return;

  soundOn = !soundOn;

  Bus.publish('Sound.Enable', soundOn);
}

export default { initialize, play, pause, stop, pauseAll, resumeAll, stopAll, toggle };