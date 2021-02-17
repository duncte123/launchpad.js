import lpJs from '../src/index.js';

const lp = new lpJs.LaunchpadMK2({
  debug: false,
});

lp.on('rawMessage', (message) => {
  console.log('Raw message', message);
});

lp.once('ready', (name) => {
  console.log(`Connected to ${name}`);
  //lp.setButtonRGB(25, rgbColor);
})
