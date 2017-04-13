"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var GameState;
(function (GameState) {
    GameState[GameState["PageHidden"] = 0] = "PageHidden";
    GameState[GameState["Intro"] = 1] = "Intro";
    GameState[GameState["Active"] = 2] = "Active";
    GameState[GameState["Dying"] = 3] = "Dying";
    GameState[GameState["Menu"] = 4] = "Menu";
    GameState[GameState["Won"] = 5] = "Won";
    GameState[GameState["Lost"] = 6] = "Lost";
})(GameState || (GameState = {}));
exports.default = GameState;
