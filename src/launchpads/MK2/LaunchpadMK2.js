import midi from 'midi';
import EventEmitter from 'eventemitter3';
import { findDevice, onExit } from '../../utils.js';

// TODO:
//  make abstract class for base launchpad
//  Support for other launchpads

export default class LaunchpadMK2 extends EventEmitter {
  #input;
  #output;
  #options;

  constructor(options = {}) {
    super();

    this.#options = Object.assign({}, {
      deviceName: /^Launchpad MK2/,
      ignore0Velocity: true,
      debug: false,
    }, options);

    this.#input = new midi.Input();
    this.#output = new midi.Output();

    const deviceName = this.#options.deviceName;

    const [inputPort, outputPort] = [
      findDevice(deviceName, this.#input),
      findDevice(deviceName, this.#output),
    ];

    if (inputPort === -1 || outputPort === -1) {
      throw new Error(`could not find port # for ${deviceName}`);
    }

    onExit(() => this.closePorts());

    this.#input.openPort(inputPort);
    this.#output.openPort(outputPort);

    // put the launchpad into session mode
    this.sendSysEx(34, 0);

    this.#setupMessageHandler();

    process.nextTick(() => {
      this.emit('ready', this.#input.getPortName(inputPort));
    });
  }

  #setupMessageHandler() {
    this.#input.on('message', (deltaTime, message) => {
      setImmediate(() => {
        this.#logDebug(`m: ${message} d: ${deltaTime}`);
        this.#internalMessageHandler(message);
      });
    });
  }

  #internalMessageHandler(message) {
    this.emit('rawMessage', message);

    const [status, note, value] = message;

    // TODO
  }

  send(...message) {
    this.#logDebug('Sending midi message', message);
    this.#output.sendMessage(Array.isArray(message[0]) ? message[0] : message);
  }

  /**
   * Send a System Exclusive message to the launchpad.
   * <br> The header and terminator have already been put in place by this method.
   *
   * @param message The 6th byte + 4 values for the SysEx message
   */
  sendSysEx(...message) {
    const arrayParsed = Array.isArray(message[0]) ? message[0] : message;
    const sysExMessage = [
      240, 0, 32, 41, 2, 24,
      ...arrayParsed,
      247
    ];

    this.#logDebug('Sending sysExMessage', sysExMessage);

    this.#output.sendMessage(sysExMessage);
  }

  /**
   * Turns all the lights on the launchpad off
   */
  allOff() {
    this.sendSysEx(14, 0);
  }

  #logDebug(...message) {
    if (this.#options.debug) {
      console.log('[Launchpad Debug]', ...message);
    }
  }

  /**
   * Closes the connection with the launchpad
   */
  closePorts() {
    this.#logDebug('Closing ports');

    this.allOff();
    this.#input.closePort();
    this.#output.closePort();
  }

  eventNames() {
    return [
      'ready',
      'rawMessage',
      'buttonDown',
      'buttonUp',
    ];
  }
}
