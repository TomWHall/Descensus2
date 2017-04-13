"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function tintTerrainObject(terrainObject, tint) {
    const bodies = terrainObject.bodies;
    for (let i = 0; i < bodies.length; i++) {
        const body = bodies[i];
        tintSprite(body.sprite, tint);
        tintSprite(body.spriteReflection, tint);
    }
}
function untintTerrainObject(terrainObject) {
    const bodies = terrainObject.bodies;
    for (let i = 0; i < bodies.length; i++) {
        const body = bodies[i];
        untintSprite(body.sprite);
        untintSprite(body.spriteReflection);
    }
}
function tintSprite(sprite, tint) {
    if (sprite) {
        sprite.tint = tint;
    }
}
function untintSprite(sprite) {
    if (sprite) {
        sprite.tint = sprite.originalTint || 0xffffff;
    }
}
exports.default = { tintTerrainObject, untintTerrainObject, tintSprite, untintSprite };
