import EventEmitter from 'eventemitter3';
import midi from 'midi';

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
/* eslint-disable no-unused-vars,@typescript-eslint/no-namespace */
export interface ILaunchpad extends EventEmitter<EventTypes> {

  /**
   * The midi input device of the connected launchpad, useful for enabling/disabling sysex messages for example or listening to events
   *
   * @see https://www.npmjs.com/package/midi
   */
  get midiInput(): midi.Input;

  /**
   * The midi output device of the connected launchpad, useful for sending custom messages to the launchpad
   *
   * @see https://www.npmjs.com/package/midi
   */
  get midiOutput(): midi.Output;

  /**
   * Sets the color for a button on the Launchpad
   *
   * The button can be specified as a button number (launchpad specific), an [x, y]
   * value, or a Button object.
   *
   * The color can be either an index into the 128-color palette, or an RGB-triple
   * between 0 and 1.
   *
   * Support on Launchpad MK1 is limited, see `LaunchpadMK1.pulse()` for details.
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
   * Not all Launchpads support a second color. For those, the second color is ignored.
   * Support on Launchpad MK1 is limited, see `LaunchpadMK1.flash()` for details.
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
   * Support on Launchpad MK1 is limited, see `LaunchpadMK1.pulse()` for details.
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
   * Support on Launchpad MK1 is limited, see `LaunchpadMK1.setButtons()` for details.
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
 * Specifies the button layout of a Launchpad starting from top-left.
 *
 * Each value specifies the ID of the button.
 *
 * @since 3.4.0
 */
export type ButtonLayout = number[][];

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
 * Specifies red and green color values for Launchpad MK1 in range `0..1`.
 *
 * Launchpad MK1 has no blue LED, therefore the value for blue can be omitted
 *   in some cases.
 *
 * **NOTE** that the values provided are converted back to a `ColorIntensity` value
 *   in order for the MK1 to accept it. The `ColorIntensity` is determined to be:
 * - `0` if `value == 0`
 * - `1` if `value < 0.333`
 * - `2` if `value < 0.666`
 * - `3` otherwise
 *
 * @example [red, green]
 * @example [.75, 0]
 *
 * @since 3.4.0
 */
export type RgColor = [number, number];

/**
 * Specifies a red/green color intensity for Launchpad MK1, where:
 * - `0` is off.
 * - `1` is low brightness.
 * - `2` is medium brightness.
 * - `3` is full brightness.
 *
 * @since 3.4.4
 */
export type ColorIntensity = 0 | 1 | 2 | 3;

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
  | Style.Palette
  | Style.Flash
  | Style.Pulse
  | Style.Rgb
  | Style.Off;
export namespace Style {
  export interface Palette { readonly style: 'palette'; readonly color: PaletteColor }
  export interface Flash { readonly style: 'flash'; readonly color: PaletteColor, readonly colorB?: PaletteColor }
  export interface Pulse { readonly style: 'pulse'; readonly color: PaletteColor }
  export interface Rgb { readonly style: 'rgb'; readonly rgb: RgbColor }
  export interface Off { readonly style: 'off' }
}

/** @since 3.4.4 */
export interface Mk1ButtonStyle extends Omit<ButtonStyle, 'style'> {

  /** The button style to set. */
  readonly style: Mk1Style;
}

/**
 * Specifies a button style specific to Launchpad MK1.
 *
 * Differences with `Style` for other models, when property `style` is set to:
 * - `'palette'` or `'velocity'`, property `color` accepts a `Velocity` value instead of a `PaletteColor`.
 * - `'flash'` or `'pulse'`, property `color` accepts either an `RgColor`, `RgbColor` or `Velocity` value.
 * - `'rgb'`, property `rgb` accepts either an `RgColor`, `RgbColor` value.
 *
 * @since 3.4.4
 */
export type Mk1Style =
  | Mk1Style.Palette
  | Mk1Style.Flash
  | Mk1Style.Pulse
  | Mk1Style.Rgb
  | Mk1Style.Off;
export namespace Mk1Style {
  export interface Palette { readonly style: Style.Palette['style'] | 'velocity'; readonly color: Velocity }
  export interface Flash { readonly style: Style.Flash['style']; readonly color: RgColor | RgbColor | Velocity }
  export interface Pulse { readonly style: Style.Pulse['style']; readonly color: RgColor | RgbColor | Velocity }
  export interface Rgb { readonly style: Style.Rgb['style']; readonly rgb: RgColor | RgbColor }
  export type Off = Style.Off;
}

/**
 * Specifies a *Velocity* value for a button on the Launchpad MK1.
 *
 * A velocity value determines the color and flash mode of a button
 *   and is calculated using the following formula:
 * ```txt
 * Red/Green = 0   off.
 *             1   low brightness.
 *             2   medium brightness.
 *             3   full brightness.
 *
 * Velocity  = (16 x Green)
 *           + Red
 *           + Flags
 *
 * Flags     = 12  for normal use.
 *             8   to make the LED flash.
 *             0   if using double-buffering.
 * ```
 *
 * Use `lp.velocity()` on `LaunchpadMK1` for easy calculation.
 *
 * @since 3.4.0
 */
export type Velocity = number;
