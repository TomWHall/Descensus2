"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const materials_1 = require("./p2/materials");
let body;
function initialize(world, pixiGraph, textures) {
    body = new p2.Body();
    body.isGround = true;
    const groundShape = new p2.Box({ width: 32, height: 18 });
    groundShape.material = materials_1.default.wood;
    body.addShape(groundShape);
    const groundSprite = new PIXI.Sprite(textures.ground);
    groundSprite.scale.x = groundSprite.scale.y = 2;
    groundSprite.anchor = new PIXI.ObservablePoint(null, null, 0.5, 0.5);
    pixiGraph.terrainContainer.addChild(groundSprite);
    body.sprite = groundSprite;
    world.addBody(body);
    world.on('beginContact', beginContact, this);
    return body;
}
function beginContact(contactEvent) {
    const bodyA = contactEvent.bodyA;
    const bodyB = contactEvent.bodyB;
    if (!(bodyA === body || bodyB === body))
        return;
    const otherBody = (bodyA === body ? bodyB : bodyA);
    if (otherBody.terrainObject) {
        otherBody.terrainObject.deactivate();
    }
}
exports.default = { initialize };
