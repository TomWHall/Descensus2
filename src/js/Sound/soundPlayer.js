"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Bus_1 = require("../Bus");
let sounds = null;
let soundSupported = false;
let soundOn = false;
Bus_1.default.subscribe('Sound.Toggle', () => {
    toggle();
});
function initialize(snds) {
    sounds = snds;
    soundSupported = true;
    soundOn = true;
    for (let name in sounds) {
        const audio = sounds[name];
        audio.hackPlaying = false;
        audio.hackPaused = true;
        audio.onplaying = () => {
            audio.hackPlaying = true;
            audio.hackPaused = false;
        };
        audio.onpause = () => {
            audio.hackPlaying = false;
            audio.hackPaused = true;
        };
    }
}
function play(name, resuming = false) {
    if (!soundSupported || !soundOn)
        return;
    const audio = sounds[name];
    if (!resuming) {
        audio.currentTime = 0; // Restart if already playing, no overlaps
    }
    if (audio.hackPaused) {
        if (audio === sounds.clock) {
            audio.loop = true;
        }
        audio.play();
    }
}
function pause(name) {
    if (!soundSupported)
        return;
    const audio = sounds[name];
    if (!audio.hackPaused) {
        audio.pause();
    }
    ;
}
function stop(name) {
    if (!soundSupported)
        return;
    const audio = sounds[name];
    audio.pause();
    audio.currentTime = 0;
}
function pauseAll() {
    for (let name in sounds) {
        pause(name);
    }
}
function resumeAll() {
    for (let name in sounds) {
        const audio = sounds[name];
        if (audio.paused && audio.currentTime > 0 && !audio.ended) {
            play(name, true);
        }
    }
}
function stopAll() {
    for (let name in sounds) {
        stop(name);
    }
}
function toggle() {
    if (!soundSupported)
        return;
    soundOn = !soundOn;
    Bus_1.default.publish('Sound.Enable', soundOn);
}
exports.default = { initialize, play, pause, stop, pauseAll, resumeAll, stopAll, toggle };
