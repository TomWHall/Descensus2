interface ShapeOptions {

  offset?: number[];
  angle?: number;
  collisionOptions?: {
    collisionGroup: number;
    collisionMask: number;
  };

}

export default ShapeOptions;