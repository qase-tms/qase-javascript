
import type * as Mocha from "mocha";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { default as ParallelBuffered } from "mocha/lib/nodejs/reporters/parallel-buffered.js";
import { MochaQaseReporter } from "./reporter.js";

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
const originalCreateListeners: (runner: Mocha.Runner) => Mocha.reporters.Base =
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  ParallelBuffered.prototype.createListeners;

// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
ParallelBuffered.prototype.createListeners = function (runner: Mocha.Runner) {
  console.log("createListeners");
  const result = originalCreateListeners.call(this, runner);
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  new MochaQaseReporter(runner, this.options as Mocha.MochaOptions);
  return result;
};
