declare class MersenneTwister {

  constructor(seed?: number);

  public rnd(): number;

  seed(seed: number): void;

}