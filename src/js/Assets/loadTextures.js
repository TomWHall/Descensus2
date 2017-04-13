"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var texturesPromise = new Promise((resolve, reject) => {
    const loader = new PIXI.loaders.Loader();
    loader.add('ball', 'img/ball.png');
    loader.add('ballReflections', 'img/ball-reflections.png');
    loader.add('girder', 'img/girder.png');
    loader.add('brick', 'img/brick.png');
    loader.add('seesaw', 'img/seesaw.png');
    loader.add('spinner', 'img/spinner.png');
    loader.add('saw', 'img/saw.png');
    loader.add('sawSmall', 'img/saw-small.png');
    loader.add('twoByFour', 'img/two-by-four.png');
    loader.add('clouds', 'img/clouds.jpg');
    loader.add('bar', 'img/bar.png');
    loader.add('helpHand', 'img/help-hand.png');
    loader.add('plus1Life', 'img/plus-1-life.png');
    loader.add('windLeft', 'img/wind-left.png');
    loader.add('windRight', 'img/wind-right.png');
    loader.add('timeBar', 'img/time-bar.png');
    loader.add('timeBarTime', 'img/time-bar-time.png');
    loader.add('ground', 'img/ground.png');
    loader.add('paper', 'img/paper.jpg');
    loader.load((loader, resources) => {
        const textures = {};
        for (var resourceKey in resources) {
            textures[resourceKey] = resources[resourceKey].texture;
        }
        resolve(textures);
    });
});
exports.default = texturesPromise;
