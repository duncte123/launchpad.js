import * as EventEmitter from "eventemitter3";

export interface BaseLaunchpad extends EventEmitter {
  send(...message: number[]): void;
  sendSysEx(...message: number[]): void;
  setButtonColor(button: number, color: number[]): void;
  flash(button: number, color: number): void;
  pulse(button: number, color: number): void;

  allOff(): void;
  closePorts(): void;
}

export type LaunchpadMK2Options = {
  deviceName: RegExp,
  debug: boolean,
};

export interface LaunchpadMK2 extends BaseLaunchpad {
  constructor(options: LaunchpadMK2Options);
}

//colorHelper.js
export function colorFromRGB(rgb: number[]): number[];
export function colorFromHex(hex: string): number[];

// utils.js
export function onExit(fn: () => void);
export function findDevice(regex: RegExp, midi: any): void; // TODO: midi type
