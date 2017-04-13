import Spinner from './Spinner';
import TerrainObjectType from './TerrainObjectType';
import materials from '../../p2/materials';
import ITextures from '../../Assets/ITextures';
import IPixiGraph from '../../Pixi/IPixiGraph';
import p2Util from '../../p2/p2Util';

export default class SawSpinner extends Spinner {

  constructor(world: p2.World, pixiGraph: IPixiGraph, textures: ITextures) {
    super(world, pixiGraph, textures);

    this.type = TerrainObjectType.SawSpinner;

    const spinnerBody = this.spinnerBody;
    const sawOffsets = this.sawOffsets;
    for (let i = 0; i < sawOffsets.length; i++) {
      this.addSaw(spinnerBody, sawOffsets[i], textures);
    }
  }

  sawSpeed: number = -6;

  sawOffsets: number[][] = [[0, 2.5], [0, -2.5], [-2.5, 0], [2.5, 0]];
  sawBodies: p2.Body[] = [];

  private addSaw(spinner: p2.Body, offset: number[], textures: ITextures): void {
    const spinnerBodyPosition = spinner.position;

    const sawBody = new p2.Body({
      mass: 1,
      position: [spinnerBodyPosition[0] + offset[0], spinnerBodyPosition[1] + offset[1]]
    });
    sawBody.gravityScale = 0;
    sawBody.isFatal = true;

    const sawSprite = new PIXI.Sprite(textures.saw);

    this.addBody(sawBody, sawSprite, this.pixiGraph.sawContainer);
    this.sawBodies.push(sawBody);

    const circleShape = new p2.Circle({ radius: 1 });
    circleShape.material = materials.wood;
    this.addShape(sawBody, circleShape);

    const revoluteConstraint = new p2.RevoluteConstraint(sawBody, spinner, { localPivotA: [0, 0], localPivotB: offset });
    revoluteConstraint.enableMotor();
    revoluteConstraint.setMotorSpeed(this.sawSpeed);
    revoluteConstraint.collideConnected = false;
    this.addConstraint(revoluteConstraint);
  }

  setSawPositions(spinnerPosition: number[]): void {
    const sawBodies = this.sawBodies;
    const sawOffsets = this.sawOffsets;
    for (let i = 0; i < sawOffsets.length; i++) {
      const sawOffset = sawOffsets[i];
      p2Util.updateBodyPosition(sawBodies[i], [spinnerPosition[0] + sawOffset[0], spinnerPosition[1] + sawOffset[1]]);
    }
  }

  activate(position: number[], speed: number): void {
    super.activate(position, speed);

    this.setSawPositions(position);
  }
}