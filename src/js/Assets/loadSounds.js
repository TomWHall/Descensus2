"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var soundsPromise = new Promise((resolve, reject) => {
    if (!window.cordova) {
        reject('Web context, no sound');
        return;
    }
    const audio = document.createElement('audio');
    const supportsMp3 = !!(audio.canPlayType && audio.canPlayType('audio/mpeg;').replace(/no/, ''));
    const supportsOgg = !!(audio.canPlayType && audio.canPlayType('audio/ogg; codecs="vorbis"').replace(/no/, ''));
    if (!supportsMp3 && !supportsOgg) {
        reject('Neither MP3 nor OGG supported');
        return;
    }
    const soundsCount = 1;
    let soundsLoadedCount = 0;
    const extension = supportsMp3 ? '.mp3' : '.ogg';
    const sounds = {
        saw: loadSound('saw'),
        checkpoint: loadSound('checkpoint'),
        lostLife: loadSound('lost-life'),
        gainedLife: loadSound('gained-life'),
        clock: loadSound('clock'),
        alarm: loadSound('alarm'),
        won: loadSound('won'),
        lost: loadSound('lost')
    };
    function loadSound(fileName) {
        const audio = new Audio();
        audio.src = 'sound/' + fileName + extension;
        audio.addEventListener('canplaythrough', function () {
            soundsLoadedCount++;
            if (soundsLoadedCount === soundsCount) {
                resolve(sounds);
            }
        });
        audio.load();
        return audio;
    }
});
exports.default = soundsPromise;
