import { LaunchpadMK2, colors } from '../dist/index.js';
const { colorFromHex, colorFromRGB } = colors;

const lp = new LaunchpadMK2();

let currentFrame = 0;
// this was coded by hand, yeah I know
const frames = [
  // frame 0
  [
    {
      buttons: [81, 45, 88, 44],
      color: '#FF0000',
    },
    {
      buttons: [72, 36, 77, 33],
      color: '#00FF00',
    },
    {
      buttons: [63, 27, 66, 22],
      color: '#0000FF',
    },
    {
      buttons: [54, 18, 55, 11],
      color: '#d77a0d',
    },
  ],
  // frame 1
  [
    {
      buttons: [84, 85, 44, 45, 58, 48],
      color: '#FF0000',
    },
    {
      buttons: [74, 75, 34, 35, 57, 47, 53, 43],
      color: '#00FF00',
    },
    {
      buttons: [64, 65, 24, 25, 56, 46, 52, 42],
      color: '#0000FF',
    },
    {
      buttons: [54, 55, 14, 15, 51, 41],
      color: '#d77a0d',
    },
  ],
  // frame 2
  [
    {
      buttons: [54, 18, 55, 11],
      color: '#FF0000',
    },
    {
      buttons: [63, 27, 66, 22],
      color: '#00FF00',
    },
    {
      buttons: [72, 36, 77, 33],
      color: '#0000FF',
    },
    {
      buttons: [81, 45, 88, 44],
      color: '#d77a0d',
    },
  ],
  // frame 3
  [
    {
      buttons: [84, 85, 44, 45, 58, 48],
      color: '#d77a0d',
    },
    {
      buttons: [74, 75, 34, 35, 57, 47, 53, 43],
      color: '#0000FF',
    },
    {
      buttons: [64, 65, 24, 25, 56, 46, 52, 42],
      color: '#00FF00',
    },
    {
      buttons: [54, 55, 14, 15, 51, 41],
      color: '#FF0000',
    },
  ],
];

lp.once('ready', (name) => {
  console.log(`Connected to ${name}`);

  animate();

  setInterval(() => animate(), 1000);
});

function animate() {
  lp.allOff();

  for (const frameSettings of frames[currentFrame]) {
    setColor(
        frameSettings.buttons,
        frameSettings.color,
    );
  }

  currentFrame++;

  // reset to start at the first frame
  if (currentFrame > frames.length - 1) {
    currentFrame = 0;
  }
}

/**
 *
 * @param {number|number[]} buttons
 * @param {string|number[]} color
 */
function setColor(buttons, color) {
  const buttonsParsed = Array.isArray(buttons) ? buttons : [buttons];
  const colorParsed = Array.isArray(color) ? colorFromRGB(color) : colorFromHex(color);

  for (const button of buttonsParsed) {
    lp.setButtonColor(button, colorParsed);
  }
}
