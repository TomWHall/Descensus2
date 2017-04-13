import TerrainObject from './TerrainObject';
import TerrainObjectType from './TerrainObjectType';
import materials from '../../p2/materials';
import ITextures from '../../Assets/ITextures';
import IPixiGraph from '../../Pixi/IPixiGraph';
import terrainObjectKit from './terrainObjectKit';
import p2Util from '../../p2/p2Util';

export default class Snake extends TerrainObject {

  constructor(world: p2.World, pixiGraph: IPixiGraph, textures: ITextures, speed: number, agitateCycle: number) {
    super(TerrainObjectType.Snake, world, pixiGraph);

    this.agitateCycle = agitateCycle;

    let previousSegment: p2.Body = null;

    for (let i = 0; i < this.segmentCount; i++) {
      let twoByFourBody = new p2.Body({
        mass: 0.5
      });
      twoByFourBody.gravityScale = 0;

      const twoByFourSprite = new PIXI.Sprite(textures.twoByFour);

      this.addBody(twoByFourBody, twoByFourSprite, pixiGraph.twoByFourContainer);
      this.segments.push(twoByFourBody);

      const boxShape = new p2.Box({ width: 0.5, height: 4 });
      boxShape.material = materials.wood;

      this.addShape(twoByFourBody, boxShape);

      if (previousSegment === null) {
        const anchorBody = this.anchorBody = terrainObjectKit.getAnchor(twoByFourBody);
        this.addBodyHidden(anchorBody);
        const anchorConstraint = this.anchorConstraint = terrainObjectKit.getAnchorConstraint(twoByFourBody, anchorBody, [1.75, 0], true);
        this.addConstraint(anchorConstraint);
      } else {
        const revoluteConstraint = new p2.RevoluteConstraint(twoByFourBody, previousSegment, { localPivotA: [0, 1.75], localPivotB: [0, -1.75] });
        revoluteConstraint.collideConnected = false;
        const maxAngle = Math.PI / 4;
        revoluteConstraint.setLimits(-maxAngle, maxAngle);
        this.addConstraint(revoluteConstraint);
      }

      previousSegment = twoByFourBody;
    }
  }

  segmentCount: number = 4;
  
  agitateCycle: number;
  nextAgitateTime: number;

  segments: p2.Body[] = [];
  anchorBody: p2.Body;
  anchorConstraint: p2.RevoluteConstraint;

  scheduleAgitate(): void {
    this.nextAgitateTime = performance.now() + this.agitateCycle;
  }

  agitate(): void {
    if (!this.active || performance.now() < this.nextAgitateTime) return;

    this.anchorConstraint.setMotorSpeed(-this.anchorConstraint.getMotorSpeed());
    this.scheduleAgitate();
  }

  activate(position: number[], speed: number, agitateCycle: number): void {
    super.activate();

    // Position is the centre of the entire snake
    const snakeHeight = (this.segmentCount * 3.5) + 0.5;
    const tailBodyPosition = [position[0], (position[1] + (snakeHeight / 2)) - 2];

    p2Util.updateBodyPosition(this.anchorBody, [tailBodyPosition[0], tailBodyPosition[1] + 1.75])

    const segments = this.segments;
    for (let i = 0; i < segments.length; i++) {
      p2Util.updateBodyPosition(segments[i], [tailBodyPosition[0], tailBodyPosition[1] - (i * 3.5)]);
    }

    this.anchorConstraint.setMotorSpeed(speed);

    this.agitateCycle = agitateCycle;
    this.scheduleAgitate();
  }
}