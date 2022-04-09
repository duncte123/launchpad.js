import { givenMidiDevices, mockedInput, mockedOutput } from './mocking-midi';
import { autoDetect, Button, colors, LaunchpadMK2, LaunchpadMK3, waitForReady } from '../src';

let lp: LaunchpadMK2;
beforeEach(async () => {
  givenMidiDevices(['Launchpad MK2']);
  lp = await waitForReady(new LaunchpadMK2());
  jest.clearAllMocks();
});


const HEADER = [240, 0, 32, 41, 2, 24];

describe('SysEx messages', () => {
  test('setButtonColor sends the right SysEx message given a button number', () => {
    // WHEN
    lp.setButtonColor(55, colors.defaultColors.red);

    // THEN
    expect(mockedOutput.sendMessage).toHaveBeenCalledWith([...HEADER,
      11, // setrgb
      55,
      63, 0, 0,
      247]);
  });

  test('flash sends the right SysEx message given a button number', () => {
    // WHEN
    lp.flash(55, 42);

    // THEN
    expect(mockedOutput.sendMessage).toHaveBeenCalledWith([...HEADER,
      35, 0, // flash
      55,
      42,
      247]);
  });

  test('pulse sends the right SysEx message given a button number', () => {
    // WHEN
    lp.pulse(55, 42);

    // THEN
    expect(mockedOutput.sendMessage).toHaveBeenCalledWith([...HEADER,
      40, 0, // pulse
      55,
      42,
      247]);
  });
});

describe('x/y mapping', () => {
  test('setButtonColor addresses the grid correctly', () => {
    // WHEN
    lp.setButtonColor([3, 3], colors.defaultColors.red);

    // THEN
    expect(mockedOutput.sendMessage).toHaveBeenCalledWith([...HEADER,
      11, // setrgb
      64, // 0-base (3, 3) from the top-left is 1-base (6, 4) from bottom-left
      63, 0, 0,
      247]);
  });

  test('setButtonColor addresses the top row correctly', () => {
    // WHEN
    lp.setButtonColor([3, 0], colors.defaultColors.red);

    // THEN
    expect(mockedOutput.sendMessage).toHaveBeenCalledWith([...HEADER,
      11, // setrgb
      107, // top row is addressed starting at 104, for some reason
      63, 0, 0,
      247]);
  });
});

describe('events', () => {
  test('buttonDown grid', async () => {
    const buttonDown = new Promise<Button>(ok => lp.once('buttonDown', ok));
    mockedInput.emit('message', 0, [
      144, // Normal note
      64,  // nr
      1]); // down
    const button = await buttonDown;

    expect(button).toEqual({
      nr: 64,
      xy: [3, 3],
    });
  });

  test('buttonDown top row', async () => {
    const buttonDown = new Promise<Button>(ok => lp.once('buttonDown', ok));
    mockedInput.emit('message', 0, [
      176, // Control note
      107, // Nr
      1]); // Down
    const button = await buttonDown;

    expect(button).toEqual({
      nr: 107,
      xy: [3, 0],
    });
  });

  test('buttonUp', async () => {
    const buttonUp = new Promise<Button>(ok => lp.once('buttonUp', ok));
    mockedInput.emit('message', 0, [144, 64, 0]);
    const button = await buttonUp;

    expect(button).toEqual({
      nr: 64,
      xy: [3, 3],
    });
  });
});