"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const deviceReady_1 = require("./deviceReady");
const loadTextures_1 = require("./Assets/loadTextures");
const loadSounds_1 = require("./Assets/loadSounds");
const loadFonts_1 = require("./Assets/loadFonts");
const createWorld_1 = require("./p2/createWorld");
const buildPixiGraph_1 = require("./Pixi/buildPixiGraph");
const terrainBuilder_1 = require("./Terrain/terrainBuilder");
const ball_1 = require("./ball");
const bar_1 = require("./bar");
const soundPlayer_1 = require("./Sound/soundPlayer");
const gameLoop_1 = require("./Game/gameLoop");
deviceReady_1.default
    .then(() => {
    let soundSupported = false;
    loadSounds_1.default.then((sounds) => {
        soundSupported = true;
        soundPlayer_1.default.initialize(sounds);
    }).catch((reason) => {
        // Proceed, sound will be disabled
    })
        .then(() => {
        Promise.all([loadTextures_1.default, loadFonts_1.default])
            .then((results) => {
            const textures = results[0];
            const world = createWorld_1.default();
            const pixiGraph = buildPixiGraph_1.default(textures, soundSupported);
            terrainBuilder_1.default.initialize(world, pixiGraph, textures);
            const ballBody = ball_1.default.initialize(world, pixiGraph, textures);
            bar_1.default.initialize(world, pixiGraph, textures);
            gameLoop_1.default.initialize(world, pixiGraph, ballBody);
        });
    });
});
