import { autoDetect, Surface, Drawing, colors } from '../dist/index.js';

const SOLID_GREEN = { style: 'palette', color: 23 };
const SOLID_RED = { style: 'palette', color: 6 };

const lp = autoDetect();
const surface = new Surface(lp);
lp.once('ready', (name) => {

  // Draw a smiley on layer 0
  new Drawing(surface).bitmap([1, 3], [
    ' x   - ',
    '   o   ',
    'x     x',
    ' xxxxx ',
  ], {
    'x': { style: 'palette', color: 13 }, // yellow
    'o': { style: 'palette', color: 50 }, // purple
    '-': { style: 'pulse', color: 13 }, // purple
  });

  surface.update();
});

// On a timer, scroll layer 1 to the left
setInterval(() => {
  new Drawing(surface.layer(1)).shift([-1, 0]);
  surface.update();
}, 200);

lp.on('buttonDown', (button) => {
  // While a button is pressed, layer 2 lights up red
  surface.layer(2).set(button.xy, SOLID_RED); // Red

  // Drop a green pixel on layer 1, or a complete green bar if we
  // hit one of the edge buttons.
  if (button.xy[1] === 0) {
    new Drawing(surface.layer(1)).rect([button.xy[0], 1], [1, 8], SOLID_GREEN);
  } else if (button.xy[0] === 8) {
    new Drawing(surface.layer(1)).rect([1, button.xy[1]], [8, 1], SOLID_GREEN);
  } else {
    surface.layer(1).set(button.xy, SOLID_GREEN);
  }
  surface.update();
});

lp.on('buttonUp', (button) => {
  // Switch off the layer 2 overlay
  surface.layer(2).set(button.xy, { style: 'off' });
  surface.update();
});
