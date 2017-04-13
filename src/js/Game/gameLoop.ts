import GameState from './GameState';
import TerrainObject from '../Terrain/Objects/TerrainObject';
import randomUtil from '../Utility/randomUtil';
import soundPlayer from '../Sound/soundPlayer';
import IPixiGraph from '../Pixi/IPixiGraph';
import pixiRenderer from '../Pixi/pixiRenderer';
import bar from '../bar';
import terrainBuilder from '../Terrain/terrainBuilder';
import Color from '../Color';
import tintUtil from '../Utility/tintUtil';
import timer from '../Utility/timer';
import p2Util from '../p2/p2Util';
import Bus from '../Bus';

const startingHeight = 1000;
const startingLives = 5;

let height = startingHeight;
let lives = startingLives;

let timeElapsed: number = null;
let timeSinceLastCheckpoint: number = null;
let nextCheckpointHeight: number = null;
let clockTicking: boolean;

let isInvincible: boolean = false;
let timeSinceInvincible: number = null;

let fatalTerrainObject: TerrainObject;
let tintedSprites: PIXI.Sprite[] = [];

let world: p2.World = null;
let pixiGraph: IPixiGraph = null;

let ballBody: p2.Body;
let screenAABB = new p2.AABB();

let lastAnimateTime: number;
let state: GameState;
let preNavState: GameState;
let prePageHiddenState: GameState;

function initialize(wld: p2.World, pxGraph: IPixiGraph, ballBdy: p2.Body): void {
  world = wld;
  pixiGraph = pxGraph;
  ballBody = ballBdy;

  document.addEventListener('visibilitychange', handleVisibilityChange, false);

  pixiGraph.terrainContainer.visible = false;

  preNavState = GameState.Active;
  setState(GameState.Intro);

  soundPlayer.play('saw');

  requestAnimationFrame(animate);
}

function handleVisibilityChange(e: any) {
  const document = e.target as HTMLDocument;
  const visibilityState = document.visibilityState;

  if (visibilityState === 'visible') {
    lastAnimateTime = performance.now();
    soundPlayer.resumeAll();
    setState(prePageHiddenState);
  } else {
    prePageHiddenState = state;
    soundPlayer.pauseAll();
    setState(GameState.PageHidden);
  }
}

function animate(time: number): void {
  requestAnimationFrame(animate);

  if (state === GameState.PageHidden) return;

  const fixedTimeStep: number = 1 / 60;
  let deltaTime = time - (lastAnimateTime || time);

  lastAnimateTime = time;

  switch (state) {
    case GameState.Active:
      const containerPosition = pixiGraph.container.position;
      const ballBodyPositionX = ballBody.position[0];
      const ballBodyPositionY = ballBody.position[1];

      processInvincibility(deltaTime);
      updateScreenAABB();
      bar.update();
      terrainBuilder.update(ballBody, screenAABB);

      world.step(fixedTimeStep, deltaTime / 1000, 5);
      p2Util.limitVelocity(world);

      processHeightChange(ballBodyPositionY);
      processCheckpoints(ballBodyPositionY, deltaTime);

      setScroll(ballBodyPositionX, ballBodyPositionY, containerPosition);
      updateTransforms();

      timeElapsed += deltaTime;
      break;

    case GameState.Dying:
      processLifeLostAnimation(deltaTime);
      break;

    case GameState.Won:
      processGameWonAnimation(deltaTime);
      break;

    case GameState.Lost:
      processGameLostAnimation(deltaTime);
      break;
  }

  pixiRenderer.render(pixiGraph.stage);
}

function processHeightChange(ballBodyPositionY: number): void {
  if (ballBodyPositionY <= 0) return;

  const currentHeight = Math.round(ballBodyPositionY);
  if (currentHeight !== height) {
    height = currentHeight;
    Bus.publish('Height.Set', height);
  }
}

function processCheckpoints(ballBodyPositionY: number, deltaTime: number): void {
  if (ballBodyPositionY <= 0) return;

  if (nextCheckpointHeight === null || ballBodyPositionY <= nextCheckpointHeight) {
    nextCheckpointHeight = (Math.floor(ballBodyPositionY / 100) * 100);
    if (nextCheckpointHeight === ballBodyPositionY) {
      nextCheckpointHeight -= 100;
    }
    timeSinceLastCheckpoint = 0;
    Bus.publish('NextCheckpointHeight.Set', nextCheckpointHeight);

    soundPlayer.stop('clock');
    clockTicking = false;

    soundPlayer.play('checkpoint');
  } else {
    timeSinceLastCheckpoint += deltaTime;
  }

  let timeRemainingQuotient = 1 - (timeSinceLastCheckpoint / (30000));
  if (timeRemainingQuotient <= 0) {
    timeSinceLastCheckpoint = 0;
    timeRemainingQuotient = 0;

    soundPlayer.stop('clock');
    clockTicking = false;

    lostLife(null);
  } else if (timeRemainingQuotient <= (1 / 3) && !clockTicking) {
    soundPlayer.play('clock');
    clockTicking = true;
  }

  Bus.publish('TimeRemainingQuotient.Set', timeRemainingQuotient);
}

function processInvincibility(deltaTime: number): void {
  if (isInvincible) {
    timeSinceInvincible += deltaTime;
    if (timeSinceInvincible > (3000)) {
      timeSinceInvincible = 0;
      isInvincible = false;
      Bus.publish('IsInvincible.Set', isInvincible);
    }
  }
}

function setScroll(ballBodyPositionX: number, ballBodyPositionY: number, containerPosition: PIXI.Point): void {
  // Focus on the ball
  containerPosition.x = (pixiRenderer.width / 2) - (ballBodyPositionX * 64);
  containerPosition.y = 640 + (ballBodyPositionY * 64);

  // Position parallax background
  const backgroundPosition = pixiGraph.background.position;
  backgroundPosition.x = (((containerPosition.x + 10000000) / 2) % 1024);
  backgroundPosition.y = (((containerPosition.y + 10000000) / 2) % 1024);
}

function updateTransforms(): void {
  const pixelsPerUnit = 64;

  const bodies = world.bodies;
  for (let i = 0; i < bodies.length; i++) {
    const body = bodies[i];

    if (body.aabbNeedsUpdate) {
      body.updateAABB();
    }
    const aabb = body.aabb;

    const interpolatedPosition = body.interpolatedPosition;

    const isOnScreen = !(aabb.lowerBound[1] > screenAABB.upperBound[1] ||
      aabb.upperBound[1] < screenAABB.lowerBound[1] ||
      aabb.upperBound[0] < screenAABB.lowerBound[0] ||
      aabb.lowerBound[0] > screenAABB.upperBound[0]);

    const displayObject = body.sprite;
    if (displayObject) {
      const position = displayObject.position;
      position.x = interpolatedPosition[0] * pixelsPerUnit;
      position.y = -interpolatedPosition[1] * pixelsPerUnit;
      displayObject.rotation = -body.interpolatedAngle;
      displayObject.visible = isOnScreen;
    }

    const displayObjectReflection = body.spriteReflection;
    if (displayObjectReflection) {
      const position = displayObjectReflection.position;
      position.x = interpolatedPosition[0] * pixelsPerUnit;
      position.y = -interpolatedPosition[1] * pixelsPerUnit;
      displayObjectReflection.visible = isOnScreen;
    }
  }
}

function processLifeLostAnimation(deltaTime: number): void {
  const increments = (1000 / deltaTime) * 1.5;
  const alphaDelta = 1 / increments;
  pixiGraph.playerBallContainer.alpha -= alphaDelta;

  if (pixiGraph.playerBallContainer.alpha <= 0) {
    tintUtil.untintSprite(ballBody.sprite);
    tintUtil.untintSprite(ballBody.spriteReflection);

    if (fatalTerrainObject) {
      fatalTerrainObject.deactivate();
      tintUtil.untintTerrainObject(fatalTerrainObject);
      fatalTerrainObject = null;
    }

    pixiGraph.playerBallContainer.alpha = 1;
    p2Util.resetBody(ballBody);

    if (lives <= 0) {
      gameLost();
      return;
    }

    setState(GameState.Active);

    isInvincible = true;
    Bus.publish('IsInvincible.Set', isInvincible);

    soundPlayer.resumeAll();
  }
}

function getVisibleSprites(): PIXI.Sprite[] {
  const visibleSprites = pixiGraph.terrainContainer.children.map((displayObject: PIXI.DisplayObject) =>
    displayObject instanceof PIXI.Sprite
      ? [displayObject]
      : (displayObject as PIXI.Container).children.filter((sprite: PIXI.Sprite) => sprite.visible) as PIXI.Sprite[]);

  return [pixiGraph.background]
    .concat(pixiGraph.barContainer.children[0] as PIXI.Sprite)
    .concat(...visibleSprites);
}

function lostLife(fatalBody: p2.Body) {
  lives--;
  Bus.publish('Lives.Set', lives);

  bar.finalize();

  setState(GameState.Dying);

  soundPlayer.pauseAll();
  if (fatalBody) {
    soundPlayer.play('lostLife');
  } else {
    soundPlayer.play('alarm');
  }
}

function gameLost(): void {
  setState(GameState.Lost);
  soundPlayer.stopAll();
  soundPlayer.play('lost');

  tintedSprites = getVisibleSprites();
  for (let i = 0; i < tintedSprites.length; i++) {
    tintUtil.tintSprite(tintedSprites[i], Color.red);
  }
}

function processGameLostAnimation(deltaTime: number): void {
  const increments = (1000 / deltaTime) * 3;
  const alphaDelta = 1 / increments;
  pixiGraph.background.alpha -= alphaDelta;
  pixiGraph.container.alpha -= alphaDelta;

  if (pixiGraph.container.alpha <= 0) {
    startNewGame();
  }
}

function gameWon(): void {
  setState(GameState.Won);
  soundPlayer.stopAll();
  soundPlayer.play('won');

  Bus.publish('Menu.RequestGameWonPanel', { time: timeElapsed, lives: lives });
}

function processGameWonAnimation(deltaTime: number): void {
  Bus.publish('Menu.IncrementGameWonPanelAlpha', deltaTime);
}

function updateScreenAABB(): void {
  const ballBodyPosition = ballBody.position;
  const ballBodyPositionX = ballBodyPosition[0];
  const ballBodyPositionY = ballBodyPosition[1];

  screenAABB.lowerBound[0] = ballBodyPositionX - 8;
  screenAABB.lowerBound[1] = ballBodyPositionY - 18;
  screenAABB.upperBound[0] = ballBodyPositionX + 8;
  screenAABB.upperBound[1] = ballBodyPositionY + 10;
}

function startNewGame(): void {
  randomUtil.reseed();

  terrainBuilder.deactivateAll();

  height = startingHeight;
  Bus.publish('Height.Set', height);

  lives = startingLives;
  Bus.publish('Lives.Set', lives);

  isInvincible = false;

  timeSinceLastCheckpoint = 0;
  nextCheckpointHeight = startingHeight - 100;
  Bus.publish('NextCheckpointHeight.Set', nextCheckpointHeight);

  timeElapsed = 0;

  p2Util.updateBodyPosition(ballBody, [0, height]);

  tintUtil.untintSprite(ballBody.sprite);
  tintUtil.untintSprite(ballBody.spriteReflection);

  for (let i = 0; i < tintedSprites.length; i++) {
    tintUtil.untintSprite(tintedSprites[i]);
  }

  pixiGraph.background.alpha = 1;
  pixiGraph.container.alpha = 1;

  if (fatalTerrainObject) {
    tintUtil.untintTerrainObject(fatalTerrainObject);
    fatalTerrainObject = null;
  }

  pixiGraph.playerBallContainer.alpha = 1;
  pixiGraph.sawContainer.alpha = 1;
  pixiGraph.freeSawContainer.alpha = 1;

  soundPlayer.stopAll();

  bar.hide();

  setState(GameState.Active);
}

function setState(newState: GameState): void {
  state = newState;

  const isActive = (state === GameState.Active);
  pixiRenderer.view.className = isActive ? 'playing-field' : '';
  Bus.publish('State.IsActive', isActive);
}

Bus.subscribe('Menu.Shown', () => {
  pixiGraph.background.visible = false;
  pixiGraph.container.visible = false;
  pixiGraph.windLeft.visible = false;
  pixiGraph.windRight.visible = false;

  soundPlayer.pauseAll();

  preNavState = state;
  setState(GameState.Menu);
});

Bus.subscribe('Menu.Hidden', () => {
  pixiGraph.background.visible = true;

  if (state === GameState.Intro) {
    pixiGraph.terrainContainer.visible = true;
    startNewGame();
  } else {
    pixiGraph.container.visible = true;
    soundPlayer.resumeAll();
    setState(preNavState);
  }
});

Bus.subscribe('Menu.RequestRestartGame', () => {
  pixiGraph.background.visible = true;
  pixiGraph.container.visible = true;

  startNewGame();
});

Bus.subscribe('Ball.CollisionWithFatal', (fatalBody: p2.Body) => {
  if (!isInvincible) {
    fatalTerrainObject = fatalBody.terrainObject as TerrainObject;

    tintUtil.tintSprite(ballBody.sprite, Color.red);
    tintUtil.tintSprite(ballBody.spriteReflection, Color.red);
    tintUtil.tintTerrainObject(fatalTerrainObject, Color.red);

    lostLife(fatalBody);
  }
});

Bus.subscribe('Ball.CollisionWithPlusOne', () => {
  lives++;
  Bus.publish('Lives.Set', lives);

  soundPlayer.play('gainedLife');
});

Bus.subscribe('Ball.CollisionWithGround', () => {
  gameWon();
});

export default { initialize };