// Steering axis slopes forward as it approaches the ground.
export const steerAxisX=y=>.237+(.16-y)*(.014/.106);
export const forwardForkPoint=([x,y])=>[2*steerAxisX(y)-x,y];
export const FRONT_AXLE_X=forwardForkPoint([.23,.055])[0];
