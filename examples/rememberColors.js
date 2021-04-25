// by now you can probably see that this is just me having fun :P

import { colors, LaunchpadMK2 } from '../dist/index.js';

const { colorFromHex, defaultColors } = colors;

const lp = new LaunchpadMK2();

lp.once('ready', (name) => {
  console.log(`Connected to ${name}`);
});

const savedColors = {};

function getColor(note) {
  if (!(note in savedColors)) {
    const randHex = Math.floor(Math.random() * 16777215).toString(16);
    savedColors[note] = colorFromHex(randHex);
  }

  return savedColors[note];
}

lp.on('buttonDown', (note, value) => {
  lp.setButtonColor(note, getColor(note));
});

lp.on('buttonUp', (note, value) => {
  setTimeout(() => {
    lp.setButtonColor(note, defaultColors.off);
  }, 10);
});
