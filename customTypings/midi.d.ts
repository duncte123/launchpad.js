// eslint-disable-next-line max-classes-per-file
declare module 'midi' {
  import EventEmitter = require('node:events');
  import Stream = require('node:stream');

  export class Input extends EventEmitter {
    ignoreTypes(sysEx: boolean, timing: boolean, activeSensing: boolean): void;

    getPortCount(): number;
    getPortName(portNumber: number): string;

    openVirtualPort(portName: string): void;

    openPort(portNumber: number): void;
    closePort(): void;
  }
  export class Output {
    sendMessage(message: number[]): void;

    getPortCount(): number;
    getPortName(portNumber: number): string;

    openVirtualPort(portName: string): void;

    openPort(portNumber: number): void;
    closePort(): void;
  }

  export function createReadStream(input?: Input): Stream;
  export function createWriteStream(input?: Output): Stream;
}
