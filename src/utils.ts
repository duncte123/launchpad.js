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
  const ports = range(midiInput.getPortCount()).map(i => midiInput.getPortName(i));
  const index = ports.findIndex(p => p.match(regex));

  if (index === -1) {
    throw new Error(`No MIDI device matches '${regex}'. Found: ${ports.join(', ') || '(none)'}`);
  }

  return index;
}


/**
 * Return the numbers [0..n-1]
 */
export function range(n: number): number[] {
  const ret = [];
  for (let i = 0; i < n; i++) {
    ret.push(i);
  }
  return ret;
}
