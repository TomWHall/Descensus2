"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const materials_1 = require("./materials");
function createWorld() {
    const world = new p2.World({
        gravity: [0, -4.9]
    });
    world.solver = new p2.GSSolver({
        tolerance: 0.01,
        iterations: 10
    });
    world.sleepMode = p2.World.BODY_SLEEPING;
    addContactMaterials(world);
    return world;
}
function addContactMaterials(world) {
    // Wood
    world.addContactMaterial(new p2.ContactMaterial(materials_1.default.wood, materials_1.default.wood, {
        restitution: 0.1,
        stiffness: Number.MAX_VALUE,
        friction: 0.3,
        relaxation: undefined,
        frictionStiffness: undefined,
        frictionRelaxation: undefined,
        surfaceVelocity: undefined
    }));
    world.addContactMaterial(new p2.ContactMaterial(materials_1.default.wood, materials_1.default.saw, {
        restitution: 0.3,
        stiffness: Number.MAX_VALUE,
        friction: 0.6,
        relaxation: undefined,
        frictionStiffness: undefined,
        frictionRelaxation: undefined,
        surfaceVelocity: undefined
    }));
    world.addContactMaterial(new p2.ContactMaterial(materials_1.default.wood, materials_1.default.brick, {
        restitution: 0.1,
        stiffness: Number.MAX_VALUE,
        friction: 0.6,
        relaxation: undefined,
        frictionStiffness: undefined,
        frictionRelaxation: undefined,
        surfaceVelocity: undefined
    }));
    world.addContactMaterial(new p2.ContactMaterial(materials_1.default.wood, materials_1.default.ball, {
        restitution: 0.4,
        stiffness: Number.MAX_VALUE,
        friction: 0.3,
        relaxation: undefined,
        frictionStiffness: undefined,
        frictionRelaxation: undefined,
        surfaceVelocity: undefined
    }));
    // Brick
    world.addContactMaterial(new p2.ContactMaterial(materials_1.default.brick, materials_1.default.brick, {
        restitution: 0,
        stiffness: Number.MAX_VALUE,
        friction: 0.8,
        relaxation: undefined,
        frictionStiffness: undefined,
        frictionRelaxation: undefined,
        surfaceVelocity: undefined
    }));
    world.addContactMaterial(new p2.ContactMaterial(materials_1.default.brick, materials_1.default.ball, {
        restitution: 0.5,
        stiffness: Number.MAX_VALUE,
        friction: 0.4,
        relaxation: undefined,
        frictionStiffness: undefined,
        frictionRelaxation: undefined,
        surfaceVelocity: undefined
    }));
    world.addContactMaterial(new p2.ContactMaterial(materials_1.default.brick, materials_1.default.saw, {
        restitution: 0.3,
        stiffness: Number.MAX_VALUE,
        friction: 0.4,
        relaxation: undefined,
        frictionStiffness: undefined,
        frictionRelaxation: undefined,
        surfaceVelocity: undefined
    }));
    // Saw
    world.addContactMaterial(new p2.ContactMaterial(materials_1.default.saw, materials_1.default.saw, {
        restitution: 0.4,
        stiffness: Number.MAX_VALUE,
        friction: 0.8,
        relaxation: undefined,
        frictionStiffness: undefined,
        frictionRelaxation: undefined,
        surfaceVelocity: undefined
    }));
}
exports.default = createWorld;
