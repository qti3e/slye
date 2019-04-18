import { Slye3DCanvas } from "./canvas";
import { Step } from "./step";

/**
 * Main part of the API, provides set of functions to work with
 * a presentation - most of the time there is only one instance
 * of it in user's workspace.
 */
export class Presentation {
  /**
   * Active steps in the current presentation.
   */
  private steps: Step[];

  /**
   * Renders thumbnail of the given step into the given canvas.
   *
   * @param canvas
   *  The canvas which we wish to have our thumbnail being rendered on.
   * @param step
   *  Step index in presentation.steps.
   * @param frame
   *  Frame number, used for animations.
   * @param width
   *  Width of the image for this thumbnail.
   * @param height
   *  Height of the image for this thumbnail.
   * @param offsetX
   *  Postion of the left corner of the image.
   * @param offsetY
   *  Postion of the top corner of the image.
   */
  renderThumbnail(
    canvas: Slye3DCanvas,
    step: number,
    frame: number,
    width: number,
    height: number,
    offsetX: number,
    offsetY: number
  ): void {}

  /**
   * Render the presentation into the given canvas at the given frame.
   *
   * @param canvas
   *  The 3D canvas which we want to render the given frame on.
   * @param frame
   *  Current frame number.
   */
  render(canvas: Slye3DCanvas, frame: number): void {}
}
