declare module 'midi' {
  import EventEmitter = require("node:events");

  export class Input extends EventEmitter {
    getPortCount(): number;
    getPortName(portNumber: number): string;

    ignoreTypes(sysEx: boolean, timing: boolean, activeSensing: boolean): void;

    openPort(portNumber: number): void;
    closePort(): void;
  }
  export class Output extends EventEmitter {
    getPortCount(): number;
    getPortName(portNumber: number): string;

    sendMessage(message: number[]): void;

    ignoreTypes(sysEx: boolean, timing: boolean, activeSensing: boolean): void;

    openPort(portNumber: number): void;
    closePort(): void;
  }
}
