import midi from 'midi';
export declare const NORMAL_NOTE = 144;
export declare const CONTROL_NOTE = 176;
export declare function onExit(fn: () => void): void;
export declare function findDevice(regex: RegExp, midiInput: midi.Input): number;
