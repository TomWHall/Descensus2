"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const randomUtil_1 = require("../Utility/randomUtil");
function getRandomPosition(world, aabb, width, height, buffer) {
    const maxAttempts = 10;
    let attempts = 0;
    const minX = aabb.lowerBound[0] + (width / 2);
    const maxX = aabb.upperBound[0] - (width / 2);
    const minY = aabb.lowerBound[1] + (height / 2);
    const maxY = aabb.upperBound[1] - (height / 2);
    while (attempts < maxAttempts) {
        attempts++;
        const x = randomUtil_1.default.randomInt(minX, maxX);
        const y = randomUtil_1.default.randomInt(minY, maxY);
        const position = [x, y];
        if (!isBlocked(world, position, width + buffer, height + buffer)) {
            return position;
        }
    }
    return null;
}
function getMidHeight(aabb) {
    return (aabb.lowerBound[1] + aabb.upperBound[1]) / 2;
}
function getCountMoreAsDescends(height, min, max, startingHeight) {
    if (height > startingHeight)
        return 0;
    const proportion = (startingHeight - height) / startingHeight;
    const count = Math.round(min + (proportion * (max - min)));
    return count;
}
function getCountLessAsDescends(height, min, max, startingHeight) {
    if (height > startingHeight)
        return 0;
    const proportion = (startingHeight - height) / startingHeight;
    const count = Math.round(min + ((1 - proportion) * (max - min)));
    return count;
}
function updateAABBs(world) {
    const bodies = world.bodies;
    for (let i = 0; i < bodies.length; i++) {
        const body = bodies[i];
        if (body.aabbNeedsUpdate) {
            body.updateAABB();
        }
    }
}
function isBlocked(world, position, width, height) {
    const halfWidth = width / 2;
    const halfHeight = height / 2;
    const bodies = world.bodies;
    for (let i = 0; i < bodies.length; i++) {
        const body = bodies[i];
        const aabb = body.aabb;
        if (!(aabb.upperBound[0] < position[0] - halfWidth ||
            aabb.lowerBound[0] > position[0] + halfWidth ||
            aabb.upperBound[1] < position[1] - halfHeight ||
            aabb.lowerBound[1] > position[1] + halfHeight)) {
            return true;
        }
    }
    return false;
}
exports.default = { getRandomPosition, getMidHeight, getCountMoreAsDescends, getCountLessAsDescends, updateAABBs };
