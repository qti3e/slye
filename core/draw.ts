export enum CommandKind {
  MOVE_TO,
  LINE_TO,
  QUADRATIC_CURVE_TO,
  BEZIER_CURVE_TO
}

interface PathCommand {
  command: CommandKind;
  args: number[];
}

export interface Drawable {
  path: PathCommand[];
}
