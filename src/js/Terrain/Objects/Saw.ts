import TerrainObject from './TerrainObject';
import TerrainObjectType from './TerrainObjectType';
import ITextures from '../../Assets/ITextures';
import materials from '../../p2/materials';
import IPixiGraph from '../../Pixi/IPixiGraph';
import terrainObjectKit from './terrainObjectKit';
import p2Util from '../../p2/p2Util';

export default class Saw extends TerrainObject {

  constructor(world: p2.World, pixiGraph: IPixiGraph, textures: ITextures) {
    super(TerrainObjectType.Saw, world, pixiGraph);

    const sawBody = this.sawBody = new p2.Body({
      mass: 1
    });
    sawBody.gravityScale = 0;
    sawBody.isFatal = true;
    
    const sawSprite = new PIXI.Sprite(textures.saw);

    this.addBody(sawBody, sawSprite, pixiGraph.sawContainer);

    const circleShape = new p2.Circle({ radius: 1 });
    circleShape.material = materials.saw;
    this.addShape(sawBody, circleShape);

    const anchorBody = this.anchorBody = terrainObjectKit.getAnchor(sawBody);
    this.addBodyHidden(anchorBody);

    const anchorConstraint = terrainObjectKit.getAnchorConstraint(sawBody, anchorBody, null, true);
    anchorConstraint.setMotorSpeed(this.speed);
    this.addConstraint(anchorConstraint);
  }

  speed: number = -6;
  
  sawBody: p2.Body;
  anchorBody: p2.Body;

  activate(position: number[]): void {
    super.activate();

    p2Util.updateBodyPosition(this.sawBody, position);
    p2Util.updateBodyPosition(this.anchorBody, position);
  }
}