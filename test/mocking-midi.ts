if (module.require.cache[require.resolve('midi')]) {
  throw new Error('Import \'mocking-midi\' before importing anything else in your test');
}

jest.mock('midi');
import * as midi from 'midi';
import { EventEmitter } from 'stream';


// mockedOutput is a simple mock object
export const mockedOutput = jest.mocked(new midi.Output(), true);

// mockedInput is ugly: it's a REAL event emitter with some
// mock functions added on top
// eslint-disable-next-line init-declarations
export let mockedInput: jest.MockedObject<midi.Input>;
jest.mocked(midi.Output).mockReturnValue(mockedOutput);

/**
 * Reset the mocked MIDI Input to a fresh EventEmitter
 */
export function resetMockedInput(): void {
  mockedInput = Object.assign(
    new EventEmitter(),
    {
      getPortCount: jest.fn(),
      getPortName: jest.fn(),
      openPort: jest.fn(),
      closePort: jest.fn(),
    }
  ) as any;
  jest.mocked(midi.Input).mockReturnValue(mockedInput);
}

resetMockedInput();

/**
 * Pretend the given MIDI devices are reported by the midi module.
 *
 * This function needs to be called in the `beforeEach()` of every
 * test to reset the mocks.
 */
export function givenMidiDevices(names: string[]): void {
  resetMockedInput();

  mockedInput.getPortCount.mockReturnValue(names.length);
  mockedOutput.getPortCount.mockReturnValue(names.length);

  // These values look the wrong way around but this is what
  // they look like in practice.
  mockedInput.getPortName.mockImplementation(i => `${names[i]} Out`);
  mockedOutput.getPortName.mockImplementation(i => `${names[i]} In`);
}

