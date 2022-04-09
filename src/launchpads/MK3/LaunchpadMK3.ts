import { BaseLaunchpad, BaseLaunchpadOptions, isRgbColor, validatePaletteColor, validateRgbColor } from '../base/BaseLaunchpad.js';
import { Button, ButtonIn, isButton, PaletteColor, RgbColor } from '../base/ILaunchpad.js';
import { ButtonColor } from './ButtonColor.js';
import { SysEx } from './SysEx.js';

export type LaunchpadMK3Options = BaseLaunchpadOptions;

export class LaunchpadMK3 extends BaseLaunchpad {
  public static readonly DEFAULT_DEVICE_NAME = /^Launchpad.*MK3 MIDI/;

  /**
   *
   * @param {LaunchpadMK3Options?} options
   */
  constructor(options?: LaunchpadMK3Options) {
    super(options);

    // The LP advertises both MIDI and DAW interfaces, but only
    // the MIDI interface reports button presses.
    this.openMidiDevice(options?.deviceName ?? LaunchpadMK3.DEFAULT_DEVICE_NAME);

    this.setupMessageHandler();

    // Switch to programmer mode mode (full control of all buttons)
    this.sendSysEx(...SysEx.setProgrammerMode(true));
    this.sendSysEx(...SysEx.setBrightness(1));
  }

  /**
   * @inheritDoc
   */
  protected makeSysEx(payload: number[]): number[] {
    return [240, 0, 32, 41, 2, 13, ...payload, 247];
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
      const [r, g, b] = scaleRgbMk3(color);
      this.sendSysEx(...SysEx.setButtonColors(ButtonColor.rgb(buttonMapped, r, g, b)));
    } else {
      this.sendSysEx(...SysEx.setButtonColors(ButtonColor.staticColor(buttonMapped, validatePaletteColor(color))));
    }
  }

  /**
   * @inheritDoc
   */
  flash(button: ButtonIn, color: number, colorB: number = 0): void {
    const buttonMapped = this.mapButtonFromXy(button);

    this.sendSysEx(...SysEx.setButtonColors(ButtonColor.flash(
      buttonMapped,
      validatePaletteColor(color),
      validatePaletteColor(colorB)
    )));
  }

  /**
   * @inheritDoc
   */
  pulse(button: ButtonIn, color: number): void {
    const buttonMapped = this.mapButtonFromXy(button);

    this.sendSysEx(...SysEx.setButtonColors(ButtonColor.pulse(
      buttonMapped,
      validatePaletteColor(color)
    )));
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
    const row = Math.floor(note / 10);
    const col = (note - 1) % 10;

    return {
      nr: note,
      xy: [col, 9 - row],
    };
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
    return (9 - y) * 10 + x + 1;
  }
}

function scaleRgbMk3(color: RgbColor): RgbColor {
  return validateRgbColor(color).map(v => Math.round(v * 127)) as RgbColor;
}
