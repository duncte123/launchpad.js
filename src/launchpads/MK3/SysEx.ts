/**
 * Class to format SysEx messages into an array of numbers
 */
class SysEx {
  public static setProgrammerMode(enable: boolean): number[] {
    return [14, enable ? 1 : 0];
  }

  /**
   * Set brightness between 0..1
   */
  public static setBrightness(level: number): number[] {
    return [8, Math.round(level * 127)];
  }

  public static setButtonColors(...buttons: number[][]): number[] {
    return [3, ...Array.prototype.concat([], ...buttons)];
  }
}