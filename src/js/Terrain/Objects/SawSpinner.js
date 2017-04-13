"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Spinner_1 = require("./Spinner");
const TerrainObjectType_1 = require("./TerrainObjectType");
const materials_1 = require("../../p2/materials");
const p2Util_1 = require("../../p2/p2Util");
class SawSpinner extends Spinner_1.default {
    constructor(world, pixiGraph, textures) {
        super(world, pixiGraph, textures);
        this.sawSpeed = -6;
        this.sawOffsets = [[0, 2.5], [0, -2.5], [-2.5, 0], [2.5, 0]];
        this.sawBodies = [];
        this.type = TerrainObjectType_1.default.SawSpinner;
        const spinnerBody = this.spinnerBody;
        const sawOffsets = this.sawOffsets;
        for (let i = 0; i < sawOffsets.length; i++) {
            this.addSaw(spinnerBody, sawOffsets[i], textures);
        }
    }
    addSaw(spinner, offset, textures) {
        const spinnerBodyPosition = spinner.position;
        const sawBody = new p2.Body({
            mass: 1,
            position: [spinnerBodyPosition[0] + offset[0], spinnerBodyPosition[1] + offset[1]]
        });
        sawBody.gravityScale = 0;
        sawBody.isFatal = true;
        const sawSprite = new PIXI.Sprite(textures.saw);
        this.addBody(sawBody, sawSprite, this.pixiGraph.sawContainer);
        this.sawBodies.push(sawBody);
        const circleShape = new p2.Circle({ radius: 1 });
        circleShape.material = materials_1.default.wood;
        this.addShape(sawBody, circleShape);
        const revoluteConstraint = new p2.RevoluteConstraint(sawBody, spinner, { localPivotA: [0, 0], localPivotB: offset });
        revoluteConstraint.enableMotor();
        revoluteConstraint.setMotorSpeed(this.sawSpeed);
        revoluteConstraint.collideConnected = false;
        this.addConstraint(revoluteConstraint);
    }
    setSawPositions(spinnerPosition) {
        const sawBodies = this.sawBodies;
        const sawOffsets = this.sawOffsets;
        for (let i = 0; i < sawOffsets.length; i++) {
            const sawOffset = sawOffsets[i];
            p2Util_1.default.updateBodyPosition(sawBodies[i], [spinnerPosition[0] + sawOffset[0], spinnerPosition[1] + sawOffset[1]]);
        }
    }
    activate(position, speed) {
        super.activate(position, speed);
        this.setSawPositions(position);
    }
}
exports.default = SawSpinner;
