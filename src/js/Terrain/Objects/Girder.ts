import TerrainObjectType from './TerrainObjectType';
import TerrainObject from './TerrainObject';
import materials from '../../p2/materials';
import ITextures from '../../Assets/ITextures';
import IPixiGraph from '../../Pixi/IPixiGraph';
import p2Util from '../../p2/p2Util';

export default class Girder extends TerrainObject {

  constructor(world: p2.World, pixiGraph: IPixiGraph, textures: ITextures) {
    super(TerrainObjectType.Girder, world, pixiGraph);

    const girderBody = new p2.Body({
      mass: 30
    });
    girderBody.gravityScale = 0;

    const girderSprite = new PIXI.Sprite(textures.girder);

    this.addBody(girderBody, girderSprite, pixiGraph.girderContainer);

    const boxShape = new p2.Box({ width: 4, height: 1 });
    boxShape.material = materials.wood;

    this.addShape(girderBody, boxShape);
  }

  activate(position: number[], angle: number): void {
    super.activate();

    p2Util.updateBodyPosition(this.bodies[0], position, angle);
  }
}