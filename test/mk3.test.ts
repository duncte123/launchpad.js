/* eslint-disable object-property-newline */
/* eslint-disable init-declarations */
/* eslint-disable max-lines-per-function */
/* eslint-disable no-promise-executor-return */
import { givenMidiDevices, mockedInput, mockedOutput } from './mocking-midi';
import { Button, colors, LaunchpadMK3, waitForReady } from '../src';

let lp: LaunchpadMK3;
beforeEach(async () => {
  givenMidiDevices(['Launchpad MK3 MIDI']);
  lp = await waitForReady(new LaunchpadMK3());
  jest.clearAllMocks();
});

afterEach(() => {
  lp.close();
});

const HEADER = [240, 0, 32, 41, 2, 13]; // Different from MK2!

describe('SysEx messages', () => {
  test('setButtonColor sends the right SysEx message given a button number', () => {
    // WHEN
    lp.setButtonColor(55, colors.defaultColors.red);

    // THEN
    expect(mockedOutput.sendMessage).toHaveBeenCalledWith([
      ...HEADER,
      3, // led
      3, // rgb
      55,
      127, 0, 0,
      247
    ]);
  });

  test('setButtonColor sends the right SysEx message given a palette color', () => {
    // WHEN
    lp.setButtonColor(55, 42);

    // THEN
    expect(mockedOutput.sendMessage).toHaveBeenCalledWith([
      ...HEADER,
      3, // led
      0, // palette
      55,
      42,
      247
    ]);
  });

  test('flash sends the right SysEx message given a button number', () => {
    // WHEN
    lp.flash(55, 42);

    // THEN
    expect(mockedOutput.sendMessage).toHaveBeenCalledWith([
      ...HEADER,
      3, // led
      1, // flash
      55,
      0, // colorB
      42, // colorA
      247
    ]);
  });

  test('flash supports 2 colors', () => {
    // WHEN
    lp.flash(55, 42, 1);

    // THEN
    expect(mockedOutput.sendMessage).toHaveBeenCalledWith([
      ...HEADER,
      3, // led
      1, // flash
      55,
      1, // colorB
      42, // colorA
      247
    ]);
  });

  test('pulse sends the right SysEx message given a button number', () => {
    // WHEN
    lp.pulse(55, 42);

    // THEN
    expect(mockedOutput.sendMessage).toHaveBeenCalledWith([
      ...HEADER,
      3, // led
      2, // pulse
      55,
      42,
      247
    ]);
  });

  test('setting multiple buttons at once', () => {
    lp.setButtons(
      { button: 49, style: { style: 'palette', color: 42 } },
      { button: 51, style: { style: 'palette', color: 42 } },
      { button: 52, style: { style: 'rgb', rgb: [1, 0, 1] } },
      { button: 53, style: { style: 'flash', color: 42 } },
      { button: 54, style: { style: 'pulse', color: 42 } },
      { button: 55, style: { style: 'flash', color: 42 } },
    );

    expect(mockedOutput.sendMessage).toBeCalledWith([
      ...HEADER,
      3, // set led
      0, 49, 42, // palette
      0, 51, 42, // palette
      3, 52, 127, 0, 127, // rgb
      1, 53, 0, 42, // flash
      2, 54, 42, // pulse
      1, 55, 0, 42, // flash
      247,
    ]);
  });
});

describe('x/y mapping', () => {
  test('setButtonColor addresses the grid correctly', () => {
    // WHEN
    lp.setButtonColor([3, 3], colors.defaultColors.red);

    // THEN
    expect(mockedOutput.sendMessage).toHaveBeenCalledWith([
      ...HEADER,
      3, // led
      3, // rgb
      64, // 0-base (3, 3) from the top-left is 1-base (6, 4) from bottom-left
      127, 0, 0,
      247
    ]);
  });

  test('setButtonColor addresses the top row correctly', () => {
    // WHEN
    lp.setButtonColor([3, 0], colors.defaultColors.red);

    // THEN
    expect(mockedOutput.sendMessage).toHaveBeenCalledWith([
      ...HEADER,
      3, // led
      3, // rgb
      94, // 0-base (3, 0) from the top-left is 1-base (9, 4) from bottom left
      127, 0, 0, // rgb
      247
    ]);
  });
});

describe('events', () => {
  test('buttonDown grid', async () => {
    const buttonDown = new Promise<Button>(ok => lp.once('buttonDown', ok));
    mockedInput.emit('message', 0, [
      144, // Normal note
      64, // nr
      1
    ]); // down
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
      94, // Nr
      1
    ]); // Down
    const button = await buttonDown;

    expect(button).toEqual({
      nr: 94,
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
