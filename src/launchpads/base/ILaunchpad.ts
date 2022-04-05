import EventEmitter from 'eventemitter3';

/**
 * Abstract interface for interacting with a launchpad
 *
 * Emits the following events:
 *
 * @event ready The API is ready to be used with the launchpad
 * @event rawMessage Messages from the launchpad are forwarded to this event
 * @event buttonDown A button on the launchpad has been pressed
 * @event buttonUp A button on the launchpad has been released
 *
 * @abstract
 */
// cuz this is an abstract class
/* eslint-disable no-unused-vars */
export interface ILaunchpad extends EventEmitter<EventTypes> {
  /**
   * Sets the color for a button on the Launchpad <br>
   * The button is an array of x and y when xyMode is turned on
   *
   * @param {number|number[]} button The grid button to set the color for
   * @param {Array<number>} color the color to set for the button, the array is an RGB array
   *
   * @abstract
   */
  setButtonColor(button: ButtonIn, color: number[]): void;

  /**
   * Tells the launchpad to start flashing a button between the current color and {@param color}<br>
   *   <b>IMPORTANT:</b> flashing and pulsing only works for buttons that are on the grid <br>
   * The button is an array of x and y when xyMode is turned on
   *
   * Not all Launchpads support a second color. For those, the
   * second color is ignored.
   *
   * @param {number|number[]} button The grid button to start flashing
   * @param {number} color A color from the primary color chart, result to your launchpad's programming manual for more info
   * @param {number} color2 A color from the primary color chart, result to your launchpad's programming manual for more info.
   *
   * @throws {Error} if the color is out of the launchpad's range
   *
   * @abstract
   */
  flash(button: ButtonIn, color: number, color2?: number): void;

  /**
   * Tells the launchpad to start pulsing a button between the current color and {@param color}<br>
   *   <b>IMPORTANT:</b> flashing and pulsing only works for buttons that are on the grid <br>
   * The button is an array of x and y when xyMode is turned on
   *
   * @param {number|number[]} button The grid button to start flashing
   * @param {number} color A color from the primary color chart, result to your launchpad's programming manual for more info
   *
   * @throws {Error} if the color is out of the launchpad's range
   *
   * @abstract
   */
  pulse(button: ButtonIn, color: number): void;

  /**
   * Turns all the lights on the launchpad off
   *
   * @abstract
   */
  allOff(): void;
}

export interface EventTypes {
  ready: (deviceName: string) => void,
  'rawMessage': (message: number[]) => void,
  'buttonDown': (button: Button) => void,
  'buttonUp': (button: Button) => void,
 }

 /**
 * Buttons reported by events
 *
 * Offers both number and [x, y] coordinates.
 */
export interface Button {
  /**
   * Button number
   *
   * The specifics of this number are dependent on LP version.
   */
  readonly nr: number;

  /**
   * Button coordinates
   *
   * Top-left is [0, 0], bottom-right is [8, 8].
   */
  readonly xy: [number, number];
}

/**
 * Button accepted by the API
 *
 * Either a pure button number, x/y coordinates, or a Button
 * struct.
 */
export type ButtonIn = number | [number, number] | Button;

export function isButton(x: ButtonIn): x is Button {
  return x != null && typeof x === 'object' && 'nr' in x;
}