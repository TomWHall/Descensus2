import TerrainObjectType from './TerrainObjectType';
import ShapeOptions from './ShapeOptions';
import IPixiGraph from '../../Pixi/IPixiGraph';
import p2Util from '../../p2/p2Util';

export default class TerrainObject {

  constructor(type: TerrainObjectType, world: p2.World, pixiGraph: IPixiGraph) {
    this.type = type;
    this.world = world;
    this.pixiGraph = pixiGraph;
    this.bodies = []; // p2 physics bodies, each with its corresponding PIXI Sprite stored on it
    this.constraints = []; // p2 constraints
  }

  type: TerrainObjectType;
  world: p2.World;
  pixiGraph: IPixiGraph;
  bodies: p2.Body[];
  constraints: p2.Constraint[];
  active: boolean = false;
  suspended: boolean = false;

  addBody(body: p2.Body, sprite: PIXI.Sprite, container: PIXI.Container): void {
    sprite.anchor = new PIXI.ObservablePoint(null, null, 0.5, 0.5);
    sprite.visible = false;

    body.sprite = sprite;
    container.addChild(sprite);

    body.terrainObject = this;
    this.bodies.push(body);
  }

  addBodyHidden(body: p2.Body): void {
    body.terrainObject = this;
    this.bodies.push(body);
  }

  addShape(body: p2.Body, shape: p2.Shape, options?: ShapeOptions): void {
    options = options || {};
    const offset = options.offset || [0, 0];
    const angle = options.angle || 0;
    shape.collisionGroup = (options.collisionOptions && options.collisionOptions.collisionGroup) || 1;
    shape.collisionMask = (options.collisionOptions && options.collisionOptions.collisionMask) || 1;

    body.addShape(shape, offset, angle);
  }

  addConstraint(constraint: p2.Constraint): void {
    this.constraints.push(constraint);
  }

  getAABB(): p2.AABB {
    const aabb = new p2.AABB();

    for (let i = 0; i < this.bodies.length; i++) {
      let body = this.bodies[i];

      if (body.aabbNeedsUpdate) {
        body.updateAABB();
      }

      if (i === 0) {
        aabb.copy(body.aabb);
      } else {
        aabb.extend(body.aabb);
      }
    }

    return aabb;
  }

  activate(...args: any[]) {
    const world = this.world;

    // Add bodies to the world and show Pixi sprites
    const bodies = this.bodies;
    for (let i = 0; i < bodies.length; i++) {
      let body = bodies[i];

      world.addBody(body);

      const sprite = body.sprite;
      if (!sprite) continue;

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

  deactivate(): void {
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

  suspend(): void {
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

  resume(): void {
    const bodies = this.bodies;
    for (let i = 0; i < bodies.length; i++) {
      let body = bodies[i];
      if (body.allowSleep) {
        body.wakeUp();
        p2Util.resetBody(body);
      }
      body.collisionResponse = true;
    }

    this.suspended = false;
  }
}