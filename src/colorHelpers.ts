import convert from 'color-convert';
import { RgbColor } from './launchpads/base/ILaunchpad';

export const defaultColors: Record<string, RgbColor> = {
  off: [0, 0, 0],
  red: [1, 0, 0],
  green: [0, 1, 0],
  blue: [0, 0, 1],
  orange: [1, 0.26984127, 0],
};

/**
 * How many Palette colors there are
 */
export const PALETTE_SIZE = 64;

export function scaleBetween(unscaledNum: number, minAllowed: number, maxAllowed: number, min: number, max: number): number {
  return (maxAllowed - minAllowed) * (unscaledNum - min) / (max - min) + minAllowed;
}

/**
 * Converts an rgb array to an rgb array that the launchpad can accept
 *
 * @param {number[]} rgb the rgb value to convert (on a range from 0..255)
 * @returns {number[]} a color array that the launchpad can accept
 */
export function colorFromRGB(rgb: [number, number, number]): RgbColor {
  return rgb.map((v: number) => v / 255) as RgbColor;
}

/**
 * Converts a hex string to an rgb color that the launchpad can accept
 *
 * @param {string} hex the color
 * @returns {number[]} a color array that the launchpad can accept
 */
export function colorFromHex(hex: string): RgbColor {
  // Yes I used a package here, deal with it
  // This is for future proofing
  return convert.hex.rgb(hex)
    // scale the colors to fit between, 0-63
    .map((v: number) => v / 255) as RgbColor;
}
