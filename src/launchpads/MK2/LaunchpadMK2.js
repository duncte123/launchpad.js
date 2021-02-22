import midi from 'midi';
import { CONTROL_NOTE, findDevice, NORMAL_NOTE, onExit } from '../../utils.js';
import BaseLaunchpad from '../BaseLaunchpad.js';

// TODO:
//  Support for other launchpads
export default class LaunchpadMK2 extends BaseLaunchpad {
  #input = new midi.Input();
  #output = new midi.Output();
  #options;

  /**
   *
   * @param {LaunchpadMK2Options?} options
   */
  constructor(options = {}) {
    super();

    this.#options = {
      deviceName: /^Launchpad MK2/,
      debug: false,
      xyMode: false,
      ...options
    };

    const deviceName = this.#options.deviceName;

    const [inputPort, outputPort] = [
      findDevice(deviceName, this.#input),
      findDevice(deviceName, this.#output),
    ];

    if (inputPort === -1 || outputPort === -1) {
      throw new Error(`Could not find connected launchpad for name "${deviceName}"`);
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

  /**
   * @inheritDoc
   */
  send(...message) {
    this.#logDebug('Sending midi message', message);
    this.#output.sendMessage(Array.isArray(message[0]) ? message[0] : message);
  }

  /**
   * @inheritDoc
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
   * @inheritDoc
   */
  setButtonColor(button, color) {
    if (!Array.isArray(color) || color.some(value => value > 63 || value < 0)) {
      throw new Error('Invalid color settings supplied');
    }

    const [r, g, b] = color;
    const buttonMapped = this.mapButtonFromXy(button);

    this.sendSysEx(11, buttonMapped, r, g, b);
  }

  /**
   * @inheritDoc
   */
  flash(button, color) {
    if (color < 0 || color > 127) {
      throw new Error('Color must be in range 0-127');
    }

    this.sendSysEx(35, 0, button, color);
  }

  /**
   * @inheritDoc
   */
  pulse(button, color) {
    if (color < 0 || color > 127) {
      throw new Error('Color must be in range 0-127');
    }

    this.sendSysEx(40, 0, button, color);
  }

  /**
   * @inheritDoc
   */
  allOff() {
    this.sendSysEx(14, 0);
  }

  /**
   * @inheritDoc
   */
  closePorts() {
    this.#logDebug('Closing ports');

    this.allOff();
    this.#input.closePort();
    this.#output.closePort();
  }

  /**
   * @inheritDoc
   */
  eventNames() {
    return [
      'ready',
      'rawMessage',
      'buttonDown',
      'buttonUp',
    ];
  }

  /**
   * @inheritDoc
   */
  parseButtonToXy(state, note) {
    if (!this.#options.xyMode) {
      return note;
    }

    // The top row is selected
    if (state === CONTROL_NOTE && note >= 104) {
      return [
        note - 104, // x
        0, // y
      ];
    }

    if (state === NORMAL_NOTE) {
      return [
        // % 10 is because we want to have one more than the buttons in one row
        // that way we get a number from 1 - 9
        (note - 1) % 10, // x
        Math.floor((99 - note) / 10), // y
      ];
    }

    return [];
  }

  /**
   * @inheritDoc
   */
  mapButtonFromXy([x, y]) {
    if (!this.#options.xyMode) {
      return x;
    }

    // top row
    if (y === 0) {
      // top row is 104 - 111
      // making x = 0 == 104
      return x + 104;
    }

    // the lowest button is 11 meaning we need to multiply y by 10
    // we start at 91 because we are always subtracting at least 10
    // we add x to get the correct column
    // eslint-disable-next-line no-extra-parens
    return 91 - (10 * y) + x;
  }

  #setupMessageHandler() {
    this.#input.on('message', (deltaTime, message) => {
      this.#logDebug(`m: ${message} d: ${deltaTime}`);
      this.#internalMessageHandler(message);
    });
  }

  #internalMessageHandler(message) {
    this.emit('rawMessage', message);

    const [state, note, value] = message;
    const button = this.parseButtonToXy(state, note);

    const upDown = Boolean(value) ? 'Down' : 'Up';
    this.emit(`button${upDown}`, button, value);
  }

  #logDebug(...message) {
    if (this.#options.debug) {
      console.log('[Launchpad Debug]', ...message);
    }
  }
}
