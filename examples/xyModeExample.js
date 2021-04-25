import { LaunchpadMK2, colors } from '../dist/index.js';
const { defaultColors } = colors;

// upon connect the launchpad will be put into "Session" mode
const lp = new LaunchpadMK2({
  xyMode: true,
});

lp.once('ready', (name) => {
  console.log(`Connected to ${name}`);

  // 0 is the top most row and is outside of the grid
  // draw a diagonal on the launchpad
  lp.setButtonColor([0, 1], defaultColors.red);
  lp.setButtonColor([1, 2], defaultColors.green);
  lp.setButtonColor([2, 3], defaultColors.blue);
  lp.setButtonColor([3, 4], defaultColors.orange);
  lp.setButtonColor([4, 5], defaultColors.red);
  lp.setButtonColor([5, 6], defaultColors.green);
  lp.setButtonColor([6, 7], defaultColors.blue);
  lp.setButtonColor([7, 8], defaultColors.orange);

  // also in the opposite direction
  lp.setButtonColor([7, 1], defaultColors.red);
  lp.setButtonColor([6, 2], defaultColors.green);
  lp.setButtonColor([5, 3], defaultColors.blue);
  lp.setButtonColor([4, 4], defaultColors.orange);
  lp.setButtonColor([3, 5], defaultColors.red);
  lp.setButtonColor([2, 6], defaultColors.green);
  lp.setButtonColor([1, 7], defaultColors.blue);
  lp.setButtonColor([0, 8], defaultColors.orange);
});

lp.on('buttonDown', (note, value) => {
  console.log(`Button pressed: ${note} with velocity ${value}`);
});
