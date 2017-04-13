interface ISounds {
  saw: HTMLAudioElement;
  checkpoint: HTMLAudioElement;
  lostLife: HTMLAudioElement;
  gainedLife: HTMLAudioElement;
  clock: HTMLAudioElement;
  alarm: HTMLAudioElement;
  won: HTMLAudioElement;
  lost: HTMLAudioElement;

  [key: string]: HTMLAudioElement;
}

export default ISounds;