import { LaunchpadMK2, colors } from '../dist/index.js';
const { colorFromHex, defaultColors } = colors;

// upon connect the launchpad will be put into "Session" mode
const lp = new LaunchpadMK2({
  debug: false,
});

lp.on('rawMessage', (message) => {
  console.log('Raw message', message);
});

lp.once('ready', (name) => {
  console.log(`Connected to ${name}`);

  // draw a diagonal on the launchpad
  lp.setButtonColor(81, defaultColors.red);
  lp.setButtonColor(72, defaultColors.green);
  lp.setButtonColor(63, defaultColors.blue);
  lp.setButtonColor(54, defaultColors.orange);
  lp.setButtonColor(45, defaultColors.red);
  lp.setButtonColor(36, defaultColors.green);
  lp.setButtonColor(27, defaultColors.blue);
  lp.setButtonColor(18, defaultColors.orange);

  // also in the opposite direction
  lp.setButtonColor(88, defaultColors.red);
  lp.setButtonColor(77, defaultColors.green);
  lp.setButtonColor(66, defaultColors.blue);
  lp.setButtonColor(55, defaultColors.orange);
  lp.setButtonColor(44, defaultColors.red);
  lp.setButtonColor(33, defaultColors.green);
  lp.setButtonColor(22, defaultColors.blue);
  lp.setButtonColor(11, defaultColors.orange);
});

lp.on('buttonDown', (note, value) => {
  // generate a random color on each button press
  const randHex = Math.floor(Math.random() * 16777215).toString(16);
  // we have the parse the colors to a special RGB value as
  // the launchpad does not go from 0-255 but from 0-63 for each color
  const color = colorFromHex(randHex);

  console.log(`Button pressed: ${note}`);

  lp.setButtonColor(note, color);
});

lp.on('buttonUp', (note, value) => {
  lp.setButtonColor(note, defaultColors.off);
});
