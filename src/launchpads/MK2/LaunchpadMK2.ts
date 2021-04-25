import midi from 'midi';
import { CONTROL_NOTE, findDevice, NORMAL_NOTE, onExit } from '../../utils.js';
import BaseLaunchpad from '../BaseLaunchpad.js';
import { scaleBetween, minMaxColor } from '../../colorHelpers.js';

export type LaunchpadMK2Options = {
  deviceName: RegExp,
  debug: boolean,
  xyMode: boolean,
};

// TODO:
//  Support for other launchpads
export class LaunchpadMK2 extends BaseLaunchpad {
  private readonly input = new midi.Input();
  private readonly output = new midi.Output();
  private readonly options: LaunchpadMK2Options;

  /**
   *
   * @param {LaunchpadMK2Options?} options
   */
  constructor(options?: LaunchpadMK2Options) {
    super();

    this.options = {
      deviceName: /^Launchpad MK2/,
      debug: false,
      xyMode: false,
      ...options
    };

    const deviceName = this.options.deviceName;

    const [inputPort, outputPort] = [
      findDevice(deviceName, this.input),
      findDevice(deviceName, this.output),
    ];

    if (inputPort === -1 || outputPort === -1) {
      throw new Error(`Could not find connected launchpad for name "${deviceName}"`);
    }

    onExit(() => this.closePorts());

    this.input.openPort(inputPort);
    this.output.openPort(outputPort);

    // put the launchpad into session mode
    this.sendSysEx(34, 0);

    this.setupMessageHandler();

    process.nextTick(() => {
      this.emit('ready', this.input.getPortName(inputPort));
    });
  }

  /**
   * @inheritDoc
   */
  send(...message: number[]): void {
    this.logDebug('Sending midi message', message);
    this.output.sendMessage(Array.isArray(message[0]) ? message[0] : message);
  }

  /**
   * @inheritDoc
   */
  sendSysEx(...message: number[]): void {
    const arrayParsed = Array.isArray(message[0]) ? message[0] : message;
    const sysExMessage = [
      240, 0, 32, 41, 2, 24,
      ...arrayParsed,
      247
    ];

    this.logDebug('Sending sysExMessage', sysExMessage);

    this.output.sendMessage(sysExMessage);
  }

  /**
   * @inheritDoc
   */
  setButtonColor(button: number|number[], color: number[]): void {
    if (!Array.isArray(color) || color.length !== 3) {
      throw new Error('Invalid color settings supplied');
    }

    // make sure the launchpad understands the colors we provide
    if (color.some(value => value > 63 || value < 0)) {
      throw new Error('RGB color is invalid, please make sure the color values are in range 0-63 (Hint: you can use colors.colorFromRGB as a helper for that');
    }

    const [r, g, b] = color;
    const buttonMapped = this.mapButtonFromXy(button);

    this.sendSysEx(11, buttonMapped, r, g, b);
  }

  /**
   * @inheritDoc
   */
  flash(button: number|number[], color: number): void {
    const buttonMapped = this.mapButtonFromXy(button);

    this.sendSysEx(35, 0, buttonMapped, minMaxColor(color));
  }

  /**
   * @inheritDoc
   */
  pulse(button: number|number[], color: number): void {
    const buttonMapped = this.mapButtonFromXy(button);

    this.sendSysEx(40, 0, buttonMapped, minMaxColor(color));
  }

  /**
   * @inheritDoc
   */
  allOff(): void {
    this.sendSysEx(14, 0);
  }

  /**
   * @inheritDoc
   */
  closePorts(): void {
    this.logDebug('Closing ports');

    this.allOff();
    this.input.closePort();
    this.output.closePort();
  }

  /**
   * @inheritDoc
   */
  eventNames(): string[] {
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
  parseButtonToXy(state: number, note: number): number[]|number {
    if (!this.options.xyMode) {
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
  mapButtonFromXy(xy: number[]|number): number {
    const [x, y] = Array.isArray(xy) ? xy : [xy, 0];

    if (!this.options.xyMode) {
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

  private setupMessageHandler(): void {
    this.input.on('message', (deltaTime: number, message: number[]) => {
      this.logDebug(`m: ${message} d: ${deltaTime}`);
      this.internalMessageHandler(message);
    });
  }

  private internalMessageHandler(message: number[]): void {
    this.emit('rawMessage', message);

    const [state, note, value] = message;
    const button = this.parseButtonToXy(state, note);

    const upDown = Boolean(value) ? 'Down' : 'Up';
    this.emit(`button${upDown}`, button, value);
  }

  private logDebug(...message: any[]): void {
    if (this.options.debug) {
      console.log('[Launchpad Debug]', ...message);
    }
  }
}
