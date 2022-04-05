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
export const mockedInput: jest.MockedObject<midi.Input> = Object.assign(
  new EventEmitter(),
  {
    getPortCount: jest.fn(),
    getPortName: jest.fn(),
    openPort: jest.fn(),
  }) as any;

jest.mocked(midi.Input).mockReturnValue(mockedInput);
jest.mocked(midi.Output).mockReturnValue(mockedOutput);

/**
 * Pretend the given MIDI devices are reported by the midi module
 */
export function givenMidiDevices(names: string[]) {
  mockedInput.getPortCount.mockReturnValue(names.length);
  mockedOutput.getPortCount.mockReturnValue(names.length);

  // These values look the wrong way around but this is what
  // they look like in practice.
  mockedInput.getPortName.mockImplementation(i => `${names[i]} Out`);
  mockedOutput.getPortName.mockImplementation(i => `${names[i]} In`);
}

