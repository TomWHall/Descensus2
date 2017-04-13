import TerrainObjectType from './Terrain/Objects/TerrainObjectType';
import ITextures from './Assets/ITextures';
import materials from './p2/materials';
import Color from './Color';
import IPixiGraph from './Pixi/IPixiGraph';
import Bus from './Bus';
import IContactEvent from './p2/IContactEvent';

let body: p2.Body;

function initialize(world: p2.World, pixiGraph: IPixiGraph, textures: ITextures): p2.Body {
  body = new p2.Body({
    mass: 0.5
  });
  body.allowSleep = false;

  const circle = new p2.Circle({ radius: 1 });
  circle.material = materials.ball;
  body.addShape(circle);

  const ballSprite = new PIXI.Sprite(textures.ball);
  ballSprite.anchor = new PIXI.ObservablePoint(null, null, 0.5, 0.5);
  ballSprite.tint = ballSprite.originalTint = Color.blue;
  pixiGraph.playerBallContainer.addChild(ballSprite);
  body.sprite = ballSprite;

  const ballReflectionSprite = new PIXI.Sprite(textures.ballReflections);
  ballReflectionSprite.alpha = 0.5;
  ballReflectionSprite.anchor = new PIXI.ObservablePoint(null, null, 0.5, 0.5);
  pixiGraph.playerBallContainer.addChild(ballReflectionSprite);
  body.spriteReflection = ballReflectionSprite;

  world.addBody(body);

  world.on('beginContact', beginContact, this);

  return body;
}

function beginContact(contactEvent: IContactEvent): void {
  const bodyA = contactEvent.bodyA;
  const bodyB = contactEvent.bodyB;

  if (bodyA === body || bodyB === body) {
    const otherBody = bodyA === body ? bodyB : bodyA;

    if (otherBody.isFatal) {
      Bus.publish('Ball.CollisionWithFatal', otherBody);
      return;
    } else if (otherBody.isGround) {
      Bus.publish('Ball.CollisionWithGround');
      return;
    } else if (otherBody.terrainObject && otherBody.terrainObject.type === TerrainObjectType.Plus1Life) {
      otherBody.terrainObject.deactivate();
      Bus.publish('Ball.CollisionWithPlusOne');
    }
  }
}

export default { initialize }