"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const TerrainObject_1 = require("./TerrainObject");
const TerrainObjectType_1 = require("./TerrainObjectType");
const materials_1 = require("../../p2/materials");
const terrainObjectKit_1 = require("./terrainObjectKit");
const p2Util_1 = require("../../p2/p2Util");
class Spinner extends TerrainObject_1.default {
    constructor(world, pixiGraph, textures) {
        super(TerrainObjectType_1.default.Spinner, world, pixiGraph);
        const spinnerBody = new p2.Body({
            mass: 6
        });
        spinnerBody.gravityScale = 0;
        const spinnerSprite = new PIXI.Sprite(textures.spinner);
        spinnerSprite.isSpinner = true;
        this.addBody(spinnerBody, spinnerSprite, pixiGraph.spinnerContainer);
        this.spinnerBody = spinnerBody;
        const horizontalBoxShape = new p2.Box({ width: 6, height: 1 });
        horizontalBoxShape.material = materials_1.default.wood;
        this.addShape(spinnerBody, horizontalBoxShape);
        const verticalBoxShape = new p2.Box({ width: 6, height: 1 });
        verticalBoxShape.material = materials_1.default.wood;
        this.addShape(spinnerBody, verticalBoxShape, { angle: -Math.PI / 2 });
        const anchorBody = this.anchorBody = terrainObjectKit_1.default.getAnchor(spinnerBody);
        this.addBodyHidden(anchorBody);
        const revoluteConstraint = this.anchorConstraint = terrainObjectKit_1.default.getAnchorConstraint(spinnerBody, anchorBody, null, true);
        this.addConstraint(revoluteConstraint);
    }
    activate(position, speed) {
        super.activate();
        p2Util_1.default.updateBodyPosition(this.spinnerBody, position);
        p2Util_1.default.updateBodyPosition(this.anchorBody, position);
        this.anchorConstraint.setMotorSpeed(speed);
    }
}
exports.default = Spinner;
