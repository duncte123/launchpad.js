import EventEmitter from 'eventemitter3';
import midi from 'midi';
import { findDevice, onExit } from '../../utils.js';
import { Button, ButtonIn, ButtonStyle, EventTypes, ILaunchpad, PaletteColor, RgbColor, Style } from './ILaunchpad.js';

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
 * Shared implementation between multiple Launchpad types
 *
 * This class can be used to create your own launchpad implementations.
 *
 * Each sub class must close the port to the launchpad when the application is exited
 * to have a consistent event system across the project every subclass must implement the following events listed.
 */
export abstract class BaseLaunchpad extends EventEmitter<EventTypes> implements ILaunchpad {
  protected readonly input = new midi.Input();
  protected readonly output = new midi.Output();
  protected open = false;

  constructor(protected readonly options: BaseLaunchpadOptions = {}) {
    super();
  }

  /**
   * @inheritDoc
   */
  public abstract setButtonColor(button: ButtonIn, color: RgbColor | PaletteColor): void;

  /**
   * @inheritDoc
   */
  public abstract flash(button: ButtonIn, color: number, color2?: number): void;

  /**
   * @inheritDoc
   */
  public abstract pulse(button: ButtonIn, color: number): void;

  /**
   * @inheritDoc
   */
  public abstract allOff(): void;

  /**
   * Make a SysEx message from the given payload
   *
   * (Wrap the payload with the necessary bytes)
   */
  protected abstract makeSysEx(payload: number[]): number[];

  /**
   * Send a midi message to the launchpad
   *
   * @param {number} message the message to send to the launchpad
   */
  protected send(message: number[]): void;
  protected send(...message: number[]): void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  protected send(...message: any[]): void {
    this.logDebug('Sending midi message', message);
    this.output.sendMessage(Array.isArray(message[0]) ? message[0] : message as number[]);
  }

  /**
   * Send a System Exclusive message to the launchpad.
   *
   * The method will add the necessary header and footer.
   *
   * @param {number} message The 6th byte + 4 values for the SysEx message
   */
  protected sendSysEx(message: number[]): void;
  protected sendSysEx(...message: number[]): void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  protected sendSysEx(...message: any[]): void {
    const arrayParsed = Array.isArray(message[0]) ? message[0] : message;
    const sysExMessage = this.makeSysEx(arrayParsed);
    this.logDebug('Sending sysExMessage', sysExMessage);

    this.output.sendMessage(sysExMessage);
  }

  /**
   * Find and initialite the MIDI device matching the given regex
   *
   * Call this from the subclass constructors.
   */
  protected openMidiDevice(deviceName: RegExp): void {
    const [inputPort, outputPort] = [
      findDevice(deviceName, this.input),
      findDevice(deviceName, this.output),
    ];

    onExit(() => this.close());

    this.output.openPort(outputPort);
    this.input.openPort(inputPort);

    this.open = true;

    process.nextTick(() => {
      this.emit('ready', this.input.getPortName(inputPort));
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  protected logDebug(...message: any[]): void {
    if (this.options.debug) {
      console.log('[Launchpad Debug]', ...message);
    }
  }

  protected setupMessageHandler(): void {
    this.input.on('message', (deltaTime: number, message: number[]) => {
      this.logDebug(`m: ${message} d: ${deltaTime}`);
      this.internalMessageHandler(message);
    });
  }

  private internalMessageHandler(message: number[]): void {
    this.emit('rawMessage', message);

    const [state, note, value] = message;
    const button = this.parseButtonToXy(state, note);

    const event = Boolean(value) ? 'buttonDown' : 'buttonUp';
    this.emit(event, button);
  }

  /**
   * Closes the connection with the launchpad
   */
  public close(): void {
    if (!this.open) {
      return;
    }

    this.logDebug('Closing ports');

    this.allOff();
    this.input.closePort();
    this.output.closePort();
    this.input.removeAllListeners('message');
    this.open = false;
  }

  /**
   * @inheritDoc
   */
  public eventNames(): Array<EventEmitter.EventNames<EventTypes>> {
    return [
      'ready',
      'rawMessage',
      'buttonDown',
      'buttonUp',
    ];
  }

  /**
   * Map the Launchpad output to a Button structure
   */
  public abstract parseButtonToXy(state: number, note: number): Button;

  /**
   * Determine the button number from any of the possible ways to specify a button
   */
  public abstract mapButtonFromXy(xy: ButtonIn): number;
}


/**
 * Make sure a color is a valid color in the palette
 */
export function validatePaletteColor(color: PaletteColor): PaletteColor {
  if (color < 0 || color > 63 || Math.floor(color) !== color) {
    throw new Error(`Not a valid palette color: ${color} (must be an int between 0..63)`);
  }
  return color;
}

/**
 * Make sure a color is a valid RGB color
 */
export function validateRgbColor(color: RgbColor): RgbColor {
  if (color.some(value => value > 1 || value < 0)) {
    throw new Error(`RGB color is invalid: ${color}, values must be between 0..1. (use colors.colorFromRGB as a helper)`);
  }
  return color;
}

export function isRgbColor(color: PaletteColor | RgbColor): color is RgbColor {
  return Array.isArray(color);
}
