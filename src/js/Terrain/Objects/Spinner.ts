import TerrainObject from './TerrainObject';
import TerrainObjectType from './TerrainObjectType';
import Color from '../../Color';
import materials from '../../p2/materials';
import ITextures from '../../Assets/ITextures';
import IPixiGraph from '../../Pixi/IPixiGraph';
import terrainObjectKit from './terrainObjectKit';
import p2Util from '../../p2/p2Util';

export default class Spinner extends TerrainObject {

  constructor(world: p2.World, pixiGraph: IPixiGraph, textures: ITextures) {
    super(TerrainObjectType.Spinner, world, pixiGraph);

    const spinnerBody = new p2.Body({
      mass: 6
    });
    spinnerBody.gravityScale = 0;

    const spinnerSprite = new PIXI.Sprite(textures.spinner);
    (spinnerSprite as any).isSpinner = true;

    this.addBody(spinnerBody, spinnerSprite, pixiGraph.spinnerContainer);
    this.spinnerBody = spinnerBody;

    const horizontalBoxShape = new p2.Box({ width: 6, height: 1 });
    horizontalBoxShape.material = materials.wood;
    this.addShape(spinnerBody, horizontalBoxShape);

    const verticalBoxShape = new p2.Box({ width: 6, height: 1 });
    verticalBoxShape.material = materials.wood;
    this.addShape(spinnerBody, verticalBoxShape, { angle: -Math.PI / 2 });

    const anchorBody = this.anchorBody = terrainObjectKit.getAnchor(spinnerBody);
    this.addBodyHidden(anchorBody);

    const revoluteConstraint = this.anchorConstraint = terrainObjectKit.getAnchorConstraint(spinnerBody, anchorBody, null, true);
    this.addConstraint(revoluteConstraint);
  }

  spinnerBody: p2.Body;
  anchorBody: p2.Body;
  anchorConstraint: p2.RevoluteConstraint;

  activate(position: number[], speed: number): void {
    super.activate();

    p2Util.updateBodyPosition(this.spinnerBody, position);
    p2Util.updateBodyPosition(this.anchorBody, position);
    this.anchorConstraint.setMotorSpeed(speed);
  }

}