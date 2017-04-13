const seed = 1;
const mersenneTwister = new MersenneTwister(seed);

/**
 * Reseeds the random number generator
 */
function reseed(): void {
  mersenneTwister.seed(seed);
}

/**
 * Returns a random number between 0 and 1
 */
function random0To1(): number {
  return mersenneTwister.rnd();
}

/**
 * Returns a random number between -1 and 1
 */
function randomNeg1ToPos1(): number {
  return (mersenneTwister.rnd() - 0.5) * 2;
}

/**
 * Returns 1 or -1
 */
function randomSign(): number {
  return randomInt(1, 2) === 1 ? -1 : 1;
}

/**
 * Returns a random integer between min and max
 */
function randomInt(min: number, max: number): number {
  const r = mersenneTwister.rnd();
  return Math.floor(r * (max - min + 1)) + min;
}

/**
 * Returns a random boolean
 */
function randomBoolean(): boolean {
  return randomInt(1, 2) === 1;
}

export default { reseed, random0To1, randomNeg1ToPos1, randomSign, randomInt, randomBoolean }