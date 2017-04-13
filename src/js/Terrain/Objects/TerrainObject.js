"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const p2Util_1 = require("../../p2/p2Util");
class TerrainObject {
    constructor(type, world, pixiGraph) {
        this.active = false;
        this.suspended = false;
        this.type = type;
        this.world = world;
        this.pixiGraph = pixiGraph;
        this.bodies = []; // p2 physics bodies, each with its corresponding PIXI Sprite stored on it
        this.constraints = []; // p2 constraints
    }
    addBody(body, sprite, container) {
        sprite.anchor = new PIXI.ObservablePoint(null, null, 0.5, 0.5);
        sprite.visible = false;
        body.sprite = sprite;
        container.addChild(sprite);
        body.terrainObject = this;
        this.bodies.push(body);
    }
    addBodyHidden(body) {
        body.terrainObject = this;
        this.bodies.push(body);
    }
    addShape(body, shape, options) {
        options = options || {};
        const offset = options.offset || [0, 0];
        const angle = options.angle || 0;
        shape.collisionGroup = (options.collisionOptions && options.collisionOptions.collisionGroup) || 1;
        shape.collisionMask = (options.collisionOptions && options.collisionOptions.collisionMask) || 1;
        body.addShape(shape, offset, angle);
    }
    addConstraint(constraint) {
        this.constraints.push(constraint);
    }
    getAABB() {
        const aabb = new p2.AABB();
        for (let i = 0; i < this.bodies.length; i++) {
            let body = this.bodies[i];
            if (body.aabbNeedsUpdate) {
                body.updateAABB();
            }
            if (i === 0) {
                aabb.copy(body.aabb);
            }
            else {
                aabb.extend(body.aabb);
            }
        }
        return aabb;
    }
    activate(...args) {
        const world = this.world;
        // Add bodies to the world and show Pixi sprites
        const bodies = this.bodies;
        for (let i = 0; i < bodies.length; i++) {
            let body = bodies[i];
            world.addBody(body);
            const sprite = body.sprite;
            if (!sprite)
                continue;
            sprite.visible = true;
        }
        // Add p2 constraints to the world
        const constraints = this.constraints;
        for (let j = 0; j < constraints.length; j++) {
            world.addConstraint(constraints[j]);
        }
        this.resume();
        this.active = true;
    }
    deactivate() {
        const world = this.world;
        // Remove p2 constraints from the world
        const constraints = this.constraints;
        for (let i = 0; i < constraints.length; i++) {
            world.removeConstraint(constraints[i]);
        }
        // Remove p2 bodies from the world and hide Pixi Sprites
        const bodies = this.bodies;
        for (let j = 0; j < bodies.length; j++) {
            let body = bodies[j];
            body.setZeroForce();
            body.velocity[0] = 0;
            body.velocity[1] = 0;
            body.angularVelocity = 0;
            world.removeBody(body);
            const sprite = body.sprite;
            if (sprite) {
                sprite.visible = false;
            }
        }
        this.active = false;
    }
    suspend() {
        const bodies = this.bodies;
        for (let i = 0; i < bodies.length; i++) {
            let body = bodies[i];
            if (body.allowSleep) {
                body.sleep();
            }
            body.collisionResponse = false;
        }
        this.suspended = true;
    }
    resume() {
        const bodies = this.bodies;
        for (let i = 0; i < bodies.length; i++) {
            let body = bodies[i];
            if (body.allowSleep) {
                body.wakeUp();
                p2Util_1.default.resetBody(body);
            }
            body.collisionResponse = true;
        }
        this.suspended = false;
    }
}
exports.default = TerrainObject;
