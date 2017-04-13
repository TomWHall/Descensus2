import ITextures from './Assets/ITextures';
import materials from './p2/materials';
import IPixiGraph from './Pixi/IPixiGraph';
import IContactEvent from './p2/IContactEvent';

let body: p2.Body;

function initialize(world: p2.World, pixiGraph: IPixiGraph, textures: ITextures): p2.Body {
  body = new p2.Body();
  body.isGround = true;

  const groundShape = new p2.Box({ width: 32, height: 18 });
  groundShape.material = materials.wood;
  body.addShape(groundShape);

  const groundSprite = new PIXI.Sprite(textures.ground);
  groundSprite.scale.x = groundSprite.scale.y = 2;
  groundSprite.anchor = new PIXI.ObservablePoint(null, null, 0.5, 0.5);
  pixiGraph.terrainContainer.addChild(groundSprite);
  body.sprite = groundSprite;

  world.addBody(body);

  world.on('beginContact', beginContact, this);

  return body;
}

function beginContact(contactEvent: IContactEvent): void {
  const bodyA = contactEvent.bodyA;
  const bodyB = contactEvent.bodyB;

  if (!(bodyA === body || bodyB === body)) return;
  const otherBody = (bodyA === body ? bodyB : bodyA);

  if (otherBody.terrainObject) {
    otherBody.terrainObject.deactivate();
  }
}

export default { initialize }