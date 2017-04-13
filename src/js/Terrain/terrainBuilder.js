"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const TerrainObjectType_1 = require("../Terrain/Objects/TerrainObjectType");
const randomUtil_1 = require("../Utility/randomUtil");
const terrainUtil_1 = require("./terrainUtil");
const p2Util_1 = require("../p2/p2Util");
const Girder_1 = require("./Objects/Girder");
const Brick_1 = require("./Objects/Brick");
const Seesaw_1 = require("./Objects/Seesaw");
const Spinner_1 = require("./Objects/Spinner");
const Snake_1 = require("./Objects/Snake");
const FreeSaw_1 = require("./Objects/FreeSaw");
const Saw_1 = require("./Objects/Saw");
const SawSpinner_1 = require("./Objects/SawSpinner");
const SawSnake_1 = require("./Objects/SawSnake");
const Plus1Life_1 = require("./Objects/Plus1Life");
const ground_1 = require("./../ground");
let world;
let pixiGraph;
let girders;
let bricks;
let seesaws;
let spinners;
let freeSaws;
let saws;
let sawSpinners;
let snakes;
let sawSnakes;
let plus1Lifes;
let allSnakes = [];
const terrainObjectPoolMap = {};
const terrainObjectPools = [];
let groundBody;
let purgeCheckPoolIndex = 0;
let purgeCheckObjectIndex = 0;
const windZones = [
    { startY: 600, endY: 575, strength: 1.5 },
    { startY: 500, endY: 475, strength: -1.75 },
    { startY: 350, endY: 325, strength: 2 },
    { startY: 275, endY: 250, strength: -2.25 },
    { startY: 100, endY: 75, strength: 2.5 },
    { startY: 75, endY: 50, strength: -2.75 }
];
function createTerrainObjects(factory, count) {
    const pool = [];
    for (let i = 0; i < count; i++) {
        pool.push(factory());
    }
    return pool;
}
function getActiveCount(terrainObjects) {
    let count = 0;
    for (let i = 0; i < terrainObjects.length; i++) {
        if (terrainObjects[i].active)
            count++;
    }
    return count;
}
function initialize(wld, pxGraph, textures) {
    world = wld;
    pixiGraph = pxGraph;
    girders = createTerrainObjects(() => new Girder_1.default(world, pxGraph, textures), 20);
    bricks = createTerrainObjects(() => new Brick_1.default(world, pxGraph, textures), 6);
    seesaws = createTerrainObjects(() => new Seesaw_1.default(world, pxGraph, textures), 8);
    spinners = createTerrainObjects(() => new Spinner_1.default(world, pxGraph, textures), 8);
    freeSaws = createTerrainObjects(() => new FreeSaw_1.default(world, pxGraph, textures), 4);
    saws = createTerrainObjects(() => new Saw_1.default(world, pxGraph, textures), 20);
    sawSpinners = createTerrainObjects(() => new SawSpinner_1.default(world, pxGraph, textures), 8);
    plus1Lifes = createTerrainObjects(() => new Plus1Life_1.default(world, pxGraph, textures), 2);
    snakes = createTerrainObjects(() => {
        const speed = 0.5 + randomUtil_1.default.random0To1();
        const agitateTime = (1 + randomUtil_1.default.random0To1()) * 1000;
        return new Snake_1.default(world, pxGraph, textures, speed, agitateTime);
    }, 8);
    sawSnakes = createTerrainObjects(() => {
        const speed = 0.5 + randomUtil_1.default.random0To1();
        const agitateTime = (1 + randomUtil_1.default.random0To1()) * 1000;
        return new SawSnake_1.default(world, pxGraph, textures, speed, agitateTime);
    }, 6);
    allSnakes = snakes.concat(sawSnakes);
    terrainObjectPoolMap[TerrainObjectType_1.default.Girder] = girders;
    terrainObjectPoolMap[TerrainObjectType_1.default.Brick] = bricks;
    terrainObjectPoolMap[TerrainObjectType_1.default.Seesaw] = seesaws;
    terrainObjectPoolMap[TerrainObjectType_1.default.Spinner] = spinners;
    terrainObjectPoolMap[TerrainObjectType_1.default.FreeSaw] = freeSaws;
    terrainObjectPoolMap[TerrainObjectType_1.default.Saw] = saws;
    terrainObjectPoolMap[TerrainObjectType_1.default.SawSpinner] = sawSpinners;
    terrainObjectPoolMap[TerrainObjectType_1.default.Snake] = snakes;
    terrainObjectPoolMap[TerrainObjectType_1.default.SawSnake] = sawSnakes;
    terrainObjectPoolMap[TerrainObjectType_1.default.Plus1Life] = plus1Lifes;
    terrainObjectPools.push.apply(terrainObjectPools, [girders, bricks, seesaws, spinners, snakes, freeSaws, saws, sawSpinners, sawSnakes, plus1Lifes]);
    groundBody = ground_1.default.initialize(world, pixiGraph, textures);
}
function update(ballBody, screenAABB) {
    const activeBufferUnits = 16;
    const activeAABB = new p2.AABB();
    activeAABB.lowerBound[0] = screenAABB.lowerBound[0] - activeBufferUnits;
    activeAABB.lowerBound[1] = screenAABB.lowerBound[1] - activeBufferUnits;
    activeAABB.upperBound[0] = screenAABB.upperBound[0] + activeBufferUnits;
    activeAABB.upperBound[1] = screenAABB.upperBound[1] + activeBufferUnits;
    setObjectStates(screenAABB, activeAABB);
    terrainUtil_1.default.updateAABBs(world);
    const leftInner = screenAABB.lowerBound[0];
    const rightInner = screenAABB.upperBound[0];
    const topInner = screenAABB.upperBound[1];
    const bottomInner = screenAABB.lowerBound[1];
    const leftOuter = activeAABB.lowerBound[0];
    const rightOuter = activeAABB.upperBound[0];
    const topOuter = activeAABB.upperBound[1];
    const bottomOuter = activeAABB.lowerBound[1];
    const topArea = new p2.AABB({ lowerBound: [leftOuter, topInner], upperBound: [rightOuter, topOuter] });
    const bottomArea = new p2.AABB({ lowerBound: [leftOuter, bottomOuter], upperBound: [rightOuter, bottomInner] });
    const leftArea = new p2.AABB({ lowerBound: [leftOuter, bottomInner], upperBound: [leftInner, topInner] });
    const rightArea = new p2.AABB({ lowerBound: [rightInner, bottomInner], upperBound: [rightOuter, topInner] });
    populateArea(topArea);
    populateArea(bottomArea);
    populateArea(leftArea);
    populateArea(rightArea);
    dropBricks(topArea);
    throwSaws(leftArea, rightArea, bottomArea);
    applyWind(ballBody);
    agitateSnakes();
    positionGround(ballBody);
}
function positionGround(ballBody) {
    const groundPositionX = (Math.round(ballBody.position[0] / 16) * 16);
    const groundPosition = [groundPositionX, -10];
    p2Util_1.default.updateBodyPosition(groundBody, groundPosition);
}
function deployTerrainObject(type, targetActiveCount, aabb, width, height, buffer, ...args) {
    const terrainObjects = terrainObjectPoolMap[type];
    if (getActiveCount(terrainObjects) < targetActiveCount) {
        for (let i = 0; i < terrainObjects.length; i++) {
            const terrainObject = terrainObjects[i];
            if (!terrainObject.active) {
                const position = terrainUtil_1.default.getRandomPosition(world, aabb, width, height, buffer);
                if (position !== null) {
                    const activationArgs = [position].concat(args);
                    terrainObject.activate.apply(terrainObject, activationArgs);
                }
                return;
            }
        }
        throw new Error('TerrainObjectPool of type ' + type + ' empty');
    }
}
function deployGirder(aabb, targetActiveCount, buffer) {
    const angle = randomUtil_1.default.random0To1() * (Math.PI * 2);
    deployTerrainObject(TerrainObjectType_1.default.Girder, targetActiveCount, aabb, 5, 5, buffer, angle);
}
function deployBrick(aabb, targetActiveCount, buffer) {
    const angle = randomUtil_1.default.random0To1() * (Math.PI * 2);
    deployTerrainObject(TerrainObjectType_1.default.Brick, targetActiveCount, aabb, 5, 5, buffer, angle);
}
function deploySeesaw(aabb, targetActiveCount, buffer) {
    const isUpright = randomUtil_1.default.randomBoolean();
    const width = isUpright ? 1 : 6;
    const height = isUpright ? 6 : 1;
    deployTerrainObject(TerrainObjectType_1.default.Seesaw, targetActiveCount, aabb, width, height, buffer, isUpright);
}
function deploySpinner(aabb, targetActiveCount, buffer) {
    const speed = randomUtil_1.default.randomInt(200, 250) * randomUtil_1.default.randomSign();
    deployTerrainObject(TerrainObjectType_1.default.Spinner, targetActiveCount, aabb, 7, 7, buffer, speed);
}
function deploySnake(aabb, targetActiveCount, buffer) {
    const speed = randomUtil_1.default.randomInt(40, 60) * randomUtil_1.default.randomSign();
    const agitateTime = randomUtil_1.default.randomInt(2500, 5000);
    deployTerrainObject(TerrainObjectType_1.default.Snake, targetActiveCount, aabb, 0.5, 14.5, buffer, speed, agitateTime);
}
function deployFreeSaw(aabb, targetActiveCount, buffer, velocity) {
    deployTerrainObject(TerrainObjectType_1.default.FreeSaw, targetActiveCount, aabb, 1, 1, buffer, velocity);
}
function deploySaw(aabb, targetActiveCount, buffer) {
    deployTerrainObject(TerrainObjectType_1.default.Saw, targetActiveCount, aabb, 2, 2, buffer);
}
function deploySawSpinner(aabb, targetActiveCount, buffer) {
    const speed = randomUtil_1.default.randomInt(200, 250) * randomUtil_1.default.randomSign();
    deployTerrainObject(TerrainObjectType_1.default.SawSpinner, targetActiveCount, aabb, 9, 9, buffer, speed);
}
function deploySawSnake(aabb, targetActiveCount, buffer) {
    const speed = randomUtil_1.default.randomInt(40, 60) * randomUtil_1.default.randomSign();
    const agitateTime = randomUtil_1.default.randomInt(2500, 5000);
    deployTerrainObject(TerrainObjectType_1.default.SawSnake, targetActiveCount, aabb, 2, 14.5, buffer, speed, agitateTime);
}
function deployPlus1Life(aabb, targetActiveCount, buffer) {
    deployTerrainObject(TerrainObjectType_1.default.Plus1Life, targetActiveCount, aabb, 2, 2, buffer);
}
function populateArea(aabb) {
    const height = terrainUtil_1.default.getMidHeight(aabb);
    const buffer = terrainUtil_1.default.getCountLessAsDescends(height, 4, 6, 1000);
    deploySawSnake(aabb, terrainUtil_1.default.getCountMoreAsDescends(height, 3, 6, 250), buffer);
    deploySawSpinner(aabb, terrainUtil_1.default.getCountLessAsDescends(height, 2, 8, 500), buffer);
    deploySnake(aabb, terrainUtil_1.default.getCountLessAsDescends(height, 1, 8, 600), buffer);
    deploySpinner(aabb, terrainUtil_1.default.getCountLessAsDescends(height, 1, 8, 800), buffer);
    deploySeesaw(aabb, terrainUtil_1.default.getCountLessAsDescends(height, 1, 8, 900), buffer);
    deployGirder(aabb, terrainUtil_1.default.getCountLessAsDescends(height, 1, 20, 1000), buffer);
    deploySaw(aabb, terrainUtil_1.default.getCountLessAsDescends(height, 20, 2, 1000), buffer);
    deployPlus1Life(aabb, terrainUtil_1.default.getCountMoreAsDescends(height, 1, 2, 500), buffer);
}
function dropBricks(topAABB) {
    const height = terrainUtil_1.default.getMidHeight(topAABB);
    const targetActiveCount = terrainUtil_1.default.getCountMoreAsDescends(height, 2, 6, 975);
    if (targetActiveCount === 0)
        return;
    const topAABBCopy = new p2.AABB();
    topAABBCopy.copy(topAABB);
    topAABBCopy.upperBound[1] -= 12;
    topAABBCopy.lowerBound[0] += 4;
    topAABBCopy.upperBound[0] -= 4;
    deployBrick(topAABB, targetActiveCount, 1);
}
function throwSaws(leftAABB, rightAABB, bottomAABB) {
    const height = terrainUtil_1.default.getMidHeight(leftAABB);
    const targetActiveCount = terrainUtil_1.default.getCountMoreAsDescends(height, 2, 4, 975);
    if (targetActiveCount === 0)
        return;
    // Throw from sides
    {
        const isFromLeft = randomUtil_1.default.randomBoolean();
        const aabb = new p2.AABB();
        aabb.copy(isFromLeft ? leftAABB : rightAABB);
        aabb.lowerBound[1] += 14;
        if (isFromLeft) {
            aabb.lowerBound[0] += 13;
        }
        else {
            aabb.upperBound[0] -= 13;
        }
        const horizontalVelocity = 10;
        const verticalVelocity = randomUtil_1.default.random0To1();
        const velocity = isFromLeft ? [horizontalVelocity, verticalVelocity] : [-horizontalVelocity, verticalVelocity];
        deployFreeSaw(aabb, targetActiveCount, 1, velocity);
    }
    // Throw from below
    {
        const bottomAABBCopy = new p2.AABB();
        bottomAABBCopy.copy(bottomAABB);
        bottomAABBCopy.lowerBound[1] += 25;
        bottomAABBCopy.lowerBound[0] += 4;
        bottomAABBCopy.upperBound[0] -= 4;
        const verticalVelocity = 20;
        const horizontalVelocity = randomUtil_1.default.random0To1();
        const velocity = [horizontalVelocity, verticalVelocity];
        deployFreeSaw(bottomAABB, targetActiveCount, 1, velocity);
    }
}
function applyWind(ballBody) {
    let bodiesToBlow = [];
    const bodies = world.bodies;
    for (let j = 0; j < bodies.length; j++) {
        const body = bodies[j];
        if (body.sprite && body.sprite.visible) {
            bodiesToBlow.push(body);
        }
    }
    pixiGraph.windLeft.visible = false;
    pixiGraph.windRight.visible = false;
    const ballBodyPositionY = ballBody.position[1];
    for (let i = 0; i < windZones.length; i++) {
        const windZone = windZones[i];
        if (ballBodyPositionY <= windZone.startY && ballBodyPositionY >= windZone.endY) {
            for (let k = 0; k < bodiesToBlow.length; k++) {
                const body = bodiesToBlow[k];
                body.applyForce([windZone.strength, 0], [0, 0]);
            }
            if (windZone.strength < 0) {
                pixiGraph.windRight.visible = true;
            }
            else {
                pixiGraph.windLeft.visible = true;
            }
            break;
        }
    }
}
function agitateSnakes() {
    for (let i = 0; i < allSnakes.length; i++) {
        const snake = allSnakes[i];
        if (snake.active) {
            snake.agitate();
        }
    }
}
function setObjectStates(screenAABB, activeAABB) {
    for (let i = 0; i < terrainObjectPools.length; i++) {
        const terrainObjectPool = terrainObjectPools[i];
        for (let j = 0; j < terrainObjectPool.length; j++) {
            const terrainObject = terrainObjectPool[j];
            if (terrainObject.active) {
                const aabb = terrainObject.getAABB();
                if (aabb.upperBound[0] < activeAABB.lowerBound[0] ||
                    aabb.lowerBound[0] > activeAABB.upperBound[0] ||
                    aabb.lowerBound[1] > activeAABB.upperBound[1] ||
                    aabb.upperBound[1] < activeAABB.lowerBound[1]) {
                    // Object is outside active area
                    terrainObject.deactivate();
                }
                else if (aabb.upperBound[0] < screenAABB.lowerBound[0] ||
                    aabb.lowerBound[0] > screenAABB.upperBound[0] ||
                    aabb.lowerBound[1] > screenAABB.upperBound[1] ||
                    aabb.upperBound[1] < screenAABB.lowerBound[1]) {
                    // Object is inside active area but off screen
                    terrainObject.suspend();
                }
                else {
                    // Object is on-screen
                    if (terrainObject.suspended) {
                        terrainObject.resume();
                    }
                }
            }
        }
    }
}
function deactivateAll() {
    for (let i = 0; i < terrainObjectPools.length; i++) {
        const terrainObjectPool = terrainObjectPools[i];
        for (let j = 0; j < terrainObjectPool.length; j++) {
            const terrainObject = terrainObjectPool[j];
            if (terrainObject.active) {
                terrainObject.deactivate();
            }
        }
    }
}
exports.default = { initialize, update, deactivateAll };
