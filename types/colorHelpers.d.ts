export declare const defaultColors: {
    off: number[];
    red: number[];
    green: number[];
    blue: number[];
    orange: number[];
};
export declare function minMaxColor(color: number): number;
export declare function scaleBetween(unscaledNum: number, minAllowed: number, maxAllowed: number, min: number, max: number): number;
/**
 * Converts an rgb array to an rgb array that the launchpad can accept
 *
 * @param {number[]} rgb the rgb value to convert
 * @returns {number[]} a color array that the launchpad can accept
 */
export declare function colorFromRGB(rgb: number[]): number[];
/**
 * Converts a hex string to an rgb color that the launchpad can accept
 *
 * @param {string} hex the color
 * @returns {number[]} a color array that the launchpad can accept
 */
export declare function colorFromHex(hex: string): number[];
