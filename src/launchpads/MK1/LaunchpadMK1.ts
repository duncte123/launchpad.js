import { CONTROL_NOTE, NORMAL_NOTE } from '../../internal/utils.js';
import { BaseLaunchpad, BaseLaunchpadOptions } from '../base/BaseLaunchpad.js';
import { Button, ButtonIn, ButtonLayout, ButtonStyle, isButton, RgbColor, RgColor, Velocity } from '../base/ILaunchpad.js';

/* eslint-disable no-extra-parens */

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
   *   or an RG(B) tuple where the values for red and green are in range `0..3`.
   *   The value for blue has no effect on Launchpad MK1.
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
   * @param color  - The color to set for the button.
   * @param flash  - Specifies if the button should flash.
   */
  public setButtonColor(button: ButtonIn, color: RgColor | RgbColor | Velocity, flash: boolean = false): void {
    this.writeButtonColor(button, color, flash);
  }

  /** @inheritDoc */
  public allOff(): void {
    // Resets the Launchpad
    this.sendSysEx(176, 0, 0);
  }

  /**
   * Method to flash a button on the Launchpad in a specified color.
   *
   * The button can be specified as a button number (launchpad specific), an `[x, y]`
   *   value, or a `Button` object.
   *
   * The color can be either a velocity value returned by `lp.velocity()`,
   *   or an RG(B) tuple where the values for red and green are in range `0..3`.
   *   The value for blue has no effect on Launchpad MK1.
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
   * @param color  - The color to set for the button.
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
   * Method to flash a button on the Launchpad in a specified color.
   *
   * The button can be specified as a button number (launchpad specific), an `[x, y]`
   *   value, or a `Button` object.
   *
   * The color can be either a velocity value returned by `lp.velocity()`,
   *   or an RG(B) tuple where the values for red and green are in range `0..3`.
   *   The value for blue has no effect on Launchpad MK1.
   *
   * **NOTE**: This behavior doesn't differ from using `lp.flash()` on Launchpad MK1.
   *
   * **NOTE**: On Launchpad MK1, button `[0, 0]` (on the top-left) and button `[8, 7]`
   *   both have ID `104`, which means that therefore either one of them, in this case
   *   button `[0, 0]`, can't be updated by specifying it's (not so unique) ID. You can
   *   only target button `[0, 0]` by specifying it's coordinates.
   *
   * Example:
   * - `lp.pulse(104, color)` Targets button `104` at `[8, 7]`.
   * - `lp.pulse([0, 0], color)` Targets button `104` at `[0, 0]`.
   */
  public pulse(button: ButtonIn, color: RgColor | RgbColor | Velocity): void {
    this.writeButtonColor(button, color, true);
  }

  /**
   * Method to update multiple buttons at once.
   *
   * Accepts a variable number of `ButtonStyle` objects.
   *
   * **NOTE**: On Launchpad MK1, button `[0, 0]` (on the top-left) and button `[8, 7]`
   *   both have ID `104`, which means that therefore either one of them, in this case
   *   button `[0, 0]`, can't be updated by specifying it's (not so unique) ID. You can
   *   only target button `[0, 0]` by specifying it's coordinates.
   *
   * Example:
   * - `lp.setButtons({ button: 104, ... });` Targets button `104` at `[8, 7]`.
   * - `lp.setButtons({ button: [0, 0], ... })` Targets button `104` at `[0, 0]`.
   */
  public setButtons(...buttons: ButtonStyle[]): void {
    buttons.forEach((config) => {
      switch (config.style.style) {
      case 'flash':
        this.writeButtonColor(config.button, config.style.color, true, false);
        break;
      case 'palette':
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
   * @param color - Either a velocity value (`0..63`) or RG(B) color (`[0..3, 0..3[, number]]`)
   * @param flash - Specifies if the button should flash.
   * @returns A *Velocity* value.
   */
  public velocity(color: Velocity): Velocity;
  public velocity(color: RgColor | RgbColor, flash?: boolean): Velocity;
  public velocity(color: RgColor | RgbColor | Velocity, flash?: boolean): Velocity;
  public velocity(color: RgColor | RgbColor | Velocity, flash: boolean = false): Velocity {
    if (typeof color === 'number') {
      if (color < 0 || color > 63) {
        throw Error('Color value must be within range 0..63!');
      }
      return color;
    }
    if (Math.max(color[0], color[1]) > 3) {
      throw Error('Red/green color value must be within range 0..3!');
    }
    return (color[1] * 16) + color[0] + (flash ? 8 : 12);
  }

  /** @inheritDoc */
  protected makeSysEx(payload: number[]): number[] {
    return payload;
  }

  protected restartFlashTimer(): void {
    this.sendSysEx(176, 0, 40);
  }

  protected writeButtonColor(button: ButtonIn, color: RgColor | RgbColor | Velocity, flash: boolean = false, updateFlashTimer: boolean = true): void {
    const mappedButton = this.mapButtonFromXy(button);
    if (
      (Array.isArray(button) && button[1] === 0) ||
      (typeof button === 'number' && button > 104 && button < 112)
    ) {
      this.sendSysEx(176, mappedButton, this.velocity(color, flash));
    } else {
      this.sendSysEx(144, this.mapButtonFromXy(button), this.velocity(color, flash));
    }
    // Restart flash timer on the device
    if (flash === true && updateFlashTimer === true) {
      this.restartFlashTimer();
    }
  }

}
