import TerrainObject from './TerrainObject';
import TerrainObjectType from './TerrainObjectType';
import ITextures from '../../Assets/ITextures';
import materials from '../../p2/materials';
import IPixiGraph from '../../Pixi/IPixiGraph';
import p2Util from '../../p2/p2Util';

export default class FreeSaw extends TerrainObject {

  constructor(world: p2.World, pixiGraph: IPixiGraph, textures: ITextures) {
    super(TerrainObjectType.FreeSaw, world, pixiGraph);

    const sawBody = this.sawBody = new p2.Body({
      mass: 0.5
    });
    sawBody.damping = 0.5;
    sawBody.isFatal = true;
    sawBody.allowSleep = false;
    
    const sawSprite = new PIXI.Sprite(textures.sawSmall);

    this.addBody(sawBody, sawSprite, pixiGraph.freeSawContainer);

    const circleShape = new p2.Circle({ radius: 0.75 });
    circleShape.material = materials.saw;
    this.addShape(sawBody, circleShape);
  }

  sawBody: p2.Body;

  activate(position: number[], velocity?: number[]): void {
    super.activate();

    p2Util.updateBodyPosition(this.sawBody, position);

    this.sawBody.angularVelocity = -2;

    if (velocity) {
      this.sawBody.velocity = velocity;
    }
  }
}