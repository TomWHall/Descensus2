"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function updateBodyPosition(body, position, angle = 0) {
    resetBody(body);
    const bodyPosition = body.position;
    bodyPosition[0] = position[0];
    bodyPosition[1] = position[1];
    body.angle = angle;
    body.updateAABB();
    body.updateBoundingRadius();
}
function resetBody(body) {
    body.setZeroForce();
    body.velocity[0] = 0;
    body.velocity[1] = 0;
    body.angularVelocity = 0;
}
function limitVelocity(world) {
    const maxVelocity = 14;
    const maxAngularVelocity = 250;
    const bodies = world.bodies;
    for (let i = 0; i < bodies.length; i++) {
        const body = bodies[i];
        const velocity = body.velocity;
        const absVelocityX = Math.abs(velocity[0]);
        const absVelocityY = Math.abs(velocity[1]);
        if (absVelocityX > maxVelocity || absVelocityY > maxVelocity) {
            const ratio = Math.min(maxVelocity / absVelocityX, maxVelocity / absVelocityY);
            velocity[0] *= ratio;
            velocity[1] *= ratio;
        }
        if (body.angularVelocity > maxAngularVelocity) {
            body.angularVelocity = maxAngularVelocity;
        }
        else if (body.angularVelocity < -maxAngularVelocity) {
            body.angularVelocity = -maxAngularVelocity;
        }
    }
}
exports.default = { updateBodyPosition, resetBody, limitVelocity };
