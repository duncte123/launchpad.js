/**
 * Buttons reported by events
 *
 * Offers both number and [x, y] coordinates.
 */
export interface Button {
  /**
   * Button number
   *
   * The specifics of this number are dependent on LP version.
   */
  readonly nr: number;

  /**
   * Button coordinates
   *
   * Top-left is [0, 0], bottom-right is [8, 8].
   */
  readonly xy: [number, number];
}

/**
 * Button accepted by the API
 *
 * Either a pure button number, x/y coordinates, or a Button
 * struct.
 */
export type ButtonIn = number | [number, number] | Button;

export function isButton(x: ButtonIn): x is Button {
  return x != null && typeof x === 'object' && 'nr' in x;
}