/* eslint-disable object-property-newline */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable init-declarations */
import EventEmitter from 'eventemitter3';
import { EventTypes, ILaunchpad, Surface } from '../src';

function mockedLaunchPad() {
  return jest.mocked<ILaunchpad>(Object.assign(
    new EventEmitter<EventTypes>(),
    {
      setButtonColor: jest.fn(),
      flash: jest.fn(),
      pulse: jest.fn(),
      setButtons: jest.fn(),
      allOff: jest.fn(),
      close: jest.fn(),
    }
  ));
}

let launchPad: ReturnType<typeof mockedLaunchPad>;
let surface: Surface;
beforeEach(() => {
  launchPad = mockedLaunchPad();
  surface = new Surface(launchPad);
});

test('button commands are sent when update() is called', () => {
  surface.set(0, 0, { style: 'palette', color: 42 });
  expect(launchPad.setButtons).not.toHaveBeenCalled();

  surface.update();
  expect(launchPad.setButtons).toHaveBeenCalledWith({
    button: [0, 0],
    style: { style: 'palette', color: 42 },
  });
});

test('layers are overlaid', () => {
  surface.set(0, 0, { style: 'palette', color: 42 });
  surface.layer(1).set(0, 0, { style: 'palette', color: 86 });
  surface.update();

  expect(launchPad.setButtons).toHaveBeenCalledWith({
    button: [0, 0],
    style: { style: 'palette', color: 86 },
  });
});

test('top layer is see-through', () => {
  surface.set(0, 0, { style: 'palette', color: 42 });
  surface.layer(1).set(0, 0, { style: 'palette', color: 86 });
  surface.layer(1).set(0, 0, { style: 'off' });
  surface.update();

  expect(launchPad.setButtons).toHaveBeenCalledWith({
    button: [0, 0],
    style: { style: 'palette', color: 42 },
  });
});
