"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Snake_1 = require("./Snake");
const TerrainObjectType_1 = require("./TerrainObjectType");
const randomUtil_1 = require("../../Utility/randomUtil");
const materials_1 = require("../../p2/materials");
const p2Util_1 = require("../../p2/p2Util");
class SawSnake extends Snake_1.default {
    constructor(world, pixiGraph, textures, speed, agitateTime) {
        super(world, pixiGraph, textures, speed, agitateTime);
        this.sawSpeed = -6;
        this.sawBodies = [];
        this.type = TerrainObjectType_1.default.SawSnake;
        const segments = this.segments;
        for (let i = 0; i < segments.length; i++) {
            const body = segments[i];
            this.addSaw(body, textures);
        }
    }
    addSaw(body, textures) {
        const sawBody = new p2.Body({
            mass: 1,
            position: [body.position[0], body.position[1]],
            angle: randomUtil_1.default.random0To1() * (2 * Math.PI)
        });
        sawBody.gravityScale = 0;
        sawBody.isFatal = true;
        const sawSprite = new PIXI.Sprite(textures.saw);
        this.addBody(sawBody, sawSprite, this.pixiGraph.sawContainer);
        this.sawBodies.push(sawBody);
        const circleShape = new p2.Circle({ radius: 1 });
        circleShape.material = materials_1.default.wood;
        this.addShape(sawBody, circleShape);
        const revoluteConstraint = new p2.RevoluteConstraint(sawBody, body, { localPivotA: [0, 0], localPivotB: [0, 0] });
        revoluteConstraint.enableMotor();
        revoluteConstraint.setMotorSpeed(this.sawSpeed);
        revoluteConstraint.collideConnected = false;
        this.addConstraint(revoluteConstraint);
    }
    activate(position, speed, agitateTime) {
        super.activate(position, speed, agitateTime);
        const segments = this.segments;
        const sawBodies = this.sawBodies;
        for (let i = 0; i < segments.length; i++) {
            const segmentPosition = segments[i].position;
            const sawBody = sawBodies[i];
            p2Util_1.default.updateBodyPosition(sawBody, [segmentPosition[0], segmentPosition[1]]);
        }
    }
}
exports.default = SawSnake;
