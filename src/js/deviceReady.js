"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var deviceReadyPromise = new Promise((resolve, reject) => {
    if (window.cordova) {
        document.addEventListener('deviceready', () => {
            resolve();
        }, false);
    }
    else {
        resolve();
    }
});
exports.default = deviceReadyPromise;
