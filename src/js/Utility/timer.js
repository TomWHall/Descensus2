"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Bus_1 = require("../Bus");
const timeLogs = {};
let loggingInitialized = false;
function time(key, func) {
    let timeLog = timeLogs[key];
    if (!timeLog) {
        timeLog = timeLogs[key] = { startTime: performance.now(), iterations: 0, totalTime: 0 };
    }
    if (!loggingInitialized) {
        loggingInitialized = true;
        const updateIntervalMs = 2000;
        window.setInterval(() => {
            const keys = Object.keys(timeLogs);
            let output = '';
            keys.forEach((key) => {
                const timeLog = timeLogs[key];
                //const averageTime = Math.round(timeLog.totalTime / timeLog.iterations);
                const iterationsPerSecond = Math.round(timeLog.iterations / ((performance.now() - timeLog.startTime) / 1000));
                output += key + ' ' + iterationsPerSecond + '   ';
            });
            Bus_1.default.publish('Log', output);
        }, updateIntervalMs);
    }
    const timeStart = performance.now();
    func();
    const timeEnd = performance.now();
    const duration = timeEnd - timeStart;
    timeLog.iterations++;
    timeLog.totalTime += duration;
}
exports.default = { time };
