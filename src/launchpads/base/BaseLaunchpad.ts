import EventEmitter from 'eventemitter3';
import { Button, ButtonIn } from './types';

export interface BaseLaunchpadOptions {

  /**
   * Regexp to use to find the Launchpad MIDI device
   *
   * By default, will use a regexp that is appropriate
   * for the Launchpad version you selected.
   */
  readonly deviceName?: RegExp;

  /**
   * Switch on debug mode
   *
   * Will log more messages to the console.
   *
   * @default false
   */
  readonly debug?: boolean;
}

/**
 * base class for interacting with a launchpad<br>
 *   each sub class must close the port to the launchpad when the application is exited<br>
 *   to have a consistent event system across the project every subclass must implement the following events listed
 *
 * This class can be used to create your own launchpad implementations
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
export default abstract class BaseLaunchpad extends EventEmitter<EventTypes> {

  /**
   * Send a midi message to the launchpad
   * @param {number} message the message to send to the launchpad
   *
   * @abstract
   */
  abstract send(...message: number[]): void;

  /**
   * Send a System Exclusive message to the launchpad.
   * <br> The header and terminator have already been put in place by this method.
   *
   * @param {number} message The 6th byte + 4 values for the SysEx message
   *
   * @abstract
   */
  abstract sendSysEx(...message: number[]): void;

  /**
   * Sets the color for a button on the Launchpad <br>
   * The button is an array of x and y when xyMode is turned on
   *
   * @param {number|number[]} button The grid button to set the color for
   * @param {Array<number>} color the color to set for the button, the array is an RGB array
   *
   * @abstract
   */
  abstract setButtonColor(button: ButtonIn, color: number[]): void;

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
  abstract flash(button: ButtonIn, color: number, color2?: number): void;

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
  abstract pulse(button: ButtonIn, color: number): void;

  /**
   * Turns all the lights on the launchpad off
   *
   * @abstract
   */
  abstract allOff(): void;

  /**
   * Closes the connection with the launchpad
   *
   * @abstract
   */
  abstract closePorts(): void;

  /**
   * Parses a button to a Button structure
   *
   * @param {number} state The state of the button that was pressed
   * @param {number} note The button that was pressed on the launchpad
   *
   * @returns {Button} A structure with both button number and X/Y coordinates
   */
  abstract parseButtonToXy(state: number, note: number): Button;

  /**
   * Returns the button number given a number, [x, y] coordinates, or a structure
   *
   * @param {number|[number,number]|Button} xy Information about the button
   *
   * @returns {number} The button on the launchpad for this coordinate
   */
  abstract mapButtonFromXy(xy: ButtonIn): number;
}

export interface EventTypes {
  ready: (deviceName: string) => void,
  'rawMessage': (message: number[]) => void,
  'buttonDown': (button: Button) => void,
  'buttonUp': (button: Button) => void,
 }