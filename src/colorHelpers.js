import convert from 'color-convert';

export const defaultColors = {
  off: [0, 0, 0],
  red: [63, 0, 0],
  green: [0, 63, 0],
  blue: [0, 0, 63],
  orange: [ 63, 17, 0],
};

function scaleBetween(unscaledNum, minAllowed, maxAllowed, min, max) {
  return (maxAllowed - minAllowed) * (unscaledNum - min) / (max - min) + minAllowed;
}

export function colorFromRGB(rgb) {
  return rgb.map(v => scaleBetween(v, 0, 63, 0, 255));
}

export function colorFromHex(hex) {
  // Yes I used a package here, deal with it
  // This is for future proofing
  return convert.hex.rgb(hex)
      // scale the colors to fit between, 0-63
      .map(v => scaleBetween(v, 0, 63, 0, 255));
}
