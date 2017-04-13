"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const buildNavContainer_1 = require("./buildNavContainer");
const Bus_1 = require("../Bus");
function buildPixiGraph(textures, soundSupported) {
    const stage = new PIXI.Container();
    const background = new PIXI.Sprite(textures.clouds);
    background.scale.x = background.scale.y = 2;
    background.anchor.x = background.anchor.y = 0.5;
    background.visible = false;
    const container = new PIXI.Container();
    const terrainContainer = new PIXI.Container();
    const girderContainer = new PIXI.Container();
    const brickContainer = new PIXI.Container();
    const seesawContainer = new PIXI.Container();
    const spinnerContainer = new PIXI.Container();
    const sawContainer = new PIXI.Container();
    const freeSawContainer = new PIXI.Container();
    const twoByFourContainer = new PIXI.Container();
    const playerBallContainer = new PIXI.Container();
    const ballContainer = new PIXI.Container();
    const ballReflectionsContainer = new PIXI.Container();
    const plus1LifeContainer = new PIXI.Container();
    const windAlpha = 0.75;
    const windLeft = new PIXI.Sprite(textures.windLeft);
    windLeft.anchor.x = windLeft.anchor.y = 0.5;
    windLeft.position.x = 256;
    windLeft.position.y = 567;
    windLeft.alpha = windAlpha;
    windLeft.visible = false;
    const windRight = new PIXI.Sprite(textures.windRight);
    windRight.anchor.x = windRight.anchor.y = 0.5;
    windRight.position.x = 768;
    windRight.position.y = 567;
    windRight.alpha = windAlpha;
    windRight.visible = false;
    const barContainer = new PIXI.Container();
    barContainer.interactive = true;
    barContainer.hitArea = new PIXI.Rectangle(-10000000, -10000000, 20000000, 20000000);
    terrainContainer.addChild(girderContainer);
    terrainContainer.addChild(brickContainer);
    terrainContainer.addChild(seesawContainer);
    terrainContainer.addChild(spinnerContainer);
    terrainContainer.addChild(twoByFourContainer);
    terrainContainer.addChild(ballContainer);
    terrainContainer.addChild(ballReflectionsContainer);
    terrainContainer.addChild(sawContainer);
    terrainContainer.addChild(freeSawContainer);
    terrainContainer.addChild(playerBallContainer);
    terrainContainer.addChild(plus1LifeContainer);
    container.addChild(terrainContainer);
    container.addChild(barContainer);
    const navContainer = buildNavContainer_1.default(textures, soundSupported);
    stage.addChild(background);
    stage.addChild(container);
    stage.addChild(windLeft);
    stage.addChild(windRight);
    stage.addChild(navContainer);
    Bus_1.default.subscribe('IsInvincible.Set', (isInvincible) => {
        sawContainer.alpha = isInvincible ? 0.5 : 1;
        freeSawContainer.alpha = isInvincible ? 0.5 : 1;
    });
    return {
        stage,
        container,
        terrainContainer,
        barContainer,
        girderContainer,
        brickContainer,
        seesawContainer,
        spinnerContainer,
        sawContainer,
        freeSawContainer,
        twoByFourContainer,
        playerBallContainer,
        ballContainer,
        ballReflectionsContainer,
        plus1LifeContainer,
        background,
        windLeft,
        windRight
    };
}
exports.default = buildPixiGraph;
