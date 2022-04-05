import { ILaunchpad } from "./launchpads/base/ILaunchpad";

/**
 * Return a promise waiting for the given Launchpad to become ready
 */
export async function waitForReady<A extends ILaunchpad>(lp: A): Promise<A> {
  return new Promise(ok => lp.once('ready', () => ok(lp)));
}