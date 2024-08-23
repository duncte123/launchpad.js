import { ILaunchpad } from './launchpads/base/ILaunchpad.js';

/**
 * Return a promise waiting for the given Launchpad to become ready
 */
export function waitForReady<A extends ILaunchpad>(lp: A): Promise<A> {
  // eslint-disable-next-line no-promise-executor-return
  return new Promise(ok => lp.once('ready', () => ok(lp)));
}
