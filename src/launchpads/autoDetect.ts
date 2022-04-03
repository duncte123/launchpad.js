import midi from 'midi';
import { allDeviceNames } from '../utils';
import BaseLaunchpad from './base/BaseLaunchpad';
import { LaunchpadMK2 } from './MK2/LaunchpadMK2';
import { LaunchpadMK3 } from './MK3/LaunchpadMK3';

export interface AutoDetectOptions {

  /**
   * Switch on debug mode
   *
   * Will log more messages to the console.
   *
   * @default false
   */
  readonly debug?: boolean;

  /**
   * Switch on X/Y mode
   *
   * In X/Y mode, buttons are represented as [x, y]
   * arrays (instead of raw button numbers).
   *
   * @default false
   */
  readonly xyMode?: boolean;
}

export function autoDetect(options?: AutoDetectOptions): BaseLaunchpad {
  const inputNames = allDeviceNames(new midi.Input());
  const outputNames = allDeviceNames(new midi.Output());

  if (canFindBoth(LaunchpadMK2.DEFAULT_DEVICE_NAME)) {
    return new LaunchpadMK2(options);
  }

  if (canFindBoth(LaunchpadMK3.DEFAULT_DEVICE_NAME)) {
    return new LaunchpadMK3(options);
  }

  throw new Error(`Did not find supported Launchpads among MIDI devices: ${inputNames.join(', ') ?? '(none)'}`);

  function canFindBoth(regex: RegExp): boolean {
    return inputNames.some(n => n.match(regex)) && outputNames.some(n => n.match(regex));
  }
}
