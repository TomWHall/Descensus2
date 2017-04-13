import TerrainObjectType from './TerrainObjectType';
import TerrainObject from './TerrainObject';
import materials from '../../p2/materials';
import ITextures from '../../Assets/ITextures';
import IPixiGraph from '../../Pixi/IPixiGraph';
import p2Util from '../../p2/p2Util';

export default class Brick extends TerrainObject {

  constructor(world: p2.World, pixiGraph: IPixiGraph, textures: ITextures) {
    super(TerrainObjectType.Brick, world, pixiGraph);

    const brickBody = new p2.Body({
      mass: 1
    });
    brickBody.allowSleep = false;

    const brickSprite = new PIXI.Sprite(textures.brick);

    this.addBody(brickBody, brickSprite, pixiGraph.brickContainer);

    const boxShape = new p2.Box({ width: 2, height: 0.625 });
    boxShape.material = materials.brick;

    this.addShape(brickBody, boxShape);
  }

  activate(position: number[], angle: number): void {
    super.activate();

    p2Util.updateBodyPosition(this.bodies[0], position, angle);
  }
}