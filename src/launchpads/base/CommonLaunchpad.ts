import EventEmitter from 'eventemitter3';
import midi from 'midi';
import { findDevice, onExit } from '../../utils';
import BaseLaunchpad, { BaseLaunchpadOptions, EventTypes } from './BaseLaunchpad';
import { Button, ButtonIn } from './types';

/**
 * Shared implementation between multiple Launchpad types
 *
 * This should probably be BaseLaunchpad, but it seems
 * BaseLaunchpad is purposely an abstract class and I didn't
 * want to mess with that design too much.
 */
export abstract class CommonLaunchpad extends BaseLaunchpad {
  protected readonly input = new midi.Input();
  protected readonly output = new midi.Output();

  constructor(protected readonly options: BaseLaunchpadOptions = {}) {
    super();
  }

  /**
   * @inheritDoc
   */
  public send(message: number[]): void;
  public send(...message: number[]): void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public send(...message: any[]): void {
    this.logDebug('Sending midi message', message);
    this.output.sendMessage(Array.isArray(message[0]) ? message[0] : message as number[]);
  }

  /**
   * @inheritDoc
   */
  public sendSysEx(message: number[]): void;
  public sendSysEx(...message: number[]): void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public sendSysEx(...message: any[]): void {
    const arrayParsed = Array.isArray(message[0]) ? message[0] : message;
    const sysExMessage = this.makeSysEx(arrayParsed);
    this.logDebug('Sending sysExMessage', sysExMessage);

    this.output.sendMessage(sysExMessage);
  }


  /**
   * Make a SysEx message from the given payload
   *
   * (Wrap the payload with the necessary bytes)
   */
  protected abstract makeSysEx(payload: number[]): number[];

  protected openMidiDevice(deviceName: RegExp): void {
    const [inputPort, outputPort] = [
      findDevice(deviceName, this.input),
      findDevice(deviceName, this.output),
    ];

    onExit(() => this.closePorts());

    this.output.openPort(outputPort);
    this.input.openPort(inputPort);

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
   * @inheritDoc
   */
  public closePorts(): void {
    this.logDebug('Closing ports');

    this.allOff();
    this.input.closePort();
    this.output.closePort();
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

  public abstract parseButtonToXy(state: number, note: number): Button;
  public abstract mapButtonFromXy(xy: ButtonIn): number;
}
