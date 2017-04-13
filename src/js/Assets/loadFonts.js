"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fontsPromise = new Promise((resolve, reject) => {
    const loader = new PIXI.loaders.Loader();
    loader.add('Constantia', 'fonts/Constantia/Constantia.fnt');
    loader.load((loader, resources) => {
        resolve();
    });
});
exports.default = fontsPromise;
