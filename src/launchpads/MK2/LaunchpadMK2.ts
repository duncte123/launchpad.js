import { CONTROL_NOTE, NORMAL_NOTE } from '../../utils.js';
import { BaseLaunchpad, BaseLaunchpadOptions, groupByStyle, isRgbColor, validatePaletteColor, validateRgbColor } from '../base/BaseLaunchpad.js';
import { Button, ButtonIn, ButtonStyle, isButton, PaletteColor, RgbColor } from '../base/ILaunchpad.js';

export type LaunchpadMK2Options = BaseLaunchpadOptions;

export class LaunchpadMK2 extends BaseLaunchpad {
  public static readonly DEFAULT_DEVICE_NAME = /^Launchpad MK2/;

  /**
   * @param {LaunchpadMK2Options?} options
   */
  constructor(options?: LaunchpadMK2Options) {
    super(options);

    this.openMidiDevice(this.options.deviceName ?? LaunchpadMK2.DEFAULT_DEVICE_NAME);

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
  setButtonColor(button: ButtonIn, color: RgbColor | PaletteColor): void {
    if (typeof color !== 'number' && (!Array.isArray(color) || color.length !== 3)) {
      throw new Error('Invalid color settings supplied');
    }

    const buttonMapped = this.mapButtonFromXy(button);

    if (isRgbColor(color)) {
      this.sendSysEx(11, buttonMapped, ...scaleRgbMk2(color));
    } else {
      this.sendSysEx(10, buttonMapped, validatePaletteColor(color));
    }
  }

  /**
   * @inheritDoc
   */
  flash(button: ButtonIn, color: number): void {
    const buttonMapped = this.mapButtonFromXy(button);

    this.sendSysEx(35, 0, buttonMapped, validatePaletteColor(color));
  }

  /**
   * @inheritDoc
   */
  pulse(button: ButtonIn, color: number): void {
    const buttonMapped = this.mapButtonFromXy(button);

    this.sendSysEx(40, 0, buttonMapped, validatePaletteColor(color));
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
  parseButtonToXy(state: number, note: number): Button {
    // The top row is selected
    let xy: [number, number] = [-1, -1];

    if (state === CONTROL_NOTE && note >= 104) {
      xy = [
        note - 104, // x
        0, // y
      ];
    }

    if (state === NORMAL_NOTE) {
      xy = [
        // % 10 is because we want to have one more than the buttons in one row
        // that way we get a number from 1 - 9
        (note - 1) % 10, // x
        Math.floor((99 - note) / 10), // y
      ];
    }

    return { nr: note,
      xy };
  }

  /**
   * @inheritDoc
   */
  mapButtonFromXy(xy: ButtonIn): number {
    if (isButton(xy)) {
      return xy.nr;
    }

    if (typeof xy === 'number') {
      return xy;
    }

    const [x, y] = xy;

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

function scaleRgbMk2(color: RgbColor): RgbColor {
  return validateRgbColor(color).map(v => Math.round(v * 63)) as RgbColor;
}
