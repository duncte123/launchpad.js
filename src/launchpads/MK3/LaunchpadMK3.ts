import { range } from '../../internal/utils.js';
import { BaseLaunchpad, BaseLaunchpadOptions, isRgbColor, validatePaletteColor, validateRgbColor } from '../base/BaseLaunchpad.js';
import { Button, ButtonIn, ButtonStyle, isButton, PaletteColor, RgbColor } from '../base/ILaunchpad.js';
import { ButtonColor } from './ButtonColor.js';
import { SysEx } from './SysEx.js';

export type LaunchpadMK3Options = BaseLaunchpadOptions;

export class LaunchpadMK3 extends BaseLaunchpad {
  public static readonly DEFAULT_DEVICE_NAME = /^Launchpad.*MK3 MIDI|^MIDI.* \(LP.*MK3 MIDI\)/

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
  public setButtons(...buttons: ButtonStyle[]): void {
    if (buttons.length === 0) {
      return;
    }

    this.sendSysEx(...SysEx.setButtonColors(...buttons.map((b): number[] => {
      const button = this.mapButtonFromXy(b.button);

      switch (b.style.style) {
      case 'palette':
        return ButtonColor.staticColor(button, validatePaletteColor(b.style.color));
      case 'off':
        return ButtonColor.staticColor(button, 0);
      case 'rgb':
        return ButtonColor.rgb(button, ...scaleRgbMk3(b.style.rgb));
      case 'flash':
        return ButtonColor.flash(
          button,
          validatePaletteColor(b.style.color),
          validatePaletteColor(b.style.colorB ?? 0)
        );
      case 'pulse':
        return ButtonColor.pulse(button, validatePaletteColor(b.style.color));
      default:
        throw new Error('Missing style');
      }
    })));
  }

  /**
   * @inheritDoc
   */
  allOff(): void {
    this.setButtons(...range(9).flatMap(y => range(9).map(x => ({
      button: [x, y],
      // eslint-disable-next-line object-property-newline
      style: { style: 'palette', color: 0 },
    } as ButtonStyle))));
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
