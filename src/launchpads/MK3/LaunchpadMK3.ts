import midi from 'midi';
import { findDevice, onExit } from '../../utils.js';
import BaseLaunchpad from '../BaseLaunchpad.js';

export type LaunchpadMK3Options = {
  deviceName: RegExp,
  debug: boolean,
  xyMode: boolean,
};

export class LaunchpadMK3 extends BaseLaunchpad {
  private readonly input = new midi.Input();
  private readonly output = new midi.Output();
  private readonly options: LaunchpadMK3Options;

  /**
   *
   * @param {LaunchpadMK3Options?} options
   */
  constructor(options?: LaunchpadMK3Options) {
    super();

    this.options = {
      // The LP advertises both MIDI and DAW interfaces, but only
      // the MIDI interface reports button presses.
      deviceName: /^Launchpad.*MK3 MIDI/,
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

    this.output.openPort(outputPort);
    this.input.openPort(inputPort);

    this.input.ignoreTypes(false, false, false);

    this.setupMessageHandler();

    // Switch to programmer mode mode (full control of all buttons)
    this.sendSysEx(...SysEx.setProgrammerMode(true));

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
      240, 0, 32, 41, 2, 13,
      ...arrayParsed.map(Math.floor),
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
    if (color.some(value => value > 127 || value < 0)) {
      throw new Error('RGB color is invalid, please make sure the color values are in range 0-127 (Hint: you can use colors.colorFromRGB as a helper for that');
    }

    const [r, g, b] = color;
    const buttonMapped = this.mapButtonFromXy(button);

    this.sendSysEx(...SysEx.setButtonColors(ButtonColor.rgb(
      buttonMapped, r, g, b)));
  }

  /**
   * @inheritDoc
   */
  flash(button: number|number[], color: number, colorB: number = 0): void {
    const buttonMapped = this.mapButtonFromXy(button);

    this.sendSysEx(...SysEx.setButtonColors(ButtonColor.flash(buttonMapped, color, colorB)));
  }

  /**
   * @inheritDoc
   */
  pulse(button: number|number[], color: number): void {
    const buttonMapped = this.mapButtonFromXy(button);

    this.sendSysEx(...SysEx.setButtonColors(ButtonColor.pulse(buttonMapped, color)));
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

    const row = Math.floor(note / 10);
    const col = (note - 1) % 10;

    return [col, 9 - row];
  }

  /**
   * @inheritDoc
   */
  mapButtonFromXy(xy: number[]|number): number {
    const [x, y] = Array.isArray(xy) ? xy : [xy, 0];

    if (!this.options.xyMode) {
      return x;
    }

    return (9 - y) * 10 + x + 1;
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

/**
 * Specify the color of a single button
 */
export class ButtonColor {
  public static staticColor(button: number, color: number) {
    return [0, button, color];
  }

  public static flash(button: number, colorA: number, colorB: number) {
    return [1, button, colorB, colorA];
  }

  public static pulse(button: number, color: number) {
    return [2, button, color];
  }

  public static rgb(button: number, r: number, g: number, b: number) {
    // r, g, b in 0..127
    return [3, button, r, g, b];
  }
}

/**
 * Class to format SysEx messages into an array of numbers
 */
class SysEx {
  public static setProgrammerMode(enable: boolean): number[] {
    return [14, enable ? 1 : 0];
  }

  public static setButtonColors(...buttons: number[][]): number[] {
    return [3, ...Array.prototype.concat([], ...buttons)];
  }
}
