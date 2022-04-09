import { Style } from '../launchpads/base/ILaunchpad.js';

/**
 * Interface for reading and writing button colors on a particular layer
 */
export interface ILayer {
  readonly width: number;
  readonly height: number;

  /**
   * Set a button color
   */
  set(x: number, y: number, style: Style): void;
  set(xy: [number, number], style: Style): void;

  /**
   * Read a button color
   */
  get(x: number, y: number): Style;
  get(xy: [number, number]): Style;

  /**
   * Clear all buttons
   */
  allOff(): void;
}

