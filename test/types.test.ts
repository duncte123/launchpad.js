import { givenMidiDevices } from './mocking-midi';
import { autoDetect, LaunchpadMK2, LaunchpadMK3 } from '../src';

// These tests only need to compile, they don't actually
// need to run, so there are no asserts in here.
//
// However, they run anyway, so we need to pretend to at least
// have some midi devices.
givenMidiDevices([
  'Launchpad MK2',
  'Launchpad Mini MK3 MIDI',
]);

describe('setButtonColor accepts a number', () => {
  test('MK2', () => {
    const lp = new LaunchpadMK2();
    lp.setButtonColor(10, [1, 2, 3]);
  });
  test('MK3', () => {
    const lp = new LaunchpadMK3();
    lp.setButtonColor(10, [1, 2, 3]);
  });
  test('autoDetect', () => {
    const lp = autoDetect();
    lp.setButtonColor(10, [1, 2, 3]);
  });
});

describe('setButtonColor accepts coordinates', () => {
  test('MK2', () => {
    const lp = new LaunchpadMK2();
    lp.setButtonColor([0, 0], [1, 2, 3]);
  });
  test('MK3', () => {
    const lp = new LaunchpadMK3();
    lp.setButtonColor([0, 0], [1, 2, 3]);
  });
  test('autoDetect', () => {
    const lp = autoDetect();
    lp.setButtonColor([0, 0], [1, 2, 3]);
  });
});

describe('setButtonColor accepts whatever comes out of the event handler', () => {
  test('MK2', () => {
    const lp = new LaunchpadMK2();
    lp.on('buttonDown', b => lp.setButtonColor(b, [1, 2, 3]));
  });
  test('MK3', () => {
    const lp = new LaunchpadMK3();
    lp.on('buttonDown', b => lp.setButtonColor(b, [1, 2, 3]));
  });
  test('autoDetect', () => {
    const lp = autoDetect();
    lp.on('buttonDown', b => lp.setButtonColor(b, [1, 2, 3]));
  });
});
