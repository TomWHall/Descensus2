"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const GameState_1 = require("./GameState");
const randomUtil_1 = require("../Utility/randomUtil");
const soundPlayer_1 = require("../Sound/soundPlayer");
const pixiRenderer_1 = require("../Pixi/pixiRenderer");
const bar_1 = require("../bar");
const terrainBuilder_1 = require("../Terrain/terrainBuilder");
const Color_1 = require("../Color");
const tintUtil_1 = require("../Utility/tintUtil");
const p2Util_1 = require("../p2/p2Util");
const Bus_1 = require("../Bus");
const startingHeight = 1000;
const startingLives = 5;
let height = startingHeight;
let lives = startingLives;
let timeElapsed = null;
let timeSinceLastCheckpoint = null;
let nextCheckpointHeight = null;
let clockTicking;
let isInvincible = false;
let timeSinceInvincible = null;
let fatalTerrainObject;
let tintedSprites = [];
let world = null;
let pixiGraph = null;
let ballBody;
let screenAABB = new p2.AABB();
let lastAnimateTime;
let state;
let preNavState;
let prePageHiddenState;
function initialize(wld, pxGraph, ballBdy) {
    world = wld;
    pixiGraph = pxGraph;
    ballBody = ballBdy;
    document.addEventListener('visibilitychange', handleVisibilityChange, false);
    pixiGraph.terrainContainer.visible = false;
    preNavState = GameState_1.default.Active;
    setState(GameState_1.default.Intro);
    soundPlayer_1.default.play('saw');
    requestAnimationFrame(animate);
}
function handleVisibilityChange(e) {
    const document = e.target;
    const visibilityState = document.visibilityState;
    if (visibilityState === 'visible') {
        lastAnimateTime = performance.now();
        soundPlayer_1.default.resumeAll();
        setState(prePageHiddenState);
    }
    else {
        prePageHiddenState = state;
        soundPlayer_1.default.pauseAll();
        setState(GameState_1.default.PageHidden);
    }
}
function animate(time) {
    requestAnimationFrame(animate);
    if (state === GameState_1.default.PageHidden)
        return;
    const fixedTimeStep = 1 / 60;
    let deltaTime = time - (lastAnimateTime || time);
    lastAnimateTime = time;
    switch (state) {
        case GameState_1.default.Active:
            const containerPosition = pixiGraph.container.position;
            const ballBodyPositionX = ballBody.position[0];
            const ballBodyPositionY = ballBody.position[1];
            processInvincibility(deltaTime);
            updateScreenAABB();
            bar_1.default.update();
            terrainBuilder_1.default.update(ballBody, screenAABB);
            world.step(fixedTimeStep, deltaTime / 1000, 5);
            p2Util_1.default.limitVelocity(world);
            processHeightChange(ballBodyPositionY);
            processCheckpoints(ballBodyPositionY, deltaTime);
            setScroll(ballBodyPositionX, ballBodyPositionY, containerPosition);
            updateTransforms();
            timeElapsed += deltaTime;
            break;
        case GameState_1.default.Dying:
            processLifeLostAnimation(deltaTime);
            break;
        case GameState_1.default.Won:
            processGameWonAnimation(deltaTime);
            break;
        case GameState_1.default.Lost:
            processGameLostAnimation(deltaTime);
            break;
    }
    pixiRenderer_1.default.render(pixiGraph.stage);
}
function processHeightChange(ballBodyPositionY) {
    if (ballBodyPositionY <= 0)
        return;
    const currentHeight = Math.round(ballBodyPositionY);
    if (currentHeight !== height) {
        height = currentHeight;
        Bus_1.default.publish('Height.Set', height);
    }
}
function processCheckpoints(ballBodyPositionY, deltaTime) {
    if (ballBodyPositionY <= 0)
        return;
    if (nextCheckpointHeight === null || ballBodyPositionY <= nextCheckpointHeight) {
        nextCheckpointHeight = (Math.floor(ballBodyPositionY / 100) * 100);
        if (nextCheckpointHeight === ballBodyPositionY) {
            nextCheckpointHeight -= 100;
        }
        timeSinceLastCheckpoint = 0;
        Bus_1.default.publish('NextCheckpointHeight.Set', nextCheckpointHeight);
        soundPlayer_1.default.stop('clock');
        clockTicking = false;
        soundPlayer_1.default.play('checkpoint');
    }
    else {
        timeSinceLastCheckpoint += deltaTime;
    }
    let timeRemainingQuotient = 1 - (timeSinceLastCheckpoint / (30000));
    if (timeRemainingQuotient <= 0) {
        timeSinceLastCheckpoint = 0;
        timeRemainingQuotient = 0;
        soundPlayer_1.default.stop('clock');
        clockTicking = false;
        lostLife(null);
    }
    else if (timeRemainingQuotient <= (1 / 3) && !clockTicking) {
        soundPlayer_1.default.play('clock');
        clockTicking = true;
    }
    Bus_1.default.publish('TimeRemainingQuotient.Set', timeRemainingQuotient);
}
function processInvincibility(deltaTime) {
    if (isInvincible) {
        timeSinceInvincible += deltaTime;
        if (timeSinceInvincible > (3000)) {
            timeSinceInvincible = 0;
            isInvincible = false;
            Bus_1.default.publish('IsInvincible.Set', isInvincible);
        }
    }
}
function setScroll(ballBodyPositionX, ballBodyPositionY, containerPosition) {
    // Focus on the ball
    containerPosition.x = (pixiRenderer_1.default.width / 2) - (ballBodyPositionX * 64);
    containerPosition.y = 640 + (ballBodyPositionY * 64);
    // Position parallax background
    const backgroundPosition = pixiGraph.background.position;
    backgroundPosition.x = (((containerPosition.x + 10000000) / 2) % 1024);
    backgroundPosition.y = (((containerPosition.y + 10000000) / 2) % 1024);
}
function updateTransforms() {
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
function processLifeLostAnimation(deltaTime) {
    const increments = (1000 / deltaTime) * 1.5;
    const alphaDelta = 1 / increments;
    pixiGraph.playerBallContainer.alpha -= alphaDelta;
    if (pixiGraph.playerBallContainer.alpha <= 0) {
        tintUtil_1.default.untintSprite(ballBody.sprite);
        tintUtil_1.default.untintSprite(ballBody.spriteReflection);
        if (fatalTerrainObject) {
            fatalTerrainObject.deactivate();
            tintUtil_1.default.untintTerrainObject(fatalTerrainObject);
            fatalTerrainObject = null;
        }
        pixiGraph.playerBallContainer.alpha = 1;
        p2Util_1.default.resetBody(ballBody);
        if (lives <= 0) {
            gameLost();
            return;
        }
        setState(GameState_1.default.Active);
        isInvincible = true;
        Bus_1.default.publish('IsInvincible.Set', isInvincible);
        soundPlayer_1.default.resumeAll();
    }
}
function getVisibleSprites() {
    const visibleSprites = pixiGraph.terrainContainer.children.map((displayObject) => displayObject instanceof PIXI.Sprite
        ? [displayObject]
        : displayObject.children.filter((sprite) => sprite.visible));
    return [pixiGraph.background]
        .concat(pixiGraph.barContainer.children[0])
        .concat(...visibleSprites);
}
function lostLife(fatalBody) {
    lives--;
    Bus_1.default.publish('Lives.Set', lives);
    bar_1.default.finalize();
    setState(GameState_1.default.Dying);
    soundPlayer_1.default.pauseAll();
    if (fatalBody) {
        soundPlayer_1.default.play('lostLife');
    }
    else {
        soundPlayer_1.default.play('alarm');
    }
}
function gameLost() {
    setState(GameState_1.default.Lost);
    soundPlayer_1.default.stopAll();
    soundPlayer_1.default.play('lost');
    tintedSprites = getVisibleSprites();
    for (let i = 0; i < tintedSprites.length; i++) {
        tintUtil_1.default.tintSprite(tintedSprites[i], Color_1.default.red);
    }
}
function processGameLostAnimation(deltaTime) {
    const increments = (1000 / deltaTime) * 3;
    const alphaDelta = 1 / increments;
    pixiGraph.background.alpha -= alphaDelta;
    pixiGraph.container.alpha -= alphaDelta;
    if (pixiGraph.container.alpha <= 0) {
        startNewGame();
    }
}
function gameWon() {
    setState(GameState_1.default.Won);
    soundPlayer_1.default.stopAll();
    soundPlayer_1.default.play('won');
    Bus_1.default.publish('Menu.RequestGameWonPanel', { time: timeElapsed, lives: lives });
}
function processGameWonAnimation(deltaTime) {
    Bus_1.default.publish('Menu.IncrementGameWonPanelAlpha', deltaTime);
}
function updateScreenAABB() {
    const ballBodyPosition = ballBody.position;
    const ballBodyPositionX = ballBodyPosition[0];
    const ballBodyPositionY = ballBodyPosition[1];
    screenAABB.lowerBound[0] = ballBodyPositionX - 8;
    screenAABB.lowerBound[1] = ballBodyPositionY - 18;
    screenAABB.upperBound[0] = ballBodyPositionX + 8;
    screenAABB.upperBound[1] = ballBodyPositionY + 10;
}
function startNewGame() {
    randomUtil_1.default.reseed();
    terrainBuilder_1.default.deactivateAll();
    height = startingHeight;
    Bus_1.default.publish('Height.Set', height);
    lives = startingLives;
    Bus_1.default.publish('Lives.Set', lives);
    isInvincible = false;
    timeSinceLastCheckpoint = 0;
    nextCheckpointHeight = startingHeight - 100;
    Bus_1.default.publish('NextCheckpointHeight.Set', nextCheckpointHeight);
    timeElapsed = 0;
    p2Util_1.default.updateBodyPosition(ballBody, [0, height]);
    tintUtil_1.default.untintSprite(ballBody.sprite);
    tintUtil_1.default.untintSprite(ballBody.spriteReflection);
    for (let i = 0; i < tintedSprites.length; i++) {
        tintUtil_1.default.untintSprite(tintedSprites[i]);
    }
    pixiGraph.background.alpha = 1;
    pixiGraph.container.alpha = 1;
    if (fatalTerrainObject) {
        tintUtil_1.default.untintTerrainObject(fatalTerrainObject);
        fatalTerrainObject = null;
    }
    pixiGraph.playerBallContainer.alpha = 1;
    pixiGraph.sawContainer.alpha = 1;
    pixiGraph.freeSawContainer.alpha = 1;
    soundPlayer_1.default.stopAll();
    bar_1.default.hide();
    setState(GameState_1.default.Active);
}
function setState(newState) {
    state = newState;
    const isActive = (state === GameState_1.default.Active);
    pixiRenderer_1.default.view.className = isActive ? 'playing-field' : '';
    Bus_1.default.publish('State.IsActive', isActive);
}
Bus_1.default.subscribe('Menu.Shown', () => {
    pixiGraph.background.visible = false;
    pixiGraph.container.visible = false;
    pixiGraph.windLeft.visible = false;
    pixiGraph.windRight.visible = false;
    soundPlayer_1.default.pauseAll();
    preNavState = state;
    setState(GameState_1.default.Menu);
});
Bus_1.default.subscribe('Menu.Hidden', () => {
    pixiGraph.background.visible = true;
    if (state === GameState_1.default.Intro) {
        pixiGraph.terrainContainer.visible = true;
        startNewGame();
    }
    else {
        pixiGraph.container.visible = true;
        soundPlayer_1.default.resumeAll();
        setState(preNavState);
    }
});
Bus_1.default.subscribe('Menu.RequestRestartGame', () => {
    pixiGraph.background.visible = true;
    pixiGraph.container.visible = true;
    startNewGame();
});
Bus_1.default.subscribe('Ball.CollisionWithFatal', (fatalBody) => {
    if (!isInvincible) {
        fatalTerrainObject = fatalBody.terrainObject;
        tintUtil_1.default.tintSprite(ballBody.sprite, Color_1.default.red);
        tintUtil_1.default.tintSprite(ballBody.spriteReflection, Color_1.default.red);
        tintUtil_1.default.tintTerrainObject(fatalTerrainObject, Color_1.default.red);
        lostLife(fatalBody);
    }
});
Bus_1.default.subscribe('Ball.CollisionWithPlusOne', () => {
    lives++;
    Bus_1.default.publish('Lives.Set', lives);
    soundPlayer_1.default.play('gainedLife');
});
Bus_1.default.subscribe('Ball.CollisionWithGround', () => {
    gameWon();
});
exports.default = { initialize };
