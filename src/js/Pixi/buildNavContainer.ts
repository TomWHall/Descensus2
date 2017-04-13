import Color from '../Color';
import pixiRenderer from './pixiRenderer';
import ITextures from '../Assets/ITextures';
import IGameWonStats from '../Game/IGameWonStats';
import blendColors from '../Utility/blendColors';
import Bus from '../Bus';

interface ITextOptions {
  left?: number;
  right?: number;
  xCenter?: number;

  top?: number;
  bottom?: number;
  yCenter?: number;

  callback?: () => void;

  style?: any;
}

const version = '1.0.0.0';

const width = pixiRenderer.width;
const height = pixiRenderer.height;
const xCenter = width / 2;

const tinyTextStyle = getTextStyle(0.5);
const smallTextStyle = getTextStyle(0.6);
const mediumTextStyle = getTextStyle(0.7);
const largeTextStyle = getTextStyle(0.8);
const hugeTextStyle = getTextStyle(1);

function buildNavContainer(textures: ITextures, soundSupported: boolean): PIXI.Container {
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

  Bus.subscribe('Menu.IntroHidden', (data: any) => {
    navBackground.visible = false;
    topMenu.visible = true;

    Bus.publish('Menu.RequestHide');
  });

  Bus.subscribe('Menu.RequestShow', (data: any) => {
    topMenu.visible = false;
    navBackground.visible = true;
    menuPanel.visible = true;

    Bus.publish('Menu.Shown');
  });

  Bus.subscribe('Menu.RequestHide', (data: any) => {
    menuPanel.visible = false;
    navBackground.visible = false;
    topMenu.visible = true;

    Bus.publish('Menu.Hidden');
  });

  Bus.subscribe('Menu.RequestHelpPanel', (data: any) => {
    menuPanel.visible = false;
    helpPanel.visible = true;
  });

  Bus.subscribe('Menu.RequestAboutPanel', (data: any) => {
    menuPanel.visible = false;
    aboutPanel.visible = true;
  });

  Bus.subscribe('Menu.RequestRestartPanel', (data: any) => {
    menuPanel.visible = false;
    restartPanel.visible = true;
  });

  Bus.subscribe('Menu.PanelHidden', (data: any) => {
    menuPanel.visible = true;
  });

  Bus.subscribe('Menu.RequestRestartGame', (data: any) => {
    menuPanel.visible = false;
    navBackground.visible = false;
    topMenu.visible = true;
  });

  Bus.subscribe('Menu.RequestGameWonPanel', (gameWonStats: IGameWonStats) => {
    topMenu.visible = false;
    gameWonPanel.visible = true;
    gameWonPanel.alpha = 0;
  });

  return navContainer;
}

function getTextStyle(multiplier: number): PIXI.extras.IBitmapTextStyle {
  return {
    font: { name: 'Constantia', size: 128 * multiplier },
    tint: Color.yellow
  };
}

function buildText(text: string, options: ITextOptions): PIXI.extras.BitmapText {
  const style = options.style || smallTextStyle;

  const pixiText = new PIXI.extras.BitmapText(text, style);

  if (options.left) {
    pixiText.position.x = Math.round(options.left);
  } else if (options.right) {
    pixiText.position.x = Math.round(options.right - pixiText.width);
  } else if (options.xCenter) {
    pixiText.position.x = Math.round(options.xCenter - (pixiText.width / 2));
  }

  if (options.top) {
    pixiText.position.y = Math.round(options.top);
  } else if (options.bottom) {
    pixiText.position.y = Math.round(options.bottom - pixiText.height);
  } else if (options.yCenter) {
    pixiText.position.y = Math.round(options.yCenter - (pixiText.height / 2));
  }

  if (options.callback) {
    pixiText.interactive = true;
    pixiText.buttonMode = true;

    const highlight = (e: any) => {
      const text = <PIXI.extras.BitmapText>e.currentTarget;
      text.tint = Color.orange;
    };

    const unhighlight = (e: any) => {
      const text = <PIXI.extras.BitmapText>e.currentTarget;
      text.tint = Color.yellow;
    };

    pixiText
      .on('mousedown', (e: any) => {
        highlight(e);
      })
      .on('touchstart', (e: any) => {
        highlight(e);
      });

    pixiText
      .on('mouseup', (e: any) => {
        unhighlight(e);
        options.callback();
      })
      .on('mouseupoutside', (e: any) => {
        unhighlight(e);
      })
      .on('touchend', (e: any) => {
        unhighlight(e);
        options.callback();
      })
      .on('touchendoutside', (e: any) => {
        unhighlight(e);
      });
  }

  return pixiText;
}

function buildHelpContent(textures: ITextures): PIXI.Container {
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

function buildNavBackground(textures: ITextures): PIXI.Sprite {
  const backgroundSprite = new PIXI.Sprite(textures.clouds);
  backgroundSprite.scale.x = backgroundSprite.scale.y = 2;
  backgroundSprite.anchor.x = backgroundSprite.anchor.y = 0.5;
  backgroundSprite.alpha = 0.8;

  return backgroundSprite;
}

function buildTopMenu(textures: ITextures): PIXI.Container {
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

  Bus.subscribe('Height.Set', (data: number) => {
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

  Bus.subscribe('Lives.Set', (data: number) => {
    lives.text = data.toString();
  });

  const menu = buildText('Menu', {
    right: width - 32,
    top: 16,
    callback: () => {
      Bus.publish('Menu.RequestShow');
    }
  });
  topMenu.addChild(menu);

  const timeRemainingLabel = buildText(getTimeRemainingText(900), {
    left: 32,
    top: 106,
    style: tinyTextStyle
  });
  topMenu.addChild(timeRemainingLabel);

  Bus.subscribe('NextCheckpointHeight.Set', (height: number) => {
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

  Bus.subscribe('TimeRemainingQuotient.Set', (timeRemainingQuotient: number) => {
    timeBarTime.width = timeRemainingQuotient * 596;
    timeBarTime.tint = blendColors(Color.yellow, Color.red, timeRemainingQuotient);

    if (timeRemainingQuotient <= 0) {
      timeRemainingLabel.tint = Color.red;
    } else {
      timeRemainingLabel.tint = Color.yellow;
    }
  });

  return topMenu;
}

function buildIntroPanel(textures: ITextures): PIXI.Container {
  const introPanel = new PIXI.Container();

  introPanel.addChild(buildHelpContent(textures));

  introPanel.addChild(buildText('Start >', {
    xCenter: xCenter,
    yCenter: height * 0.92,
    style: hugeTextStyle,
    callback: () => {
      introPanel.visible = false;
      Bus.publish('Menu.IntroHidden');
    }
  }));

  return introPanel;
}

function getHeightText(height: number) {
  return height + 'm';
}

function getTimeRemainingText(height: number) {
  return 'Time to ' + height.toString() + 'm:';
}

function getSoundText(soundEnabled: boolean): string {
  return 'Sound ' + (soundEnabled ? 'on' : 'off');
}

function buildMenuPanel(soundSupported: boolean): PIXI.Container {
  const menuPanel = new PIXI.Container();

  const verticalSpace = height / 6;
  const textStyle = largeTextStyle;

  const soundStatus = buildText(getSoundText(soundSupported), {
    xCenter: xCenter,
    yCenter: verticalSpace,
    style: textStyle,
    callback: soundSupported
      ? () => { Bus.publish('Sound.Toggle'); }
      : null
  });

  if (soundSupported) {
    Bus.subscribe('Sound.Enable', (data: boolean) => {
      soundStatus.text = getSoundText(data);
    });
  } else {
    soundStatus.alpha = 0.5;
  }
  menuPanel.addChild(soundStatus);

  menuPanel.addChild(buildText('Help', {
    xCenter: xCenter,
    yCenter: verticalSpace * 2,
    style: textStyle,
    callback: () => {
      Bus.publish('Menu.RequestHelpPanel');
    }
  }));

  menuPanel.addChild(buildText('About', {
    xCenter: xCenter,
    yCenter: verticalSpace * 3,
    style: textStyle,
    callback: () => {
      Bus.publish('Menu.RequestAboutPanel');
    }
  }));

  menuPanel.addChild(buildText('Restart', {
    xCenter: xCenter,
    yCenter: verticalSpace * 4,
    style: textStyle,
    callback: () => {
      Bus.publish('Menu.RequestRestartPanel');
    }
  }));

  menuPanel.addChild(buildText('Return to game', {
    xCenter: xCenter,
    yCenter: verticalSpace * 5,
    style: textStyle,
    callback: () => {
      Bus.publish('Menu.RequestHide');
    }
  }));

  menuPanel.visible = false;
  return menuPanel;
}

function buildBackButton(panel: PIXI.Container): PIXI.extras.BitmapText {
  return buildText('< Back', {
    xCenter: xCenter,
    yCenter: height * 0.92,
    style: hugeTextStyle,
    callback: () => {
      panel.visible = false;
      Bus.publish('Menu.PanelHidden');
    }
  });
}

function buildHelpPanel(textures: ITextures): PIXI.Container {
  const helpPanel = new PIXI.Container();

  helpPanel.addChild(buildHelpContent(textures));
  helpPanel.addChild(buildBackButton(helpPanel));

  helpPanel.visible = false;
  return helpPanel;
}

function buildAboutPanel(): PIXI.Container {
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

function buildRestartPanel(): PIXI.Container {
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
      Bus.publish('Menu.PanelHidden');
    },
    style: textStyle
  }));

  restartPanel.addChild(buildText('Yes', {
    xCenter: (width * (2 / 3)),
    yCenter: (height * 0.75),
    callback: () => {
      restartPanel.visible = false;
      Bus.publish('Menu.RequestRestartGame');
    },
    style: textStyle
  }));

  restartPanel.visible = false;
  return restartPanel;
}

function buildGameWonPanel(textures: ITextures): PIXI.Container {
  const gameWonPanel = new PIXI.Container();

  gameWonPanel.addChild(new PIXI.Sprite(textures.paper));

  function getTimeText(time: number): string {
    const totalSeconds = time / 1000;
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = Math.round(totalSeconds % 60);

    return 'with a time of ' + minutes.toString() + ':' + (seconds < 10 ? '0' : '') + seconds.toString();
  }

  function getLivesText(lives: number): string {
    return 'and with ' + lives.toString() + ' ' + (lives === 1 ? 'life' : 'lives') + ' remaining';
  }

  gameWonPanel.addChild(buildText('This certifies', { xCenter: xCenter, yCenter: 400, style: mediumTextStyle }));
  gameWonPanel.addChild(buildText('that you have completed', { xCenter: xCenter, yCenter: 500, style: mediumTextStyle }));
  gameWonPanel.addChild(buildText('Descensus 2', { xCenter: xCenter, yCenter: 700, style: hugeTextStyle }));

  const timeText = buildText(getTimeText(0), { xCenter: xCenter, yCenter: 900, style: mediumTextStyle });
  gameWonPanel.addChild(timeText);

  const livesText = buildText(getLivesText(10), { xCenter: xCenter, yCenter: 1000, style: mediumTextStyle });
  gameWonPanel.addChild(livesText);

  Bus.subscribe('Menu.RequestGameWonPanel', (gameWonStats: IGameWonStats) => {
    timeText.text = getTimeText(gameWonStats.time);
    timeText.position.x = Math.round(xCenter - (timeText.width / 2));

    livesText.text = getLivesText(gameWonStats.lives);
    livesText.position.x = Math.round(xCenter - (livesText.width / 2));
  });

  Bus.subscribe('Menu.IncrementGameWonPanelAlpha', (deltaTime: number) => {
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
      Bus.publish('Menu.RequestRestartGame');
    }
  }));

  gameWonPanel.visible = false;
  return gameWonPanel;
}

export default buildNavContainer;