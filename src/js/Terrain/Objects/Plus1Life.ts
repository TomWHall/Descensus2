import TerrainObject from './TerrainObject';
import TerrainObjectType from './TerrainObjectType';
import ITextures from '../../Assets/ITextures';
import materials from '../../p2/materials';
import IPixiGraph from '../../Pixi/IPixiGraph';
import p2Util from '../../p2/p2Util';

export default class Plus1Life extends TerrainObject {

  constructor(world: p2.World, pixiGraph: IPixiGraph, textures: ITextures) {
    super(TerrainObjectType.Plus1Life, world, pixiGraph);

    const plus1LifeBody = this.plus1LifeBody = new p2.Body({
      mass: 0.5
    });
    plus1LifeBody.allowSleep = false;
    plus1LifeBody.damping = 0.8;

    const plus1LifeSprite = new PIXI.Sprite(textures.plus1Life);

    this.addBody(plus1LifeBody, plus1LifeSprite, pixiGraph.plus1LifeContainer);

    const boxShape = new p2.Box({ width: 2, height: 1.203125 });
    boxShape.material = materials.wood;
    this.addShape(plus1LifeBody, boxShape);
  }

  plus1LifeBody: p2.Body;

  activate(position: number[]): void {
    super.activate();

    p2Util.updateBodyPosition(this.plus1LifeBody, position);
  }
}