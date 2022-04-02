/**
 * Specify the color of a single button
 */
export class ButtonColor {
  public static staticColor(button: number, color: number) {
    return [0, button, color];
  }

  public static flash(button: number, colorA: number, colorB: number) {
    return [1, button, colorB, colorA];
  }

  public static pulse(button: number, color: number) {
    return [2, button, color];
  }

  public static rgb(button: number, r: number, g: number, b: number) {
    // r, g, b in 0..127
    return [3, button, r, g, b];
  }
}
