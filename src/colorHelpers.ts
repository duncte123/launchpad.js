import convert from 'color-convert';

export const defaultColors = {
  off: [0, 0, 0],
  red: [63, 0, 0],
  green: [0, 63, 0],
  blue: [0, 0, 63],
  orange: [63, 17, 0],
};

export function minMaxColor(color: number): number {
  return Math.max(Math.min(color, 127), 0);
}

export function scaleBetween(unscaledNum: number, minAllowed: number, maxAllowed: number, min: number, max: number): number {
  return (maxAllowed - minAllowed) * (unscaledNum - min) / (max - min) + minAllowed;
}

/**
 * Converts an rgb array to an rgb array that the launchpad can accept
 *
 * @param {number[]} rgb the rgb value to convert
 * @returns {number[]} a color array that the launchpad can accept
 */
export function colorFromRGB(rgb: number[]): number[] {
  return rgb.map((v: number) => scaleBetween(v, 0, 63, 0, 255));
}

/**
 * Converts a hex string to an rgb color that the launchpad can accept
 *
 * @param {string} hex the color
 * @returns {number[]} a color array that the launchpad can accept
 */
export function colorFromHex(hex: string): number[] {
  // Yes I used a package here, deal with it
  // This is for future proofing
  return convert.hex.rgb(hex)
    // scale the colors to fit between, 0-63
    .map((v: number) => scaleBetween(v, 0, 63, 0, 255));
}
