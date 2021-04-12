import midi from 'midi';

export const NORMAL_NOTE = 144;
export const CONTROL_NOTE = 176;

export function onExit(fn: () => void): void {
  let manualExit = false;
  const doExit = makeExitHandler(true);

  process.on('exit', makeExitHandler());
  process.on('SIGINT', doExit);
  process.on('uncaughtException', (e) => {
    // eslint-disable-next-line no-console
    console.error(e);
    doExit();
  });

  // https://github.com/remy/nodemon#controlling-shutdown-of-your-script
  process.once('SIGUSR2', () => {
    fn();
    process.kill(process.pid, 'SIGUSR2');
  });

  function makeExitHandler(exit: boolean = false) {
    return (): void => {
      if (!manualExit) {
        process.stdout.write('\n');
        fn();
      }

      if (exit) {
        manualExit = true;
        process.exit();
      }
    };
  }
}

export function findDevice(regex: RegExp, midiInput: midi.Input): number {
  for (let i = 0; i < midiInput.getPortCount(); i++) {
    const name = midiInput.getPortName(i);

    if (regex.test(name)) {
      return i;
    }
  }

  // return -1 if no ports are found
  return -1;
}
