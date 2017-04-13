"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const TerrainObject_1 = require("./TerrainObject");
const TerrainObjectType_1 = require("./TerrainObjectType");
const materials_1 = require("../../p2/materials");
const terrainObjectKit_1 = require("./terrainObjectKit");
const p2Util_1 = require("../../p2/p2Util");
class Saw extends TerrainObject_1.default {
    constructor(world, pixiGraph, textures) {
        super(TerrainObjectType_1.default.Saw, world, pixiGraph);
        this.speed = -6;
        const sawBody = this.sawBody = new p2.Body({
            mass: 1
        });
        sawBody.gravityScale = 0;
        sawBody.isFatal = true;
        const sawSprite = new PIXI.Sprite(textures.saw);
        this.addBody(sawBody, sawSprite, pixiGraph.sawContainer);
        const circleShape = new p2.Circle({ radius: 1 });
        circleShape.material = materials_1.default.saw;
        this.addShape(sawBody, circleShape);
        const anchorBody = this.anchorBody = terrainObjectKit_1.default.getAnchor(sawBody);
        this.addBodyHidden(anchorBody);
        const anchorConstraint = terrainObjectKit_1.default.getAnchorConstraint(sawBody, anchorBody, null, true);
        anchorConstraint.setMotorSpeed(this.speed);
        this.addConstraint(anchorConstraint);
    }
    activate(position) {
        super.activate();
        p2Util_1.default.updateBodyPosition(this.sawBody, position);
        p2Util_1.default.updateBodyPosition(this.anchorBody, position);
    }
}
exports.default = Saw;
