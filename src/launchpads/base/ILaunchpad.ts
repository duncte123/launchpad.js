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
   * Sets the color for a button on the Launchpad
   *
   * The button can be specified as a button number (launchpad specific), an [x, y]
   * value, or a Button object.
   *
   * The color can be either an index into the 128-color palette, or an RGB-triple
   * between 0 and 1.
   *
   * @param {number|number[]|Button} button The grid button to set the color for
   * @param {number|number[]} color the color to set for the button, either a palette color or an RGB array.
   *
   * @abstract
   */
  setButtonColor(button: ButtonIn, color: RgbColor | PaletteColor): void;

  /**
   * Tells the launchpad to start flashing a button between the current color and {@param color}<br>
   *   <b>IMPORTANT:</b> flashing and pulsing only works for buttons that are on the grid <br>
   *
   * The button can be specified as a button number (launchpad specific), an [x, y]
   * value, or a Button object.
   *
   * The colors are an index into the 128-color palette.
   *
   * Not all Launchpads support a second color. For those, the
   * second color is ignored.
   *
   * @param {number|number[]|Button} button The grid button to start flashing
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
   *
   * The button can be specified as a button number (launchpad specific), an [x, y]
   * value, or a Button object.
   *
   * The color is an index into the 128-color palette.
   *
   * @param {number|number[]|Button} button The grid button to start flashing
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

  /**
   * Set the color for multiple buttons at once
   *
   * Accepts a variable number of `{ button, style }` objects, and will
   * update all buttons in one go with as few MIDI commands as possible.
   *
   * The styles can be all different, though for the MK2 Launchpad
   * it will be most efficient if all styles are the same.
   *
   * @param {ButtonStyle[]} buttons The buttons to set
   */
  setButtons(...buttons: ButtonStyle[]): void;

  /**
   * Close the connection to the MIDI device
   *
   * This will automatically be called when your process exits. You probably
   * don't need to call this.
   */
  close(): void;
}

export interface EventTypes {
  ready: (deviceName: string) => void;
  rawMessage: (message: number[]) => void;

  /**
   * This is a message that is sent from the device to the host. Mainly used by messages like the Device Inquiry
   * @param message the payload from the device
   */
  outputMsg: (deltaTime: number, message: number[]) => void;
  buttonDown: (button: Button) => void;
  buttonUp: (button: Button) => void;
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

/**
 * A color specified by R, G and B components between 0..1
 */
export type RgbColor = [number, number, number];

/**
 * A color specified by an index into the Launchpad 128-color palette
 *
 * Values must be 0..127.
 */
export type PaletteColor = number;

export function isButton(x: ButtonIn): x is Button {
  return x !== null && typeof x === 'object' && 'nr' in x;
}

export interface ButtonStyle {

  /**
   * The button to set the light of
   */
  readonly button: ButtonIn;

  /**
   * The button style to set
   */
  readonly style: Style;
}

export type Style =
  | { readonly style: 'palette'; readonly color: number }
  | { readonly style: 'flash'; readonly color: number, readonly colorB?: number }
  | { readonly style: 'pulse'; readonly color: number }
  | { readonly style: 'rgb'; readonly rgb: RgbColor }
  | { readonly style: 'off' };
