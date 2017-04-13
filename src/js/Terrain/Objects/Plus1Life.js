"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const TerrainObject_1 = require("./TerrainObject");
const TerrainObjectType_1 = require("./TerrainObjectType");
const materials_1 = require("../../p2/materials");
const p2Util_1 = require("../../p2/p2Util");
class Plus1Life extends TerrainObject_1.default {
    constructor(world, pixiGraph, textures) {
        super(TerrainObjectType_1.default.Plus1Life, world, pixiGraph);
        const plus1LifeBody = this.plus1LifeBody = new p2.Body({
            mass: 0.5
        });
        plus1LifeBody.allowSleep = false;
        plus1LifeBody.damping = 0.8;
        const plus1LifeSprite = new PIXI.Sprite(textures.plus1Life);
        this.addBody(plus1LifeBody, plus1LifeSprite, pixiGraph.plus1LifeContainer);
        const boxShape = new p2.Box({ width: 2, height: 1.203125 });
        boxShape.material = materials_1.default.wood;
        this.addShape(plus1LifeBody, boxShape);
    }
    activate(position) {
        super.activate();
        p2Util_1.default.updateBodyPosition(this.plus1LifeBody, position);
    }
}
exports.default = Plus1Life;
