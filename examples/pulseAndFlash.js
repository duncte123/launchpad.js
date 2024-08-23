import { autoDetect, colors } from '../dist/index.js';
const { colorFromHex } = colors;

const lp = autoDetect();

// just a basic color setup
const noteColors = {
  54: colorFromHex('#23c3b6'),
  55: colorFromHex('#3a0280'),
  44: colorFromHex('#fff1c2'),
  // dark colors are shown as dimmed lights on the launchpad
  45: colorFromHex('#4b2e53'),
};

lp.once('ready', (name) => {
  console.log(`Connected to ${name}`);

  for (const note of Object.keys(noteColors)) {
    lp.setButtonColor(note, noteColors[note]);
  }
});

// set to true to pulse instead
const pulse = true;
const flashColor = 5;
const states = {};

lp.on('buttonDown', (button) => {
  const note = button.nr;

  // we are currently flashing
  if (states[note]) {
    const offColor = note in noteColors ? noteColors[note] : [0, 0, 0];

    // reset the color to stop flashing
    lp.setButtonColor(note, offColor);
  } else if (pulse) {
    lp.pulse(note, flashColor);
  } else {
    lp.flash(note, flashColor);
  }

  states[note] = !states[note];
});
