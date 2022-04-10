import { colors } from '../src';

test('colorFromHex', () => {
  expect(colors.colorFromHex('ff8822')).toEqual([1, 0.5333333333333333, 0.13333333333333333]);
});
