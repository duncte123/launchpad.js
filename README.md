# Launchpad.js

Interact with your launchpads in Node.js

Launchpad running an [example script](./examples/example.js)

![Launchpad displaying a cross](./assets/Active_launchpad_resize.png)

This project started as a module for my own stream system to make several things interact with OBS studio, named [rewards-interaction][rewards-interaction].
After re-writing a broken launchpad library I decided to release the library to the public so everyone can enjoy easy programming on their launchpad.

Some sample programs can be found in the [examples folder](./examples).



## Launchpad models currently supported

- Launchpad MK1 ([limited support][limited-support-mk1])
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



## Low-level API

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



## Surface API

There is also a buffer-oriented API you can use, which works much like
how graphics cards work. The class `Surface` addresses the Launchpad grid
as one or more layers of 9x9 buttons. You can `set` and `get` the individual
button styles, and call `update()` to send all changes to the Launchpad.

A helper class `Drawing` exists to help with performing common drawing operations.

See the [`examples/surface.js`](./examples/surface.js) example for more information
on how to use this API.



## Limited support for the legacy Launchpad MK1

[limited-support-mk1]: #limited-support-for-the-legacy-launchpad-mk1 "Jump to section"

Launchpad MK1 offers less functionality over newer models and therefore has some limitations.
The implementation for Launchpad MK1 aims to be forward compatible with functionality of this package that
was added with newer models in mind, though there are some differences as specified in this section.


### Colors

Buttons on Launchpad MK1 only have two LEDs, red and green, with four states each:
- `0` off.
- `1` low brightness.
- `2` medium brightness.
- `3` full brightness.

This means color values used by methods `lp.setButtonColor()`, `lp.flash()` and `lp.pulse()`
  are restricted to the following values:
- `[r, g]`, a tuple of red and green values in range `0..3`.
- `[r, g, b]`, a tuple of red, green and blue values in range `0..3`. The value for blue is ignored.
- `number` in range `0..63`, specifying a *Velocity* value as specified in the developer reference.
  *Velocity* values can be calculated by using method `lp.velocity()`.


### Flashing buttons

Buttons on Launchpad MK1 can only **pulse** between off and a specified color, it does not support **flash**ing
  between two specified colors. This results in method `lp.flash()` only accepting one color argument and
  thus providing the exact same signature and functionality as `lp.pulse()`.



## TODO

- Add support for the same launchpads as launchpad.py


## Related resources

- [Launchpad (MK1) programmers reference](https://web.archive.org/web/20240521041224/https://fael-downloads-prod.focusrite.com/customer/prod/downloads/launchpad-programmers-reference.pdf "View on archive.org") (archived)
- [Launchpad MK2 programmers reference](http://web.archive.org/web/20231011173853/https://fael-downloads-prod.focusrite.com/customer/prod/s3fs-public/downloads/Launchpad%20MK2%20Programmers%20Reference%20Manual%20v1.03.pdf "View on archive.org") (archived)
- [Launchpad Mini MK3 programmers reference](https://web.archive.org/web/20240127061723/https://fael-downloads-prod.focusrite.com/customer/prod/s3fs-public/downloads/Launchpad%20Mini%20-%20Programmers%20Reference%20Manual.pdf "View on archive.org") (archived)

More recent versions of programmers references may be available on [Novation Music's website](https://novationmusic.com/ "Visit website").


## Notice

This project contains modified code from https://github.com/Lokua/launchpad which was released under the MIT license.

[rewards-interaction]: https://github.com/duncte123/rewards-interaction
