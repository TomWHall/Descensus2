import Snake from './Snake';
import TerrainObjectType from './TerrainObjectType';
import randomUtil from '../../Utility/randomUtil';
import materials from '../../p2/materials';
import ITextures from '../../Assets/ITextures';
import IPixiGraph from '../../Pixi/IPixiGraph';
import p2Util from '../../p2/p2Util';

export default class SawSnake extends Snake {

  constructor(world: p2.World, pixiGraph: IPixiGraph, textures: ITextures, speed: number, agitateTime: number) {
    super(world, pixiGraph, textures, speed, agitateTime);

    this.type = TerrainObjectType.SawSnake;

    const segments = this.segments;
    for (let i = 0; i < segments.length; i++) {
      const body = segments[i];
      this.addSaw(body, textures);
    }
  }

  sawSpeed: number = -6;
  
  sawBodies: p2.Body[] = [];

  private addSaw(body: p2.Body, textures: ITextures): void {
    const sawBody = new p2.Body({
      mass: 1,
      position: [body.position[0], body.position[1]],
      angle: randomUtil.random0To1() * (2 * Math.PI)
    });
    sawBody.gravityScale = 0;
    sawBody.isFatal = true;

    const sawSprite = new PIXI.Sprite(textures.saw);

    this.addBody(sawBody, sawSprite, this.pixiGraph.sawContainer);
    this.sawBodies.push(sawBody);

    const circleShape = new p2.Circle({ radius: 1 });
    circleShape.material = materials.wood;
    this.addShape(sawBody, circleShape);

    const revoluteConstraint = new p2.RevoluteConstraint(sawBody, body, { localPivotA: [0, 0], localPivotB: [0, 0] });
    revoluteConstraint.enableMotor();
    revoluteConstraint.setMotorSpeed(this.sawSpeed);
    revoluteConstraint.collideConnected = false;
    this.addConstraint(revoluteConstraint);
  }

  activate(position: number[], speed: number, agitateTime: number): void {
    super.activate(position, speed, agitateTime);

    const segments = this.segments;
    const sawBodies = this.sawBodies;    
    for (let i = 0; i < segments.length; i++) {
      const segmentPosition = segments[i].position;
      const sawBody = sawBodies[i];
      p2Util.updateBodyPosition(sawBody, [segmentPosition[0], segmentPosition[1]]);
    }
  }
}