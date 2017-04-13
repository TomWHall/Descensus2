"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Color_1 = require("../Color");
const pixiRenderer_1 = require("./pixiRenderer");
const blendColors_1 = require("../Utility/blendColors");
const Bus_1 = require("../Bus");
const version = '1.0.0.0';
const width = pixiRenderer_1.default.width;
const height = pixiRenderer_1.default.height;
const xCenter = width / 2;
const tinyTextStyle = getTextStyle(0.5);
const smallTextStyle = getTextStyle(0.6);
const mediumTextStyle = getTextStyle(0.7);
const largeTextStyle = getTextStyle(0.8);
const hugeTextStyle = getTextStyle(1);
function buildNavContainer(textures, soundSupported) {
    const navContainer = new PIXI.Container;
    const navBackground = buildNavBackground(textures);
    const introPanel = buildIntroPanel(textures);
    const menuPanel = buildMenuPanel(soundSupported);
    const helpPanel = buildHelpPanel(textures);
    const aboutPanel = buildAboutPanel();
    const restartPanel = buildRestartPanel();
    const topMenu = buildTopMenu(textures);
    const gameWonPanel = buildGameWonPanel(textures);
    navContainer.addChild(navBackground);
    navContainer.addChild(topMenu);
    navContainer.addChild(menuPanel);
    navContainer.addChild(introPanel);
    navContainer.addChild(helpPanel);
    navContainer.addChild(aboutPanel);
    navContainer.addChild(restartPanel);
    navContainer.addChild(gameWonPanel);
    Bus_1.default.subscribe('Menu.IntroHidden', (data) => {
        navBackground.visible = false;
        topMenu.visible = true;
        Bus_1.default.publish('Menu.RequestHide');
    });
    Bus_1.default.subscribe('Menu.RequestShow', (data) => {
        topMenu.visible = false;
        navBackground.visible = true;
        menuPanel.visible = true;
        Bus_1.default.publish('Menu.Shown');
    });
    Bus_1.default.subscribe('Menu.RequestHide', (data) => {
        menuPanel.visible = false;
        navBackground.visible = false;
        topMenu.visible = true;
        Bus_1.default.publish('Menu.Hidden');
    });
    Bus_1.default.subscribe('Menu.RequestHelpPanel', (data) => {
        menuPanel.visible = false;
        helpPanel.visible = true;
    });
    Bus_1.default.subscribe('Menu.RequestAboutPanel', (data) => {
        menuPanel.visible = false;
        aboutPanel.visible = true;
    });
    Bus_1.default.subscribe('Menu.RequestRestartPanel', (data) => {
        menuPanel.visible = false;
        restartPanel.visible = true;
    });
    Bus_1.default.subscribe('Menu.PanelHidden', (data) => {
        menuPanel.visible = true;
    });
    Bus_1.default.subscribe('Menu.RequestRestartGame', (data) => {
        menuPanel.visible = false;
        navBackground.visible = false;
        topMenu.visible = true;
    });
    Bus_1.default.subscribe('Menu.RequestGameWonPanel', (gameWonStats) => {
        topMenu.visible = false;
        gameWonPanel.visible = true;
        gameWonPanel.alpha = 0;
    });
    return navContainer;
}
function getTextStyle(multiplier) {
    return {
        font: { name: 'Constantia', size: 128 * multiplier },
        tint: Color_1.default.yellow
    };
}
function buildText(text, options) {
    const style = options.style || smallTextStyle;
    const pixiText = new PIXI.extras.BitmapText(text, style);
    if (options.left) {
        pixiText.position.x = Math.round(options.left);
    }
    else if (options.right) {
        pixiText.position.x = Math.round(options.right - pixiText.width);
    }
    else if (options.xCenter) {
        pixiText.position.x = Math.round(options.xCenter - (pixiText.width / 2));
    }
    if (options.top) {
        pixiText.position.y = Math.round(options.top);
    }
    else if (options.bottom) {
        pixiText.position.y = Math.round(options.bottom - pixiText.height);
    }
    else if (options.yCenter) {
        pixiText.position.y = Math.round(options.yCenter - (pixiText.height / 2));
    }
    if (options.callback) {
        pixiText.interactive = true;
        pixiText.buttonMode = true;
        const highlight = (e) => {
            const text = e.currentTarget;
            text.tint = Color_1.default.orange;
        };
        const unhighlight = (e) => {
            const text = e.currentTarget;
            text.tint = Color_1.default.yellow;
        };
        pixiText
            .on('mousedown', (e) => {
            highlight(e);
        })
            .on('touchstart', (e) => {
            highlight(e);
        });
        pixiText
            .on('mouseup', (e) => {
            unhighlight(e);
            options.callback();
        })
            .on('mouseupoutside', (e) => {
            unhighlight(e);
        })
            .on('touchend', (e) => {
            unhighlight(e);
            options.callback();
        })
            .on('touchendoutside', (e) => {
            unhighlight(e);
        });
    }
    return pixiText;
}
function buildHelpContent(textures) {
    const container = new PIXI.Container;
    const textStyle = mediumTextStyle;
    const text1 = buildText('Guide the ball to the ground', { xCenter: xCenter, yCenter: 320, style: textStyle });
    container.addChild(text1);
    const text2 = buildText('by drawing bars, like this:', { xCenter: xCenter, yCenter: 420, style: textStyle });
    container.addChild(text2);
    const handSprite = new PIXI.Sprite(textures.helpHand);
    handSprite.anchor.x = handSprite.anchor.y = 0.5;
    handSprite.position.x = 512;
    handSprite.position.y = 665;
    container.addChild(handSprite);
    const text3 = buildText('Avoid saws:', { xCenter: xCenter, yCenter: 850, style: textStyle });
    container.addChild(text3);
    const sawSprite = new PIXI.Sprite(textures.saw);
    sawSprite.anchor.x = sawSprite.anchor.y = 0.5;
    sawSprite.position.x = 512;
    sawSprite.position.y = 1000;
    container.addChild(sawSprite);
    const text4 = buildText('Collect extra lives:', { xCenter: xCenter, yCenter: 1150, style: textStyle });
    container.addChild(text4);
    const plus1LifeSprite = new PIXI.Sprite(textures.plus1Life);
    plus1LifeSprite.anchor.x = plus1LifeSprite.anchor.y = 0.5;
    plus1LifeSprite.position.x = 512;
    plus1LifeSprite.position.y = 1280;
    container.addChild(plus1LifeSprite);
    const text5 = buildText('Beat the timer.', { xCenter: xCenter, yCenter: 1420, style: textStyle });
    container.addChild(text5);
    return container;
}
function buildNavBackground(textures) {
    const backgroundSprite = new PIXI.Sprite(textures.clouds);
    backgroundSprite.scale.x = backgroundSprite.scale.y = 2;
    backgroundSprite.anchor.x = backgroundSprite.anchor.y = 0.5;
    backgroundSprite.alpha = 0.8;
    return backgroundSprite;
}
function buildTopMenu(textures) {
    const topMenu = new PIXI.Container();
    topMenu.visible = false;
    const heightLabel = buildText('Height', {
        left: 32,
        top: 16
    });
    topMenu.addChild(heightLabel);
    const height = buildText(getHeightText(1000), {
        left: heightLabel.position.x + heightLabel.width + 16,
        top: 16
    });
    topMenu.addChild(height);
    Bus_1.default.subscribe('Height.Set', (data) => {
        height.text = getHeightText(data);
    });
    const livesDummy = buildText('Lives: 9:', { left: 0, top: 0 });
    const livesLabel = buildText('Lives:', {
        left: (width * 0.6) - (livesDummy.width / 2),
        top: 16
    });
    topMenu.addChild(livesLabel);
    const lives = buildText((10).toString(), {
        left: livesLabel.position.x + livesLabel.width + 16,
        top: 16
    });
    topMenu.addChild(lives);
    Bus_1.default.subscribe('Lives.Set', (data) => {
        lives.text = data.toString();
    });
    const menu = buildText('Menu', {
        right: width - 32,
        top: 16,
        callback: () => {
            Bus_1.default.publish('Menu.RequestShow');
        }
    });
    topMenu.addChild(menu);
    const timeRemainingLabel = buildText(getTimeRemainingText(900), {
        left: 32,
        top: 106,
        style: tinyTextStyle
    });
    topMenu.addChild(timeRemainingLabel);
    Bus_1.default.subscribe('NextCheckpointHeight.Set', (height) => {
        timeRemainingLabel.text = getTimeRemainingText(height);
    });
    const timeBar = new PIXI.Sprite(textures.timeBar);
    timeBar.position.x = 392;
    timeBar.position.y = 128;
    topMenu.addChild(timeBar);
    const timeBarTime = new PIXI.Sprite(textures.timeBarTime);
    timeBarTime.position.x = 394;
    timeBarTime.position.y = 130;
    timeBarTime.alpha = 0.85;
    topMenu.addChild(timeBarTime);
    Bus_1.default.subscribe('TimeRemainingQuotient.Set', (timeRemainingQuotient) => {
        timeBarTime.width = timeRemainingQuotient * 596;
        timeBarTime.tint = blendColors_1.default(Color_1.default.yellow, Color_1.default.red, timeRemainingQuotient);
        if (timeRemainingQuotient <= 0) {
            timeRemainingLabel.tint = Color_1.default.red;
        }
        else {
            timeRemainingLabel.tint = Color_1.default.yellow;
        }
    });
    return topMenu;
}
function buildIntroPanel(textures) {
    const introPanel = new PIXI.Container();
    introPanel.addChild(buildHelpContent(textures));
    introPanel.addChild(buildText('Start >', {
        xCenter: xCenter,
        yCenter: height * 0.92,
        style: hugeTextStyle,
        callback: () => {
            introPanel.visible = false;
            Bus_1.default.publish('Menu.IntroHidden');
        }
    }));
    return introPanel;
}
function getHeightText(height) {
    return height + 'm';
}
function getTimeRemainingText(height) {
    return 'Time to ' + height.toString() + 'm:';
}
function getSoundText(soundEnabled) {
    return 'Sound ' + (soundEnabled ? 'on' : 'off');
}
function buildMenuPanel(soundSupported) {
    const menuPanel = new PIXI.Container();
    const verticalSpace = height / 6;
    const textStyle = largeTextStyle;
    const soundStatus = buildText(getSoundText(soundSupported), {
        xCenter: xCenter,
        yCenter: verticalSpace,
        style: textStyle,
        callback: soundSupported
            ? () => { Bus_1.default.publish('Sound.Toggle'); }
            : null
    });
    if (soundSupported) {
        Bus_1.default.subscribe('Sound.Enable', (data) => {
            soundStatus.text = getSoundText(data);
        });
    }
    else {
        soundStatus.alpha = 0.5;
    }
    menuPanel.addChild(soundStatus);
    menuPanel.addChild(buildText('Help', {
        xCenter: xCenter,
        yCenter: verticalSpace * 2,
        style: textStyle,
        callback: () => {
            Bus_1.default.publish('Menu.RequestHelpPanel');
        }
    }));
    menuPanel.addChild(buildText('About', {
        xCenter: xCenter,
        yCenter: verticalSpace * 3,
        style: textStyle,
        callback: () => {
            Bus_1.default.publish('Menu.RequestAboutPanel');
        }
    }));
    menuPanel.addChild(buildText('Restart', {
        xCenter: xCenter,
        yCenter: verticalSpace * 4,
        style: textStyle,
        callback: () => {
            Bus_1.default.publish('Menu.RequestRestartPanel');
        }
    }));
    menuPanel.addChild(buildText('Return to game', {
        xCenter: xCenter,
        yCenter: verticalSpace * 5,
        style: textStyle,
        callback: () => {
            Bus_1.default.publish('Menu.RequestHide');
        }
    }));
    menuPanel.visible = false;
    return menuPanel;
}
function buildBackButton(panel) {
    return buildText('< Back', {
        xCenter: xCenter,
        yCenter: height * 0.92,
        style: hugeTextStyle,
        callback: () => {
            panel.visible = false;
            Bus_1.default.publish('Menu.PanelHidden');
        }
    });
}
function buildHelpPanel(textures) {
    const helpPanel = new PIXI.Container();
    helpPanel.addChild(buildHelpContent(textures));
    helpPanel.addChild(buildBackButton(helpPanel));
    helpPanel.visible = false;
    return helpPanel;
}
function buildAboutPanel() {
    const aboutPanel = new PIXI.Container();
    const text1 = buildText('Descensus 2', { xCenter: xCenter, yCenter: 600, style: largeTextStyle });
    aboutPanel.addChild(text1);
    const text2 = buildText('v1.0.2', { xCenter: xCenter, yCenter: 700, style: mediumTextStyle });
    aboutPanel.addChild(text2);
    const text3 = buildText('By Tom W Hall', { xCenter: xCenter, yCenter: 900 });
    aboutPanel.addChild(text3);
    const text4 = buildText('Boolean Operations Limited', { xCenter: xCenter, yCenter: 1000 });
    aboutPanel.addChild(text4);
    const text5 = buildText('http://booleanoperations.com', { xCenter: xCenter, yCenter: 1100 });
    aboutPanel.addChild(text5);
    aboutPanel.addChild(buildBackButton(aboutPanel));
    aboutPanel.visible = false;
    return aboutPanel;
}
function buildRestartPanel() {
    const textStyle = largeTextStyle;
    const restartPanel = new PIXI.Container();
    restartPanel.addChild(buildText('Restart game?', {
        xCenter: xCenter,
        yCenter: height * 0.45,
        style: textStyle
    }));
    restartPanel.addChild(buildText('No', {
        xCenter: (width / 3),
        yCenter: (height * 0.75),
        callback: () => {
            restartPanel.visible = false;
            Bus_1.default.publish('Menu.PanelHidden');
        },
        style: textStyle
    }));
    restartPanel.addChild(buildText('Yes', {
        xCenter: (width * (2 / 3)),
        yCenter: (height * 0.75),
        callback: () => {
            restartPanel.visible = false;
            Bus_1.default.publish('Menu.RequestRestartGame');
        },
        style: textStyle
    }));
    restartPanel.visible = false;
    return restartPanel;
}
function buildGameWonPanel(textures) {
    const gameWonPanel = new PIXI.Container();
    gameWonPanel.addChild(new PIXI.Sprite(textures.paper));
    function getTimeText(time) {
        const totalSeconds = time / 1000;
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = Math.round(totalSeconds % 60);
        return 'with a time of ' + minutes.toString() + ':' + (seconds < 10 ? '0' : '') + seconds.toString();
    }
    function getLivesText(lives) {
        return 'and with ' + lives.toString() + ' ' + (lives === 1 ? 'life' : 'lives') + ' remaining';
    }
    gameWonPanel.addChild(buildText('This certifies', { xCenter: xCenter, yCenter: 400, style: mediumTextStyle }));
    gameWonPanel.addChild(buildText('that you have completed', { xCenter: xCenter, yCenter: 500, style: mediumTextStyle }));
    gameWonPanel.addChild(buildText('Descensus 2', { xCenter: xCenter, yCenter: 700, style: hugeTextStyle }));
    const timeText = buildText(getTimeText(0), { xCenter: xCenter, yCenter: 900, style: mediumTextStyle });
    gameWonPanel.addChild(timeText);
    const livesText = buildText(getLivesText(10), { xCenter: xCenter, yCenter: 1000, style: mediumTextStyle });
    gameWonPanel.addChild(livesText);
    Bus_1.default.subscribe('Menu.RequestGameWonPanel', (gameWonStats) => {
        timeText.text = getTimeText(gameWonStats.time);
        timeText.position.x = Math.round(xCenter - (timeText.width / 2));
        livesText.text = getLivesText(gameWonStats.lives);
        livesText.position.x = Math.round(xCenter - (livesText.width / 2));
    });
    Bus_1.default.subscribe('Menu.IncrementGameWonPanelAlpha', (deltaTime) => {
        const increments = (1000 / deltaTime) * 5;
        const alphaDelta = 1 / increments;
        gameWonPanel.alpha = Math.min(1, gameWonPanel.alpha + alphaDelta);
    });
    gameWonPanel.addChild(buildText('New Game >', {
        xCenter: xCenter,
        yCenter: height * 0.92,
        style: largeTextStyle,
        callback: () => {
            gameWonPanel.visible = false;
            Bus_1.default.publish('Menu.RequestRestartGame');
        }
    }));
    gameWonPanel.visible = false;
    return gameWonPanel;
}
exports.default = buildNavContainer;
