import BaseLaunchpad from '../BaseLaunchpad.js';
declare type LaunchpadMK2Options = {
    deviceName: RegExp;
    debug: boolean;
    xyMode: boolean;
};
export default class LaunchpadMK2 extends BaseLaunchpad {
    private readonly input;
    private readonly output;
    private readonly options;
    /**
     *
     * @param {LaunchpadMK2Options?} options
     */
    constructor(options?: LaunchpadMK2Options);
    /**
     * @inheritDoc
     */
    send(...message: number[]): void;
    /**
     * @inheritDoc
     */
    sendSysEx(...message: number[]): void;
    /**
     * @inheritDoc
     */
    setButtonColor(button: number | number[], color: number[]): void;
    /**
     * @inheritDoc
     */
    flash(button: number | number[], color: number): void;
    /**
     * @inheritDoc
     */
    pulse(button: number | number[], color: number): void;
    /**
     * @inheritDoc
     */
    allOff(): void;
    /**
     * @inheritDoc
     */
    closePorts(): void;
    /**
     * @inheritDoc
     */
    eventNames(): string[];
    /**
     * @inheritDoc
     */
    parseButtonToXy(state: number, note: number): number[] | number;
    /**
     * @inheritDoc
     */
    mapButtonFromXy(xy: number[] | number): number;
    private setupMessageHandler;
    private internalMessageHandler;
    private logDebug;
}
export {};
