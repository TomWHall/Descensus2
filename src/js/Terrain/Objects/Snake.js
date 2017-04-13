"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const TerrainObject_1 = require("./TerrainObject");
const TerrainObjectType_1 = require("./TerrainObjectType");
const materials_1 = require("../../p2/materials");
const terrainObjectKit_1 = require("./terrainObjectKit");
const p2Util_1 = require("../../p2/p2Util");
class Snake extends TerrainObject_1.default {
    constructor(world, pixiGraph, textures, speed, agitateCycle) {
        super(TerrainObjectType_1.default.Snake, world, pixiGraph);
        this.segmentCount = 4;
        this.segments = [];
        this.agitateCycle = agitateCycle;
        let previousSegment = null;
        for (let i = 0; i < this.segmentCount; i++) {
            let twoByFourBody = new p2.Body({
                mass: 0.5
            });
            twoByFourBody.gravityScale = 0;
            const twoByFourSprite = new PIXI.Sprite(textures.twoByFour);
            this.addBody(twoByFourBody, twoByFourSprite, pixiGraph.twoByFourContainer);
            this.segments.push(twoByFourBody);
            const boxShape = new p2.Box({ width: 0.5, height: 4 });
            boxShape.material = materials_1.default.wood;
            this.addShape(twoByFourBody, boxShape);
            if (previousSegment === null) {
                const anchorBody = this.anchorBody = terrainObjectKit_1.default.getAnchor(twoByFourBody);
                this.addBodyHidden(anchorBody);
                const anchorConstraint = this.anchorConstraint = terrainObjectKit_1.default.getAnchorConstraint(twoByFourBody, anchorBody, [1.75, 0], true);
                this.addConstraint(anchorConstraint);
            }
            else {
                const revoluteConstraint = new p2.RevoluteConstraint(twoByFourBody, previousSegment, { localPivotA: [0, 1.75], localPivotB: [0, -1.75] });
                revoluteConstraint.collideConnected = false;
                const maxAngle = Math.PI / 4;
                revoluteConstraint.setLimits(-maxAngle, maxAngle);
                this.addConstraint(revoluteConstraint);
            }
            previousSegment = twoByFourBody;
        }
    }
    scheduleAgitate() {
        this.nextAgitateTime = performance.now() + this.agitateCycle;
    }
    agitate() {
        if (!this.active || performance.now() < this.nextAgitateTime)
            return;
        this.anchorConstraint.setMotorSpeed(-this.anchorConstraint.getMotorSpeed());
        this.scheduleAgitate();
    }
    activate(position, speed, agitateCycle) {
        super.activate();
        // Position is the centre of the entire snake
        const snakeHeight = (this.segmentCount * 3.5) + 0.5;
        const tailBodyPosition = [position[0], (position[1] + (snakeHeight / 2)) - 2];
        p2Util_1.default.updateBodyPosition(this.anchorBody, [tailBodyPosition[0], tailBodyPosition[1] + 1.75]);
        const segments = this.segments;
        for (let i = 0; i < segments.length; i++) {
            p2Util_1.default.updateBodyPosition(segments[i], [tailBodyPosition[0], tailBodyPosition[1] - (i * 3.5)]);
        }
        this.anchorConstraint.setMotorSpeed(speed);
        this.agitateCycle = agitateCycle;
        this.scheduleAgitate();
    }
}
exports.default = Snake;
