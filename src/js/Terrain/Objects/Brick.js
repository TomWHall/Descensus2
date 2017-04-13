"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const TerrainObjectType_1 = require("./TerrainObjectType");
const TerrainObject_1 = require("./TerrainObject");
const materials_1 = require("../../p2/materials");
const p2Util_1 = require("../../p2/p2Util");
class Brick extends TerrainObject_1.default {
    constructor(world, pixiGraph, textures) {
        super(TerrainObjectType_1.default.Brick, world, pixiGraph);
        const brickBody = new p2.Body({
            mass: 1
        });
        brickBody.allowSleep = false;
        const brickSprite = new PIXI.Sprite(textures.brick);
        this.addBody(brickBody, brickSprite, pixiGraph.brickContainer);
        const boxShape = new p2.Box({ width: 2, height: 0.625 });
        boxShape.material = materials_1.default.brick;
        this.addShape(brickBody, boxShape);
    }
    activate(position, angle) {
        super.activate();
        p2Util_1.default.updateBodyPosition(this.bodies[0], position, angle);
    }
}
exports.default = Brick;
