"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const TerrainObjectType_1 = require("./Terrain/Objects/TerrainObjectType");
const materials_1 = require("./p2/materials");
const Color_1 = require("./Color");
const Bus_1 = require("./Bus");
let body;
function initialize(world, pixiGraph, textures) {
    body = new p2.Body({
        mass: 0.5
    });
    body.allowSleep = false;
    const circle = new p2.Circle({ radius: 1 });
    circle.material = materials_1.default.ball;
    body.addShape(circle);
    const ballSprite = new PIXI.Sprite(textures.ball);
    ballSprite.anchor = new PIXI.ObservablePoint(null, null, 0.5, 0.5);
    ballSprite.tint = ballSprite.originalTint = Color_1.default.blue;
    pixiGraph.playerBallContainer.addChild(ballSprite);
    body.sprite = ballSprite;
    const ballReflectionSprite = new PIXI.Sprite(textures.ballReflections);
    ballReflectionSprite.alpha = 0.5;
    ballReflectionSprite.anchor = new PIXI.ObservablePoint(null, null, 0.5, 0.5);
    pixiGraph.playerBallContainer.addChild(ballReflectionSprite);
    body.spriteReflection = ballReflectionSprite;
    world.addBody(body);
    world.on('beginContact', beginContact, this);
    return body;
}
function beginContact(contactEvent) {
    const bodyA = contactEvent.bodyA;
    const bodyB = contactEvent.bodyB;
    if (bodyA === body || bodyB === body) {
        const otherBody = bodyA === body ? bodyB : bodyA;
        if (otherBody.isFatal) {
            Bus_1.default.publish('Ball.CollisionWithFatal', otherBody);
            return;
        }
        else if (otherBody.isGround) {
            Bus_1.default.publish('Ball.CollisionWithGround');
            return;
        }
        else if (otherBody.terrainObject && otherBody.terrainObject.type === TerrainObjectType_1.default.Plus1Life) {
            otherBody.terrainObject.deactivate();
            Bus_1.default.publish('Ball.CollisionWithPlusOne');
        }
    }
}
exports.default = { initialize };
