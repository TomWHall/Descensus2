import deviceReadyPromise from './deviceReady';
import ITextures from './Assets/ITextures';
import texturesPromise from './Assets/loadTextures';
import ISounds from './Assets/ISounds';
import soundsPromise from './Assets/loadSounds';
import fontsPromise from './Assets/loadFonts';

import createWorld from './p2/createWorld';
import IPixiGraph from './Pixi/IPixiGraph';
import buildPixiGraph from './Pixi/buildPixiGraph';
import terrainBuilder from './Terrain/terrainBuilder';
import ball from './ball';
import bar from './bar';
import soundPlayer from './Sound/soundPlayer';
import gameLoop from './Game/gameLoop';

deviceReadyPromise
  .then(() => {
    let soundSupported = false;
    soundsPromise.then((sounds: ISounds) => {
      soundSupported = true;
      soundPlayer.initialize(sounds);
    }).catch((reason: any) => {
      // Proceed, sound will be disabled
    })
      .then(() => {
        Promise.all<ITextures, void>([texturesPromise, fontsPromise])
          .then((results: [ITextures, void]) => {
            const textures = results[0] as ITextures;

            const world = createWorld();
            const pixiGraph = buildPixiGraph(textures, soundSupported);

            terrainBuilder.initialize(world, pixiGraph, textures);
            const ballBody = ball.initialize(world, pixiGraph, textures);
            bar.initialize(world, pixiGraph, textures);

            document.getElementById('loading').style.display = 'none';
            document.getElementById('viewport').style.display = 'block';
            gameLoop.initialize(world, pixiGraph, ballBody);
          });
      });
  });