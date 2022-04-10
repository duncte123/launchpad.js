# Launchpad.js

Interact with your launchpads in Node.js

Launchpad running an [example script](./examples/example.js)

![Launchpad displaying a cross](./assets/Active_launchpad_resize.png)

This project started as a module for my own stream system to make several things interact with OBS studio, named [rewards-interaction][rewards-interaction].
After re-writing a broken launchpad library I decided to release the library to the public so everyone can enjoy easy programming on their launchpad.

Some sample programs can be found in the [examples folder](./examples).

## Launchpad models currently supported

- Launchpad MK2
- Launchpad MK3 (only tested with Mini)

### Why are only these launchpads supported?

These launchpads are supported because I own them myself and have been able to test them.
If a launchpad is not listed here it means that I do not own one and have not been able to test that one with the program.

## Examples

More examples can be found in the [examples folder](./examples), this is just a simple button listener.

```js
const { autoDetect, colors } = require('launchpad.js');
const { colorFromHex, defaultColors } = colors;

const lp = autoDetect();

// Alternatively:
//
//    await waitForReady(lp);

lp.once('ready', (deviceName) => {
  console.log(`${deviceName} is ready!!`);

  lp.on('buttonDown', (button) => {
    // Generate a random color on each button press
    const randHex = Math.floor(Math.random() * 16777215).toString(16);

    // The Launchpad accepts an RGB-triple between 0 and 1. This converts the
    // hex code to the appropriate number array.
    const color = colorFromHex(randHex);

    console.log(`Button pressed ${button.nr} (x: ${button.xy[0]}, y: ${button.xy[1]}`);

    lp.setButtonColor(button, color);
  });

  lp.on('buttonUp', (button) => {
    lp.setButtonColor(button, defaultColors.off);
  });
});
```

## API

A number of methods are available to control the button colors on
the LaunchPad. In all of these methods, the button to control can be
specified in one of the following ways:

- `number`, indicating a Launchpad-specific button number
- `[x, y]`, a Launchpad-independent button coordinate with (0, 0) in
  the top-left.
- `Button`, a Button object (as returned by the `buttonDown` or `buttonUp`
  event handlers).

The follow methods control a button's color:

- `lp.setButtonColor(button, colorOrRGB)`: set a button to a solid color.
  `colorOrRGB` is either:
  - `number` between 0..127, a color in the 128-color palette of the Launchpad.
  - `[r, g, b]`, an array of RGB values between 0 and 1.
- `lp.flash(button, color, colorB?)`: flash a button between two palette
  colors. For colors that don't support a second color, the button will flash
  to black.
- `lp.pulse(button, color)`: a button will pulse between black and the given
  palette color.

## TODO

- Add support for the same launchpads as launchpad.py

### Links

- [Launchpad developer manual](https://resource.novationmusic.com/support/product-downloads?product=Launchpad)

### Notice

This project contains modified code from https://github.com/Lokua/launchpad which was released under the MIT license

[rewards-interaction]: https://github.com/duncte123/rewards-interaction
