import SegfaultHandler from 'segfault-handler';

export * from './launchpads/MK2/LaunchpadMK2.js';
export * from './launchpads/BaseLaunchpad.js';
export * as colors from './colorHelpers.js';
export * as utils from './utils.js';

// Midi uses native code, so just in case
SegfaultHandler.registerHandler('launchpad-js-crash.log');
