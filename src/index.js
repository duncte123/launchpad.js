import SegfaultHandler from 'segfault-handler';

import LaunchpadMK2 from './launchpads/MK2/LaunchpadMK2.js';
import BaseLaunchpad from './launchpads/BaseLaunchpad.js';

// Midi uses native code, so just in case
SegfaultHandler.registerHandler('launchpad-js-crash.log');

export default {
  BaseLaunchpad,
  LaunchpadMK2,
};
