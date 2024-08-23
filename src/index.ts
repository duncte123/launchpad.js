import SegfaultHandler from 'segfault-handler';

export * from './launchpads/MK1/LaunchpadMK1.js';
export * from './launchpads/MK2/LaunchpadMK2.js';
export * from './launchpads/MK3/LaunchpadMK3.js';
export * from './launchpads/dummy/DummyLaunchpad.js';
export * from './launchpads/base/ILaunchpad.js';
export * from './launchpads/autoDetect.js';
export * from './launchpadHelpers.js';
export * as colors from './colorHelpers.js';
export * from './surface/ILayer.js';
export * from './surface/Surface.js';
export * from './surface/Drawing.js';

// Midi uses native code, so just in case
SegfaultHandler.registerHandler('launchpad-js-crash.log');
