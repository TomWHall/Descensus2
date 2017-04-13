"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const TerrainObject_1 = require("./TerrainObject");
const TerrainObjectType_1 = require("./TerrainObjectType");
const materials_1 = require("../../p2/materials");
const terrainObjectKit_1 = require("./terrainObjectKit");
const p2Util_1 = require("../../p2/p2Util");
class Seesaw extends TerrainObject_1.default {
    constructor(world, pixiGraph, textures) {
        super(TerrainObjectType_1.default.Seesaw, world, pixiGraph);
        const seesawBody = new p2.Body({
            mass: 3
        });
        seesawBody.gravityScale = 0;
        const seesawSprite = new PIXI.Sprite(textures.seesaw);
        this.addBody(seesawBody, seesawSprite, pixiGraph.seesawContainer);
        const boxShape = new p2.Box({ width: 6, height: 1 });
        boxShape.material = materials_1.default.wood;
        this.addShape(seesawBody, boxShape);
        const anchorBody = terrainObjectKit_1.default.getAnchor(seesawBody);
        this.addBodyHidden(anchorBody);
        this.addConstraint(terrainObjectKit_1.default.getAnchorConstraint(seesawBody, anchorBody));
    }
    activate(position, upright = false) {
        super.activate();
        const bodies = this.bodies;
        for (let i = 0; i < bodies.length; i++) {
            const body = this.bodies[i];
            const angle = upright ? (-Math.PI / 2) : 0;
            p2Util_1.default.updateBodyPosition(body, position, angle);
        }
    }
}
exports.default = Seesaw;
