/* eslint-disable init-declarations */
import { Style } from '../launchpads/base/ILaunchpad.js';
import { range } from '../internal/utils.js';
import { ILayer } from './ILayer.js';

/**
 * Implement one single layer
 *
 * This class is not exported from the library on purpose.
 */
export class Layer implements ILayer {
  public readonly buffer: Style[] = [];

  constructor(public readonly width: number, public readonly height: number) {
    this.allOff();
  }

  /**
   * Set a button color
   */
  set(x: number, y: number, style: Style): void;
  set(xy: [number, number], style: Style): void;
  set(xOrXy: number | [number, number], yOrStyle: number | Style, style?: Style): void {
    let xy: [number, number];
    let theStyle: Style;

    if (Array.isArray(xOrXy)) {
      xy = validateXy(xOrXy);
      if (typeof yOrStyle === 'number') {
        throw new Error(`Expected Style object as second argument, got: ${JSON.stringify(yOrStyle)}`);
      }
      theStyle = yOrStyle;
    } else {
      if (typeof xOrXy !== 'number' || typeof yOrStyle !== 'number') {
        throw new Error(`Expected only two arguments to be numbers, got: ${xOrXy},${yOrStyle}`);
      }
      if (!style) {
        throw new Error('Expected Style object as third argument');
      }
      xy = [xOrXy, yOrStyle];
      theStyle = style;
    }

    if (xy[0] < 0 || xy[0] >= this.width || xy[1] < 0 || xy[1] >= this.height) {
      return;
    }

    this.buffer[this.index(...xy)] = theStyle;
  }

  /**
   * Read a button color
   */
  get(x: number, y: number): Style;
  get(xy: [number, number]): Style;
  get(xOrXy: number | [number, number], maybeY?: number): Style {
    let xy: [number, number];

    if (Array.isArray(xOrXy)) {
      xy = validateXy(xOrXy);
    } else {
      if (typeof xOrXy !== 'number' || typeof maybeY !== 'number') {
        throw new Error(`Expected first two arguments to be numbers, got: ${xOrXy},${maybeY}`);
      }
      xy = [xOrXy, maybeY];
    }

    if (xy[0] < 0 || xy[0] >= this.width || xy[1] < 0 || xy[1] >= this.height) {
      return { style: 'off' };
    }

    return this.buffer[this.index(...xy)];
  }

  allOff(): void {
    this.buffer.splice(0, this.buffer.length, ...range(this.width * this.height).map(() => ({ style: 'off' as const })));
  }

  private index(x: number, y: number): number {
    // Buffer is laid out in row-major order
    return y * this.width + x;
  }
}

function validateXy(xOrXy: number | [number, number]): [number, number] {
  if (!Array.isArray(xOrXy) || xOrXy.length !== 2) {
    throw new Error(`Expecting [x, y] array, got: ${xOrXy}`);
  }
  return xOrXy;
}
