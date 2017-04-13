"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const TerrainObjectType_1 = require("./TerrainObjectType");
const TerrainObject_1 = require("./TerrainObject");
const materials_1 = require("../../p2/materials");
const p2Util_1 = require("../../p2/p2Util");
class Girder extends TerrainObject_1.default {
    constructor(world, pixiGraph, textures) {
        super(TerrainObjectType_1.default.Girder, world, pixiGraph);
        const girderBody = new p2.Body({
            mass: 30
        });
        girderBody.gravityScale = 0;
        const girderSprite = new PIXI.Sprite(textures.girder);
        this.addBody(girderBody, girderSprite, pixiGraph.girderContainer);
        const boxShape = new p2.Box({ width: 4, height: 1 });
        boxShape.material = materials_1.default.wood;
        this.addShape(girderBody, boxShape);
    }
    activate(position, angle) {
        super.activate();
        p2Util_1.default.updateBodyPosition(this.bodies[0], position, angle);
    }
}
exports.default = Girder;
