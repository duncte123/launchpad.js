import { CONTROL_NOTE, NORMAL_NOTE } from '../../internal/utils.js';
import { BaseLaunchpad, BaseLaunchpadOptions } from '../base/BaseLaunchpad.js';
import { Button, ButtonIn, ButtonLayout, ColorIntensity, isButton, Mk1ButtonStyle, RgbColor, RgColor, Velocity } from '../base/ILaunchpad.js';

/* eslint-disable max-lines,no-extra-parens */

/** @since 3.4.0 */
export type LaunchpadMK1Options = BaseLaunchpadOptions;

/** @since 3.4.0 */
export class LaunchpadMK1 extends BaseLaunchpad {

  /**
   * Specifies the button layout of the Launchpad MK1 starting from top-left.
   *
   * Each value specifies the ID of the button.
   *
   * **NOTE**: On Launchpad MK1, button `[0, 0]` (on the top-left) and button `[8, 7]`
   *   both have ID `104`, which means that therefore either one of them, in this case
   *   button `[0, 0]`, can't be updated by specifying it's (not so unique) ID. You can
   *   only target button `[0, 0]` by specifying it's coordinates.
   *
   * Example:
   * - `lp.setButtonColor(104, color)` Targets button `104` at `[8, 7]`.
   * - `lp.setButtonColor([0, 0], color)` Targets button `104` at `[0, 0]`.
   */
  public static get BUTTONS(): ButtonLayout {
    /* eslint-disable array-bracket-spacing,no-multi-spaces */
    return [
      [104, 105, 106, 107, 108, 109, 110, 111 /**/],
      [  0,   1,   2,   3,   4,   5,   6,   7,   8],
      [ 16,  17,  18,  19,  20,  21,  22,  23,  24],
      [ 32,  33,  34,  35,  36,  37,  38,  39,  40],
      [ 48,  49,  50,  51,  52,  53,  54,  55,  56],
      [ 64,  65,  66,  67,  68,  69,  70,  71,  72],
      [ 80,  81,  82,  83,  84,  85,  86,  87,  88],
      [ 96,  97,  98,  99, 100, 101, 102, 103, 104],
      [112, 113, 114, 115, 116, 117, 118, 119, 120],
    ];
    /* eslint-enable array-bracket-spacing,no-multi-spaces */
  }

  public static readonly DEFAULT_DEVICE_NAME = /^Launchpad(?! .*)/;

  /** @param {LaunchpadMK1Options?} options */
  constructor(options?: Partial<LaunchpadMK1Options>) {
    super(options);
    this.openMidiDevice(this.options.deviceName ?? LaunchpadMK1.DEFAULT_DEVICE_NAME);
    this.setupMessageHandler();
  }

  /**
   * Method to set the color for a button on the Launchpad.
   *
   * The button can be specified as a button number (launchpad specific), an `[x, y]`
   *   value, or a `Button` object.
   *
   * The color can be either a velocity value returned by `lp.velocity()`,
   *   or an RG(B) tuple with values in range `0..1`.
   *
   * **NOTE**: On Launchpad MK1, button `[0, 0]` (on the top-left) and button `[8, 7]`
   *   both have ID `104`, which means that therefore either one of them, in this case
   *   button `[0, 0]`, can't be updated by specifying it's (not so unique) ID. You can
   *   only target button `[0, 0]` by specifying it's coordinates.
   *
   * Example:
   * - `lp.setButtonColor(104, color)` Targets button `104` at `[8, 7]`.
   * - `lp.setButtonColor([0, 0], color)` Targets button `104` at `[0, 0]`.
   *
   * @param button - The button to set the color for.
   * @param color
   * The color to set for the button.
   *
   * Limitations on Launchpad MK1:
   * - Only a limited number of colors can be displayed. See `type RgColor` for more information.
   * - The value for blue has no effect and can be omitted as there is no blue LED.
   * - There is no color palette, instead you can specify a `Velocity` value. See
   *     `type Velocity` for more information.
   * @param pulse - Specifies if the button should pulse.
   */
  public setButtonColor(button: ButtonIn, color: RgColor | RgbColor | Velocity, pulse: boolean = false): void {
    this.writeButtonColor(button, color, pulse);
  }

  /** @inheritDoc */
  public allOff(): void {
    // Resets the Launchpad
    this.sendSysEx(176, 0, 0);
  }

  /**
   * Method to pulse a button on the Launchpad between "off" and a specified color.
   *
   * The button can be specified as a button number (launchpad specific), an `[x, y]`
   *   value, or a `Button` object.
   *
   * The color can be either a velocity value returned by `lp.velocity()`,
   *   or an RG(B) tuple with values in range `0..1`.
   *
   * Limitations on Launchpad MK1:
   * - The behavior doesn't differ from using `pulse()`.
   * - See limitations on parameter `color` below.
   *
   * **NOTE**: On Launchpad MK1, button `[0, 0]` (on the top-left) and button `[8, 7]`
   *   both have ID `104`, which means that therefore either one of them, in this case
   *   button `[0, 0]`, can't be updated by specifying it's (not so unique) ID. You can
   *   only target button `[0, 0]` by specifying it's coordinates.
   *
   * Example:
   * - `lp.flash(104, color)` Targets button `104` at `[8, 7]`.
   * - `lp.flash([0, 0], color)` Targets button `104` at `[0, 0]`.
   *
   * @param button - The button to set the color for.
   * @param color
   * The color to set for the button.
   *
   * Limitations on Launchpad MK1:
   * - Only a limited number of colors can be displayed. See `type RgColor` for more information.
   * - The value for blue has no effect and can be omitted as there is no blue LED.
   * - There is no color palette, instead you can specify a `Velocity` value. See
   *     `type Velocity` for more information.
   */
  public flash(button: ButtonIn, color: RgColor | RgbColor | Velocity): void {
    this.writeButtonColor(button, color, true);
  }

  /** @inheritDoc */
  public mapButtonFromXy(xy: ButtonIn): number {

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
    // We multiply by 16 here because there's 16 (virtual) buttons in a row.
    return ((y - 1) * 16) + x;

  }

  /** @inheritDoc */
  public parseButtonToXy(state: number, note: number): Button {
    let xy: [number, number] = [-1, -1];

    // The top row is selected
    if (state === CONTROL_NOTE && note >= 104) {
      xy = [
        note - 104, // x
        0, // y
      ];
    }

    if (state === NORMAL_NOTE) {
      xy = [
        // we use divide and use the rest of 16 because
        // there's 16 (virtual) buttons in a row.
        note % 16, // x
        Math.floor(note / 16), // y
      ];
    }

    return {
      nr: note,
      xy
    };
  }

  /**
   * Method to pulse a button on the Launchpad between "off" and a specified color.
   *
   * The button can be specified as a button number (launchpad specific), an `[x, y]`
   *   value, or a `Button` object.
   *
   * The color can be either a velocity value returned by `lp.velocity()`,
   *   or an RG(B) tuple with values in range `0..1`.
   *
   * **NOTE**: On Launchpad MK1, button `[0, 0]` (on the top-left) and button `[8, 7]`
   *   both have ID `104`, which means that therefore either one of them, in this case
   *   button `[0, 0]`, can't be updated by specifying it's (not so unique) ID. You can
   *   only target button `[0, 0]` by specifying it's coordinates.
   *
   * Example:
   * - `lp.pulse(104, color)` Targets button `104` at `[8, 7]`.
   * - `lp.pulse([0, 0], color)` Targets button `104` at `[0, 0]`.
   *
   * @param button - The button to set the color for.
   * @param color
   * The color to set for the button.
   *
   * Limitations on Launchpad MK1:
   * - Only a limited number of colors can be displayed. See `type RgColor` for more information.
   * - The value for blue has no effect and can be omitted as there is no blue LED.
   * - There is no color palette, instead you can specify a `Velocity` value. See
   *     `type Velocity` for more information.
   */
  public pulse(button: ButtonIn, color: RgColor | RgbColor | Velocity): void {
    this.writeButtonColor(button, color, true);
  }

  /**
   * Method to update multiple buttons at once.
   *
   * Accepts a variable number of `Mk1ButtonStyle` objects.
   *
   * Limitations on Launchpad MK1:
   * - Uses different color values for styling, see `type Mk1Style` for more information.
   * - Only a limited number of colors can be displayed. See `type RgColor` for more information.
   * - The value for blue has no effect and can be omitted as there is no blue LED.
   * - There is no color palette, instead of a palette color value you can specify a `Velocity`
   *     value. See `type Velocity` for more information.
   *
   * **NOTE**: On Launchpad MK1, button `[0, 0]` (on the top-left) and button `[8, 7]`
   *   both have ID `104`, which means that therefore either one of them, in this case
   *   button `[0, 0]`, can't be updated by specifying it's (not so unique) ID. You can
   *   only target button `[0, 0]` by specifying it's coordinates.
   *
   * Example:
   * - `lp.setButtons({ button: 104, ... });` Targets button `104` at `[8, 7]`.
   * - `lp.setButtons({ button: [0, 0], ... })` Targets button `104` at `[0, 0]`.
   *
   * @param buttons The buttons to set.
   */
  public setButtons(...buttons: Mk1ButtonStyle[]): void {
    buttons.forEach((config) => {
      switch (config.style.style) {
      case 'flash':
        this.writeButtonColor(config.button, config.style.color, true, false);
        break;
      case 'palette':
      case 'velocity':
        this.writeButtonColor(config.button, config.style.color, false, false);
        break;
      case 'pulse':
        this.writeButtonColor(config.button, config.style.color, true, false);
        break;
      case 'rgb':
        this.writeButtonColor(config.button, config.style.rgb, false, false);
        break;
      case 'off':
      default:
        this.writeButtonColor(config.button, [0, 0], false, false);
      }
      this.restartFlashTimer();
    });
  }

  /**
   * Method to calculate a *Velocity* value.
   *
   * @param color
   * Either a `Velocity` value in range `0..63` or RG(B) tuple with values in range `0..1`.
   *
   * Notes:
   * - Only a limited number of colors can be displayed. See `type RgColor` for more information.
   * - The value for blue is omitted as there is no blue LED.
   * @param pulse - Specifies if the button should pulse, omitted if `color` contains a `Velocity` value.
   * @returns A `Velocity` value.
   */
  public velocity(color: Velocity): Velocity;
  public velocity(color: RgColor | RgbColor, pulse?: boolean): Velocity;
  public velocity(color: RgColor | RgbColor | Velocity, pulse?: boolean): Velocity;
  public velocity(color: RgColor | RgbColor | Velocity, pulse: boolean = false): Velocity {
    if (typeof color === 'number') {
      if (color < 0 || color > 63) {
        throw Error('Launchpad MK1 only accepts Velocity values in range 0..63!');
      }
      return color;
    }
    if (Math.max(color[0], color[1]) > 1 || Math.min(color[0], color[1]) < 0) {
      throw Error('Red/green color value must be within range 0..1!');
    }
    return (this.scaleColor(color[1]) * 16) + this.scaleColor(color[0]) + (pulse ? 8 : 12);
  }

  /** @inheritDoc */
  protected makeSysEx(payload: number[]): number[] {
    return payload;
  }

  protected restartFlashTimer(): void {
    this.sendSysEx(176, 0, 40);
  }

  /**
   * @param color - Color value in range `0..1`.
   * @returns A `ColorIntensity` value consumed by the device.
   *
   * @since 3.4.4
   */
  protected scaleColor(color: number): ColorIntensity {
    if (color <= 0) {
      return 0;
    } else if (color < (1 / 3)) { // 33%
      return 1;
    } else if (color < (1 / 1.5)) { // 66%
      return 2;
    }
    return 3;
  }

  protected writeButtonColor(button: ButtonIn, color: RgColor | RgbColor | Velocity, pulse: boolean = false, updatePulseTimer: boolean = true): void {
    const mappedButton = this.mapButtonFromXy(button);
    if (
      (Array.isArray(button) && button[1] === 0) ||
      (typeof button === 'number' && button > 104 && button < 112)
    ) {
      this.sendSysEx(176, mappedButton, this.velocity(color, pulse));
    } else {
      this.sendSysEx(144, this.mapButtonFromXy(button), this.velocity(color, pulse));
    }
    // Restart flash timer on the device
    if (pulse === true && updatePulseTimer === true) {
      this.restartFlashTimer();
    }
  }

}
