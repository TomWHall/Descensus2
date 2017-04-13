interface IPixiGraph {
  stage: PIXI.Container;
  container: PIXI.Container;
  terrainContainer: PIXI.Container;
  barContainer: PIXI.Container;
  girderContainer: PIXI.Container;
  brickContainer: PIXI.Container;
  seesawContainer: PIXI.Container;
  spinnerContainer: PIXI.Container;
  sawContainer: PIXI.Container;
  freeSawContainer: PIXI.Container;
  twoByFourContainer: PIXI.Container;
  playerBallContainer: PIXI.Container;
  ballContainer: PIXI.Container;
  ballReflectionsContainer: PIXI.Container;
  plus1LifeContainer: PIXI.Container;
  background: PIXI.Sprite,
  windLeft: PIXI.Sprite,
  windRight: PIXI.Sprite
}

export default IPixiGraph;