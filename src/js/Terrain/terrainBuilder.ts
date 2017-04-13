import TerrainObject from '../Terrain/Objects/TerrainObject';
import TerrainObjectType from '../Terrain/Objects/TerrainObjectType';
import IPixiGraph from '../Pixi/IPixiGraph';
import ITextures from '../Assets/ITextures';
import randomUtil from '../Utility/randomUtil';
import terrainUtil from './terrainUtil';
import p2Util from '../p2/p2Util';

import Girder from './Objects/Girder';
import Brick from './Objects/Brick';
import Seesaw from './Objects/Seesaw';
import Spinner from './Objects/Spinner';
import Snake from './Objects/Snake';
import FreeSaw from './Objects/FreeSaw';
import Saw from './Objects/Saw';
import SawSpinner from './Objects/SawSpinner';
import SawSnake from './Objects/SawSnake';
import Plus1Life from './Objects/Plus1Life';
import ground from './../ground';

let world: p2.World;
let pixiGraph: IPixiGraph;

let girders: Girder[];
let bricks: Brick[];
let seesaws: Seesaw[];
let spinners: Spinner[];
let freeSaws: FreeSaw[];
let saws: Saw[];
let sawSpinners: SawSpinner[];
let snakes: Snake[];
let sawSnakes: SawSnake[];
let plus1Lifes: Plus1Life[];

let allSnakes: Snake[] = [];

const terrainObjectPoolMap: any = {};
const terrainObjectPools: TerrainObject[][] = [];

let groundBody: p2.Body;

let purgeCheckPoolIndex = 0;
let purgeCheckObjectIndex = 0;

interface IWindZone {
  startY: number;
  endY: number;
  strength: number;
}

const windZones: IWindZone[] = [
  { startY: 600, endY: 575, strength: 1.5 },
  { startY: 500, endY: 475, strength: -1.75 },
  { startY: 350, endY: 325, strength: 2 },
  { startY: 275, endY: 250, strength: -2.25 },
  { startY: 100, endY: 75, strength: 2.5 },
  { startY: 75, endY: 50, strength: -2.75 }
];

function createTerrainObjects(factory: () => TerrainObject, count: number): TerrainObject[] {
  const pool: TerrainObject[] = [];
  for (let i = 0; i < count; i++) {
    pool.push(factory());
  }

  return pool;
}

function getActiveCount(terrainObjects: TerrainObject[]): number {
  let count = 0;
  for (let i = 0; i < terrainObjects.length; i++) {
    if (terrainObjects[i].active) count++;
  }

  return count;
}

function initialize(wld: p2.World, pxGraph: IPixiGraph, textures: ITextures): void {
  world = wld;
  pixiGraph = pxGraph;

  girders = createTerrainObjects(() => new Girder(world, pxGraph, textures), 20) as Girder[];
  bricks = createTerrainObjects(() => new Brick(world, pxGraph, textures), 6) as Brick[];
  seesaws = createTerrainObjects(() => new Seesaw(world, pxGraph, textures), 8) as Seesaw[];
  spinners = createTerrainObjects(() => new Spinner(world, pxGraph, textures), 8) as Spinner[];
  freeSaws = createTerrainObjects(() => new FreeSaw(world, pxGraph, textures), 4) as FreeSaw[];
  saws = createTerrainObjects(() => new Saw(world, pxGraph, textures), 20) as Saw[];
  sawSpinners = createTerrainObjects(() => new SawSpinner(world, pxGraph, textures), 8) as SawSpinner[];
  plus1Lifes = createTerrainObjects(() => new Plus1Life(world, pxGraph, textures), 2) as Plus1Life[];

  snakes = createTerrainObjects(() => {
    const speed = 0.5 + randomUtil.random0To1();
    const agitateTime = (1 + randomUtil.random0To1()) * 1000;
    return new Snake(world, pxGraph, textures, speed, agitateTime);
  }, 8) as Snake[];

  sawSnakes = createTerrainObjects(() => {
    const speed = 0.5 + randomUtil.random0To1();
    const agitateTime = (1 + randomUtil.random0To1()) * 1000;
    return new SawSnake(world, pxGraph, textures, speed, agitateTime);
  }, 6) as SawSnake[];

  allSnakes = snakes.concat(sawSnakes);

  terrainObjectPoolMap[TerrainObjectType.Girder] = girders;
  terrainObjectPoolMap[TerrainObjectType.Brick] = bricks;
  terrainObjectPoolMap[TerrainObjectType.Seesaw] = seesaws;
  terrainObjectPoolMap[TerrainObjectType.Spinner] = spinners;
  terrainObjectPoolMap[TerrainObjectType.FreeSaw] = freeSaws;
  terrainObjectPoolMap[TerrainObjectType.Saw] = saws;
  terrainObjectPoolMap[TerrainObjectType.SawSpinner] = sawSpinners;
  terrainObjectPoolMap[TerrainObjectType.Snake] = snakes;
  terrainObjectPoolMap[TerrainObjectType.SawSnake] = sawSnakes;
  terrainObjectPoolMap[TerrainObjectType.Plus1Life] = plus1Lifes;

  terrainObjectPools.push.apply(terrainObjectPools, [girders, bricks, seesaws, spinners, snakes, freeSaws, saws, sawSpinners, sawSnakes, plus1Lifes]);

  groundBody = ground.initialize(world, pixiGraph, textures);
}

function update(ballBody: p2.Body, screenAABB: p2.AABB) {
  const activeBufferUnits = 16;

  const activeAABB = new p2.AABB();
  activeAABB.lowerBound[0] = screenAABB.lowerBound[0] - activeBufferUnits;
  activeAABB.lowerBound[1] = screenAABB.lowerBound[1] - activeBufferUnits;
  activeAABB.upperBound[0] = screenAABB.upperBound[0] + activeBufferUnits;
  activeAABB.upperBound[1] = screenAABB.upperBound[1] + activeBufferUnits;

  setObjectStates(screenAABB, activeAABB);

  terrainUtil.updateAABBs(world);

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

function positionGround(ballBody: p2.Body): void {
  const groundPositionX = (Math.round(ballBody.position[0] / 16) * 16);
  const groundPosition = [groundPositionX, -10];
  p2Util.updateBodyPosition(groundBody, groundPosition);
}

function deployTerrainObject(type: TerrainObjectType, targetActiveCount: number, aabb: p2.AABB, width: number, height: number, buffer: number, ...args: any[]): void {
  const terrainObjects = terrainObjectPoolMap[type];
  if (getActiveCount(terrainObjects) < targetActiveCount) {
    for (let i = 0; i < terrainObjects.length; i++) {
      const terrainObject = terrainObjects[i];
      if (!terrainObject.active) {
        const position = terrainUtil.getRandomPosition(world, aabb, width, height, buffer);
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

function deployGirder(aabb: p2.AABB, targetActiveCount: number, buffer: number): void {
  const angle = randomUtil.random0To1() * (Math.PI * 2);
  deployTerrainObject(TerrainObjectType.Girder, targetActiveCount, aabb, 5, 5, buffer, angle);
}

function deployBrick(aabb: p2.AABB, targetActiveCount: number, buffer: number): void {
  const angle = randomUtil.random0To1() * (Math.PI * 2);
  deployTerrainObject(TerrainObjectType.Brick, targetActiveCount, aabb, 5, 5, buffer, angle);
}

function deploySeesaw(aabb: p2.AABB, targetActiveCount: number, buffer: number): void {
  const isUpright = randomUtil.randomBoolean();
  const width = isUpright ? 1 : 6;
  const height = isUpright ? 6 : 1;
  deployTerrainObject(TerrainObjectType.Seesaw, targetActiveCount, aabb, width, height, buffer, isUpright);
}

function deploySpinner(aabb: p2.AABB, targetActiveCount: number, buffer: number): void {
  const speed = randomUtil.randomInt(200, 250) * randomUtil.randomSign();
  deployTerrainObject(TerrainObjectType.Spinner, targetActiveCount, aabb, 7, 7, buffer, speed);
}

function deploySnake(aabb: p2.AABB, targetActiveCount: number, buffer: number): void {
  const speed = randomUtil.randomInt(40, 60) * randomUtil.randomSign();
  const agitateTime = randomUtil.randomInt(2500, 5000);
  deployTerrainObject(TerrainObjectType.Snake, targetActiveCount, aabb, 0.5, 14.5, buffer, speed, agitateTime);
}

function deployFreeSaw(aabb: p2.AABB, targetActiveCount: number, buffer: number, velocity: number[]): void {
  deployTerrainObject(TerrainObjectType.FreeSaw, targetActiveCount, aabb, 1, 1, buffer, velocity);
}

function deploySaw(aabb: p2.AABB, targetActiveCount: number, buffer: number): void {
  deployTerrainObject(TerrainObjectType.Saw, targetActiveCount, aabb, 2, 2, buffer);
}

function deploySawSpinner(aabb: p2.AABB, targetActiveCount: number, buffer: number): void {
  const speed = randomUtil.randomInt(200, 250) * randomUtil.randomSign();
  deployTerrainObject(TerrainObjectType.SawSpinner, targetActiveCount, aabb, 9, 9, buffer, speed);
}

function deploySawSnake(aabb: p2.AABB, targetActiveCount: number, buffer: number): void {
  const speed = randomUtil.randomInt(40, 60) * randomUtil.randomSign();
  const agitateTime = randomUtil.randomInt(2500, 5000);
  deployTerrainObject(TerrainObjectType.SawSnake, targetActiveCount, aabb, 2, 14.5, buffer, speed, agitateTime);
}

function deployPlus1Life(aabb: p2.AABB, targetActiveCount: number, buffer: number): void {
  deployTerrainObject(TerrainObjectType.Plus1Life, targetActiveCount, aabb, 2, 2, buffer);
}

function populateArea(aabb: p2.AABB): void {
  const height = terrainUtil.getMidHeight(aabb);

  const buffer = terrainUtil.getCountLessAsDescends(height, 4, 6, 1000);

  deploySawSnake(aabb, terrainUtil.getCountMoreAsDescends(height, 3, 6, 250), buffer);
  deploySawSpinner(aabb, terrainUtil.getCountLessAsDescends(height, 2, 8, 500), buffer);
  deploySnake(aabb, terrainUtil.getCountLessAsDescends(height, 1, 8, 600), buffer);
  deploySpinner(aabb, terrainUtil.getCountLessAsDescends(height, 1, 8, 800), buffer);
  deploySeesaw(aabb, terrainUtil.getCountLessAsDescends(height, 1, 8, 900), buffer);
  deployGirder(aabb, terrainUtil.getCountLessAsDescends(height, 1, 20, 1000), buffer);
  deploySaw(aabb, terrainUtil.getCountLessAsDescends(height, 20, 2, 1000), buffer);
  deployPlus1Life(aabb, terrainUtil.getCountMoreAsDescends(height, 1, 2, 500), buffer);
}

function dropBricks(topAABB: p2.AABB): void {
  const height = terrainUtil.getMidHeight(topAABB);
  const targetActiveCount = terrainUtil.getCountMoreAsDescends(height, 2, 6, 975);
  if (targetActiveCount === 0) return;

  const topAABBCopy = new p2.AABB();
  topAABBCopy.copy(topAABB);
  topAABBCopy.upperBound[1] -= 12;
  topAABBCopy.lowerBound[0] += 4;
  topAABBCopy.upperBound[0] -= 4;

  deployBrick(topAABB, targetActiveCount, 1);
}

function throwSaws(leftAABB: p2.AABB, rightAABB: p2.AABB, bottomAABB: p2.AABB): void {
  const height = terrainUtil.getMidHeight(leftAABB);
  const targetActiveCount = terrainUtil.getCountMoreAsDescends(height, 2, 4, 975);
  if (targetActiveCount === 0) return;

  // Throw from sides
  {
    const isFromLeft = randomUtil.randomBoolean();

    const aabb = new p2.AABB();
    aabb.copy(isFromLeft ? leftAABB : rightAABB);
    aabb.lowerBound[1] += 14;
    if (isFromLeft) {
      aabb.lowerBound[0] += 13;
    } else {
      aabb.upperBound[0] -= 13;
    }

    const horizontalVelocity = 10;
    const verticalVelocity = randomUtil.random0To1();
    const velocity: number[] = isFromLeft ? [horizontalVelocity, verticalVelocity] : [-horizontalVelocity, verticalVelocity];

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
    const horizontalVelocity = randomUtil.random0To1();
    const velocity: number[] = [horizontalVelocity, verticalVelocity];

    deployFreeSaw(bottomAABB, targetActiveCount, 1, velocity);
  }
}

function applyWind(ballBody: p2.Body): void {
  let bodiesToBlow: p2.Body[] = [];
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
      } else {
        pixiGraph.windLeft.visible = true;
      }
      break;
    }
  }
}

function agitateSnakes(): void {
  for (let i = 0; i < allSnakes.length; i++) {
    const snake = allSnakes[i];
    if (snake.active) {
      snake.agitate();
    }
  }
}

function setObjectStates(screenAABB: p2.AABB, activeAABB: p2.AABB): void {
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
        } else if (aabb.upperBound[0] < screenAABB.lowerBound[0] ||
          aabb.lowerBound[0] > screenAABB.upperBound[0] ||
          aabb.lowerBound[1] > screenAABB.upperBound[1] ||
          aabb.upperBound[1] < screenAABB.lowerBound[1]) {

          // Object is inside active area but off screen
          terrainObject.suspend();
        } else {
          // Object is on-screen
          if (terrainObject.suspended) {
            terrainObject.resume();
          }
        }
      }
    }
  }
}

function deactivateAll(): void {
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

export default { initialize, update, deactivateAll }