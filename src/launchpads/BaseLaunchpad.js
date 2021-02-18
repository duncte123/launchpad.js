import EventEmitter from 'eventemitter3';

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
export default class BaseLaunchpad extends EventEmitter {
  /**
   * Send a midi message to the launchpad
   * @param message the message to send to the launchpad
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
   * @param message The 6th byte + 4 values for the SysEx message
   *
   * @abstract
   */
  sendSysEx(...message) {
    BaseLaunchpad.#abstract('sendSysEx');
  }

  /**
   * Sets the color for a button on the Launchpad
   *
   * @param {number} button
   * @param {Array<number>} color
   *
   * @abstract
   */
  setButtonColor(button, color) {
    BaseLaunchpad.#abstract('setButtonColor');
  }

  /**
   * Tells the launchpad to start flashing a button between the current color and {@param color}<br>
   *   <b>IMPORTANT:</b> flashing and pulsing only works for buttons that are on the grid
   *
   * @param {number} button The grid button to start flashing
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
   *   <b>IMPORTANT:</b> flashing and pulsing only works for buttons that are on the grid
   *
   * @param {number} button The grid button to start flashing
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

  static #abstract(method) {
    throw new Error(`The method ${method} is not implemented in this class.`);
  }
}
