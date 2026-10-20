export type KeyState = {
  left: boolean;
  right: boolean;
  up: boolean;
  down: boolean;
};

export function velocityFromKeys(
  keys: KeyState,
  speed: number,
): { x: number; y: number } {
  let x = (keys.right ? 1 : 0) - (keys.left ? 1 : 0);
  let y = (keys.down ? 1 : 0) - (keys.up ? 1 : 0);
  if (x !== 0 && y !== 0) {
    x *= Math.SQRT1_2;
    y *= Math.SQRT1_2;
  }
  return { x: x * speed, y: y * speed };
}
