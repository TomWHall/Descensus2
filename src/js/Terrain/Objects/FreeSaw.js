"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const TerrainObject_1 = require("./TerrainObject");
const TerrainObjectType_1 = require("./TerrainObjectType");
const materials_1 = require("../../p2/materials");
const p2Util_1 = require("../../p2/p2Util");
class FreeSaw extends TerrainObject_1.default {
    constructor(world, pixiGraph, textures) {
        super(TerrainObjectType_1.default.FreeSaw, world, pixiGraph);
        const sawBody = this.sawBody = new p2.Body({
            mass: 0.5
        });
        sawBody.damping = 0.5;
        sawBody.isFatal = true;
        sawBody.allowSleep = false;
        const sawSprite = new PIXI.Sprite(textures.sawSmall);
        this.addBody(sawBody, sawSprite, pixiGraph.freeSawContainer);
        const circleShape = new p2.Circle({ radius: 0.75 });
        circleShape.material = materials_1.default.saw;
        this.addShape(sawBody, circleShape);
    }
    activate(position, velocity) {
        super.activate();
        p2Util_1.default.updateBodyPosition(this.sawBody, position);
        this.sawBody.angularVelocity = -2;
        if (velocity) {
            this.sawBody.velocity = velocity;
        }
    }
}
exports.default = FreeSaw;
