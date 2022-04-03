if (module.require.cache[require.resolve('midi')]) {
  throw new Error('Import \'mocking-midi\' before importing anything else in your test');
}

jest.mock('midi');
import * as midi from 'midi';

const mockedInput = jest.mocked(new midi.Input(), true);
const mockedOutput = jest.mocked(new midi.Output(), true);

jest.mocked(midi.Input).mockImplementation(() => {
  console.log('xyz');
  return mockedInput;
});
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

