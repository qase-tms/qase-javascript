import type * as Mocha from "mocha";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
import { default as ParallelBuffered } from "mocha/lib/nodejs/reporters/parallel-buffered.js";
import { MochaQaseReporter, PARALLEL_WORKER_OPTION } from "./reporter";

class QaseParallelReporter extends ParallelBuffered {
  constructor(runner: Mocha.Runner, opts: Mocha.MochaOptions) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    super(runner, opts);
    const qaseOpts = { ...opts, parallel: false, [PARALLEL_WORKER_OPTION]: true };
    new MochaQaseReporter(runner, qaseOpts);
  }
}

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
module.exports = QaseParallelReporter;
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
module.exports.default = QaseParallelReporter;
