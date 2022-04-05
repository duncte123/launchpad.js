import SegfaultHandler from 'segfault-handler';

export * from './launchpads/MK2/LaunchpadMK2';
export * from './launchpads/MK3/LaunchpadMK3';
export * from './launchpads/base/ILaunchpad';
export * from './launchpads/autoDetect';
export * from './launchpadHelpers';
export * as colors from './colorHelpers';
export * as utils from './utils';

// Midi uses native code, so just in case
SegfaultHandler.registerHandler('launchpad-js-crash.log');
