import TerrainObject from '../Terrain/Objects/TerrainObject';

function tintTerrainObject(terrainObject: TerrainObject, tint: number): void {
  const bodies = terrainObject.bodies;
  for (let i = 0; i < bodies.length; i++) {
    const body = bodies[i];
    tintSprite(body.sprite, tint);
    tintSprite(body.spriteReflection, tint);
  }
}

function untintTerrainObject(terrainObject: TerrainObject): void {
  const bodies = terrainObject.bodies;
  for (let i = 0; i < bodies.length; i++) {
    const body = bodies[i];
    untintSprite(body.sprite);
    untintSprite(body.spriteReflection);
  }
}

function tintSprite(sprite: PIXI.Sprite, tint: number): void {
  if (sprite) {
    sprite.tint = tint;
  }
}

function untintSprite(sprite: PIXI.Sprite): void {
  if (sprite) {
    sprite.tint = sprite.originalTint || 0xffffff;
  }
}

export default { tintTerrainObject, untintTerrainObject, tintSprite, untintSprite }