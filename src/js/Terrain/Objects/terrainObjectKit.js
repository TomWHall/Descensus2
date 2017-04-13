"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function getAnchor(body) {
    const anchorBody = new p2.Body({
        mass: 100
    });
    anchorBody.gravityScale = 0;
    // Circle shape is to cater for body AABB logic which sums shape AABBs
    const circleShape = new p2.Circle({ radius: 0.1 });
    circleShape.sensor = true;
    anchorBody.addShape(circleShape);
    anchorBody.terrainObject = body.terrainObject;
    return anchorBody;
}
function getAnchorConstraint(body, anchor, offset, enableMotor = false) {
    offset = offset || [0, 0];
    const revoluteConstraint = new p2.RevoluteConstraint(body, anchor, { localPivotA: offset, localPivotB: [0, 0] });
    revoluteConstraint.collideConnected = false;
    if (enableMotor) {
        revoluteConstraint.enableMotor();
    }
    return revoluteConstraint;
}
exports.default = { getAnchor, getAnchorConstraint };
