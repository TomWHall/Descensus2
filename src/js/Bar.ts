import materials from './p2/materials';
import ITextures from './Assets/ITextures';
import IPixiGraph from './Pixi/IPixiGraph';
import p2Util from './p2/p2Util';
import IContactEvent from './p2/IContactEvent';
import Bus from './Bus';

let stage: PIXI.Container;
let container: PIXI.Container;
let barContainer: PIXI.Container;

let worldPointA: number[];
let worldPointB: number[];
let pixiPointB: PIXI.Point;

let body: p2.Body;
let box: p2.Box;
let sprite: PIXI.Sprite;
let finalized: boolean;

let isActiveState = false;

function initialize(world: p2.World, pixiGraph: IPixiGraph, textures: ITextures) {
  stage = pixiGraph.stage;
  container = pixiGraph.container;
  barContainer = pixiGraph.barContainer;

  body = new p2.Body({
    mass: 20000,
    position: [-999999, 0]
  });
  body.gravityScale = 0;
  body.allowSleep = false;

  box = new p2.Box({ width: 0.25, height: 0.25 });
  box.material = materials.wood;
  body.addShape(box);

  sprite = new PIXI.Sprite(textures.bar);
  sprite.width = box.width * 64;
  sprite.height = box.height * 64;
  sprite.anchor = new PIXI.ObservablePoint(null, null, 0.5, 0.5);
  pixiGraph.barContainer.addChild(sprite);
  body.sprite = sprite;

  finalized = true;

  world.addBody(body);

  world.on('beginContact', beginContact, this);

  addTouchHandlers();
}

function click(e: PIXI.interaction.InteractionEvent): void {
  if (!finalized) return;

  finalized = false;
  box.sensor = true;

  const point = e.data.getLocalPosition(stage);
  worldPointA = getWorldPosition(point);
  worldPointB = [worldPointA[0], worldPointA[1]];
  pixiPointB = new PIXI.Point(point.x, point.y);

  update();
}

function drag(e: PIXI.interaction.InteractionEvent): void {
  if (finalized) return;

  const point = e.data.getLocalPosition(stage);
  pixiPointB.x = point.x;
  pixiPointB.y = point.y;

  box.sensor = false;
}

function update(): void {
  if (finalized) return;

  const newWorldPointB = getWorldPosition(pixiPointB);
  if (newWorldPointB[0] === worldPointB[0] && newWorldPointB[1] === worldPointB[1]) return;
  worldPointB[0] = newWorldPointB[0];
  worldPointB[1] = newWorldPointB[1];

  const x1 = worldPointA[0];
  const y1 = worldPointA[1];
  const x2 = worldPointB[0];
  const y2 = worldPointB[1];

  const xDiff = x2 - x1;
  const yDiff = y2 - y1;

  body.position[0] = ((x1 + x2) / 2);
  body.position[1] = ((y1 + y2) / 2);
  body.angle = Math.atan2(yDiff, xDiff);

  const width = Math.max(0.25, Math.sqrt((xDiff * xDiff) + (yDiff * yDiff)));
  box.width = width;

  const convex = box as p2.Convex;
  convex.vertices[0][0] = -width / 2;
  convex.vertices[0][1] = -0.125;
  convex.vertices[1][0] = width / 2;
  convex.vertices[1][1] = -0.125;
  convex.vertices[2][0] = width / 2;
  convex.vertices[2][1] = 0.125;
  convex.vertices[3][0] = -width / 2;
  convex.vertices[3][1] = 0.125;

  convex.updateTriangles();
  convex.updateCenterOfMass();
  convex.updateBoundingRadius();
  convex.updateArea();

  body.updateAABB();
  body.updateBoundingRadius();

  sprite.position.x = body.position[0] * 64;
  sprite.position.y = -body.position[1] * 64;
  sprite.width = width * 64;
}

function finalize(): void {
  if (finalized) return;

  update();

  // Delay seems necessary to bring bar to a stop, doesn't work in post-step phase.
  // TODO: Replace this hideous timeout with a delay managed by the game loop
  window.setTimeout(() => { p2Util.resetBody(body); }, 50);

  finalized = true;
}

function hide(): void {
  p2Util.updateBodyPosition(body, [-999999, 0]);
}

function getWorldPosition(point: PIXI.Point): number[] {
  const pixiRendererContainerPosition = container.position;

  return [(point.x - pixiRendererContainerPosition.x) / 64, (pixiRendererContainerPosition.y - point.y) / 64];
}

function addTouchHandlers(): void {
  function onTouch(e: PIXI.interaction.InteractionEvent) {
    if (!isActiveState) return;

    click(e);
  }

  function onDrag(e: PIXI.interaction.InteractionEvent) {
    if (!isActiveState) return;

    drag(e);
  }

  function onRelease(e: PIXI.interaction.InteractionEvent) {
    if (!isActiveState) return;

    finalize();
  }

  barContainer.on('touchstart', onTouch);
  barContainer.on('touchmove', onDrag);
  barContainer.on('touchend', onRelease);
  barContainer.on('touchendoutside', onRelease);

  barContainer.on('mousedown', onTouch);
  barContainer.on('mousemove', onDrag);
  barContainer.on('mouseup', onRelease);
  barContainer.on('mouseupoutside', onRelease);
}

function beginContact(contactEvent: IContactEvent): void {
  if (finalized) return;

  const bodyA = contactEvent.bodyA;
  const bodyB = contactEvent.bodyB;
  const barBody = body;

  if (!(bodyA === barBody || bodyB === barBody)) return;

  if (box.sensor) {
    hide();
    return;
  }

  finalize();
}

Bus.subscribe('State.IsActive', (isActive: boolean) => {
  isActiveState = isActive;
});

export default { initialize, update, finalize, hide }