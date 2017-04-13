import TerrainObject from './TerrainObject';
import TerrainObjectType from './TerrainObjectType';
import ITextures from '../../Assets/ITextures';
import materials from '../../p2/materials';
import IPixiGraph from '../../Pixi/IPixiGraph';
import terrainObjectKit from './terrainObjectKit';
import p2Util from '../../p2/p2Util';

export default class Seesaw extends TerrainObject {

  constructor(world: p2.World, pixiGraph: IPixiGraph, textures: ITextures) {
    super(TerrainObjectType.Seesaw, world, pixiGraph);

    const seesawBody = new p2.Body({
      mass: 3
    });
    seesawBody.gravityScale = 0;

    const seesawSprite = new PIXI.Sprite(textures.seesaw);

    this.addBody(seesawBody, seesawSprite, pixiGraph.seesawContainer);

    const boxShape = new p2.Box({ width: 6, height: 1 });
    boxShape.material = materials.wood;
    this.addShape(seesawBody, boxShape);

    const anchorBody = terrainObjectKit.getAnchor(seesawBody);
    this.addBodyHidden(anchorBody);
    this.addConstraint(terrainObjectKit.getAnchorConstraint(seesawBody, anchorBody));
  }

  activate(position: number[], upright: boolean = false): void {
    super.activate();

    const bodies = this.bodies;
    for (let i = 0; i < bodies.length; i++) {
      const body = this.bodies[i];
      const angle = upright ? (-Math.PI / 2) : 0;
      p2Util.updateBodyPosition(body, position, angle);
    }
  }
}