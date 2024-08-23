import { Style } from '../launchpads/base/ILaunchpad.js';

/**
 * Interface for reading and writing button colors on a particular layer
 */
export interface ILayer {

  /**
   * The width of the layer
   */
  readonly width: number;

  /**
   * The height of the layer
   */
  readonly height: number;

  /**
   * Set the style (color) of a single button
   *
   * @param {number} x The x coordinate
   * @param {number} y The y coordinate
   * @param {number[]} xy The x and y coordinates
   * @param {Style} style The style of the button
   */
  set(x: number, y: number, style: Style): void;
  set(xy: [number, number], style: Style): void;

  /**
   * Return the style (color) of a single button
   *
   * @param {number} x The x coordinate
   * @param {number} y The y coordinate
   * @param {number[]} xy The x and y coordinates
   * @returns {Style} The style of the button
   */
  get(x: number, y: number): Style;
  get(xy: [number, number]): Style;

  /**
   * Clear all buttons
   */
  allOff(): void;
}

