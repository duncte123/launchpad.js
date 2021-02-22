import EventEmitter from 'eventemitter3';
import { CONTROL_NOTE, NORMAL_NOTE } from '../utils.js';

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
export default class BaseLaunchpad extends EventEmitter {

  /**
   * Send a midi message to the launchpad
   * @param {number} message the message to send to the launchpad
   *
   * @abstract
   */
  send(...message) {
    BaseLaunchpad.#abstract('send');
  }

  /**
   * Send a System Exclusive message to the launchpad.
   * <br> The header and terminator have already been put in place by this method.
   *
   * @param {number} message The 6th byte + 4 values for the SysEx message
   *
   * @abstract
   */
  sendSysEx(...message) {
    BaseLaunchpad.#abstract('sendSysEx');
  }

  /**
   * Sets the color for a button on the Launchpad <br>
   * The button is an array of x and y when xyMode is turned on
   *
   * @param {number|number[]} button The grid button to set the color for
   * @param {Array<number>} color the color to set for the button
   *
   * @abstract
   */
  setButtonColor(button, color) {
    BaseLaunchpad.#abstract('setButtonColor');
  }

  /**
   * Tells the launchpad to start flashing a button between the current color and {@param color}<br>
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
  flash(button, color) {
    BaseLaunchpad.#abstract('flash');
  }

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
  pulse(button, color) {
    BaseLaunchpad.#abstract('pulse');
  }

  /**
   * Turns all the lights on the launchpad off
   *
   * @abstract
   */
  allOff() {
    BaseLaunchpad.#abstract('allOff');
  }

  /**
   * Closes the connection with the launchpad
   *
   * @abstract
   */
  closePorts() {
    BaseLaunchpad.#abstract('closePorts');
  }

  /**
   * Parses a button to an [x, y] coordinate
   *
   * @param {number} state The state of the button that was pressed
   * @param {number} note The button that was pressed on the launchpad
   *
   * @return {number[]|number} Only returns the array if xyMode is enabled
   */
  parseButtonToXy(state, note) {
    BaseLaunchpad.#abstract('parseButtonToXy');
  }

  /**
   * Gets the correct button on a launchpad given an [x, y] coordinate<br>
   *   IMPORTANT: this method will return the value of x when xyMode is disabled
   *
   *
   * @param {number} x The x position, 0 based
   * @param {number} y The y position, 0 based
   *
   * @returns {number} The button on the launchpad for this coordinate
   */
  mapButtonFromXy([x, y]) {
    BaseLaunchpad.#abstract('mapButtonFromXy');
  }

  static #abstract(method) {
    throw new Error(`The method ${method} is not implemented in this class.`);
  }
}
