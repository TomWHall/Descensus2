import materials from './materials';

function createWorld(): p2.World {
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

function addContactMaterials(world: p2.World): void {

  // Wood

  world.addContactMaterial(new p2.ContactMaterial(materials.wood, materials.wood, {
    restitution: 0.1,
    stiffness: Number.MAX_VALUE,
    friction: 0.3,
    relaxation: undefined,
    frictionStiffness: undefined,
    frictionRelaxation: undefined,
    surfaceVelocity: undefined
  }));

  world.addContactMaterial(new p2.ContactMaterial(materials.wood, materials.saw, {
    restitution: 0.3,
    stiffness: Number.MAX_VALUE,
    friction: 0.6,
    relaxation: undefined,
    frictionStiffness: undefined,
    frictionRelaxation: undefined,
    surfaceVelocity: undefined
  }));

  world.addContactMaterial(new p2.ContactMaterial(materials.wood, materials.brick, {
    restitution: 0.1,
    stiffness: Number.MAX_VALUE,
    friction: 0.6,
    relaxation: undefined,
    frictionStiffness: undefined,
    frictionRelaxation: undefined,
    surfaceVelocity: undefined
  }));

  world.addContactMaterial(new p2.ContactMaterial(materials.wood, materials.ball, {
    restitution: 0.4,
    stiffness: Number.MAX_VALUE,
    friction: 0.3,
    relaxation: undefined,
    frictionStiffness: undefined,
    frictionRelaxation: undefined,
    surfaceVelocity: undefined
  }));


  // Brick

  world.addContactMaterial(new p2.ContactMaterial(materials.brick, materials.brick, {
    restitution: 0,
    stiffness: Number.MAX_VALUE,
    friction: 0.8,
    relaxation: undefined,
    frictionStiffness: undefined,
    frictionRelaxation: undefined,
    surfaceVelocity: undefined
  }));

  world.addContactMaterial(new p2.ContactMaterial(materials.brick, materials.ball, {
    restitution: 0.5,
    stiffness: Number.MAX_VALUE,
    friction: 0.4,
    relaxation: undefined,
    frictionStiffness: undefined,
    frictionRelaxation: undefined,
    surfaceVelocity: undefined
  }));

  world.addContactMaterial(new p2.ContactMaterial(materials.brick, materials.saw, {
    restitution: 0.3,
    stiffness: Number.MAX_VALUE,
    friction: 0.4,
    relaxation: undefined,
    frictionStiffness: undefined,
    frictionRelaxation: undefined,
    surfaceVelocity: undefined
  }));


  // Saw

  world.addContactMaterial(new p2.ContactMaterial(materials.saw, materials.saw, {
    restitution: 0.4,
    stiffness: Number.MAX_VALUE,
    friction: 0.8,
    relaxation: undefined,
    frictionStiffness: undefined,
    frictionRelaxation: undefined,
    surfaceVelocity: undefined
  }));

}

export default createWorld;