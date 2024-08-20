import midi from 'midi';
import { allDeviceNames } from '../internal/utils.js';
import { ILaunchpad } from './base/ILaunchpad.js';
import { LaunchpadMK1 } from './MK1/LaunchpadMK1.js';
import { LaunchpadMK2 } from './MK2/LaunchpadMK2.js';
import { LaunchpadMK3 } from './MK3/LaunchpadMK3.js';

export interface AutoDetectOptions {

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
 * Scan the MIDI devices and return the Launchpad implementation matching the detected devices
 *
 * Throws an error if no supported Launchpad device is detected.
 */
export function autoDetect<Launchpad extends ILaunchpad = ILaunchpad>(options?: AutoDetectOptions): Launchpad {
  const inputNames = allDeviceNames(new midi.Input());
  const outputNames = allDeviceNames(new midi.Output());

  if (canFindBoth(LaunchpadMK1.DEFAULT_DEVICE_NAME)) {
    return new LaunchpadMK1(options) as unknown as Launchpad; // #TODO: Remove casting to "unknown" :-/
  }

  if (canFindBoth(LaunchpadMK2.DEFAULT_DEVICE_NAME)) {
    return new LaunchpadMK2(options) as unknown as Launchpad; // #TODO: Remove casting to "unknown" :-/
  }

  if (canFindBoth(LaunchpadMK3.DEFAULT_DEVICE_NAME)) {
    return new LaunchpadMK3(options) as unknown as Launchpad; // #TODO: Remove casting to "unknown" :-/
  }

  throw new Error(`Did not find supported Launchpads among MIDI devices: ${inputNames.join(', ') || '(none)'}`);

  function canFindBoth(regex: RegExp): boolean {
    return inputNames.some(n => n.match(regex)) && outputNames.some(n => n.match(regex));
  }
}
