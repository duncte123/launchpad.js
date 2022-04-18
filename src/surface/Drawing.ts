/* eslint-disable no-empty-function */
/* eslint-disable no-useless-constructor */
import { Style } from '../launchpads/base/ILaunchpad.js';
import { allXy } from '../utils.js';
import { ILayer } from './ILayer.js';

/**
 * Helper routines for drawing on a layer
 */
export class Drawing {
  constructor(private readonly layer: ILayer) {
  }

  /**
   * Draw a bitmap on the layer at the given coordinates
   *
   * The bitmap is specified as a list of strings. Every line is drawn on a new
   * row, starting a given (x, y) coordinate pair.  Characters in the list of
   * strings can be mapped to button styles.
   *
   * @param {number[]} xy The coordinate of the top-left button
   * @param {string[]} lines Sequence of button colors to draw, every string is drawn on a new row with colors from the styleMap parameter
   * @param {Record<string, Style>} styleMap Map of characters to button styles
   */
  public bitmap(xy: [number, number], lines: string[], styleMap: Record<string, Style>): void {
    for (let j = 0; j < lines.length; j++) {
      const line = lines[j];
      for (let i = 0; i < line.length; i++) {
        const style = styleMap[line[i]];
        if (style) {
          this.layer.set(xy[0] + i, xy[1] + j, style);
        }
      }
    }
  }

  /**
   * Move all buttons on this layer by the given amount
   *
   * @param {number[]} delta Shift all colors by the given (x, y) amount
   */
  public shift(delta: [number, number]): void {
    const newStyles: { xy: [number, number], style: Style }[] = allXy(this.layer.width, this.layer.height).map(xy => ({
      xy,
      style: this.layer.get(xy[0] - delta[0], xy[1] - delta[1]),
    }));
    for (const { xy, style } of newStyles) {
      this.layer.set(xy, style);
    }
  }

  /**
   * Draw a rectangle at the given location
   *
   * @param {number[]} xy The (x, y) coordinates of the top-left corner of the rectangle
   * @param {number[]} wh The width anad height of the rectangle. Cannot be negative.
   * @param {Style} style The button style to paint all buttons in the rectangle
   */
  public rect(xy: [number, number], wh: [number, number], style: Style): void {
    for (let y = 0; y < wh[1]; y++) {
      for (let x = 0; x < wh[0]; x++) {
        this.layer.set(xy[0] + x, xy[1] + y, style);
      }
    }
  }
}
