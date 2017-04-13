"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function blendColors(color1, color2, ratio) {
    var hex = function (num) {
        const hexStr = num.toString(16);
        return (hexStr.length === 1) ? '0' + hexStr : hexStr;
    };
    const color1Hex = hex(color1);
    const color2Hex = hex(color2);
    const r = Math.ceil(parseInt(color1Hex.substring(0, 2), 16) * ratio + parseInt(color2Hex.substring(0, 2), 16) * (1 - ratio));
    const g = Math.ceil(parseInt(color1Hex.substring(2, 4), 16) * ratio + parseInt(color2Hex.substring(2, 4), 16) * (1 - ratio));
    const b = Math.ceil(parseInt(color1Hex.substring(4, 6), 16) * ratio + parseInt(color2Hex.substring(4, 6), 16) * (1 - ratio));
    const blended = hex(r) + hex(g) + hex(b);
    return parseInt(blended, 16);
}
exports.default = blendColors;
