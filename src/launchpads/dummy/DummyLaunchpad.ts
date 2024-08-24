import { CONTROL_NOTE, NORMAL_NOTE } from '../../internal/utils.js';
import { BaseLaunchpad, BaseLaunchpadOptions } from '../base/BaseLaunchpad';
import { Button, ButtonIn, ButtonStyle, isButton, PaletteColor, RgbColor } from '../base/ILaunchpad';

/**
 * A dummy launchpad that has the size of a mk2
 */
export class DummyLaunchpad extends BaseLaunchpad {
  constructor(options?: Partial<BaseLaunchpadOptions>) {
    super(options);
  }

  allOff(): void {
    this.logCall('allOff');
  }

  flash(button: ButtonIn, color: number, color2?: number): void {
    this.logCall('flash', button, color, color2);
  }

  protected makeSysEx(payload: number[]): number[] {
    this.logCall('makeSysEx', payload);
    return [];
  }

  mapButtonFromXy(xy: ButtonIn): number {
    if (isButton(xy)) {
      return xy.nr;
    }

    if (typeof xy === 'number') {
      return xy;
    }

    const [x, y] = xy;

    if (y === 0) {
      return x + 104;
    }

    // eslint-disable-next-line no-extra-parens
    return 91 - (10 * y) + x;
  }

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

    return { nr: note, xy };
  }

  pulse(button: ButtonIn, color: number): void {
    this.logCall('pulse', button, color);
  }

  setButtonColor(button: ButtonIn, color: RgbColor | PaletteColor): void {
    this.logCall('setButtonColor', button, color);
  }

  setButtons(...buttons: ButtonStyle[]): void {
    this.logCall('setButtons', buttons);
  }


  private logCall(method: string, ...args: any[]): void {
    console.log(`[Dummy Launchpad] ${method}:`, ...args);
  }
}
