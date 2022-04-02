import { CONTROL_NOTE, NORMAL_NOTE } from '../../utils.js';
import { BaseLaunchpadOptions } from '../base/BaseLaunchpad.js';
import { minMaxColor } from '../../colorHelpers.js';
import { CommonLaunchpad } from '../base/CommonLaunchpad.js';

export type LaunchpadMK2Options = BaseLaunchpadOptions;

export class LaunchpadMK2 extends CommonLaunchpad {

  /**
   * @param {LaunchpadMK2Options?} options
   */
  constructor(options?: LaunchpadMK2Options) {
    super(options);

    this.openMidiDevice(this.options.deviceName ?? /^Launchpad MK2/);

    // put the launchpad into session mode
    this.sendSysEx(34, 0);

    this.setupMessageHandler();
  }

  /**
   * @inheritDoc
   */
  protected makeSysEx(payload: number[]): number[] {
    return [240, 0, 32, 41, 2, 24, ...payload, 247];
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
}
