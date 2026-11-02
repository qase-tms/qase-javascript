// TestCafe names the function wrapping each test body after its test run and carries that
// wrapper through timers and promises, so the call stack of any code a test runs ends with it.
// This is how TestCafe itself resolves the implicit `t` (lib/api/test-run-tracker.js).
const MARKER_RE = /^\$\$testcafe_test_run\$\$(\S+)\$\$$/;
const STACK_LIMIT = 5000;

/** The id of the TestCafe test run the caller executes in, or null outside a test. */
export const currentTestRunId = (): string | null => {
  const frames = captureFrames();
  for (let i = frames.length - 1; i >= 0; i--) {
    const match = frames[i]?.getFunctionName()?.match(MARKER_RE);
    if (match?.[1]) {
      return match[1];
    }
  }
  return null;
};

const captureFrames = (): NodeJS.CallSite[] => {
  // eslint-disable-next-line @typescript-eslint/unbound-method
  const prepareStackTrace = Error.prepareStackTrace;
  const stackTraceLimit = Error.stackTraceLimit;
  Error.stackTraceLimit = STACK_LIMIT;
  Error.prepareStackTrace = (_error, frames) => frames;
  try {
    const holder: { stack?: NodeJS.CallSite[] } = {};
    Error.captureStackTrace(holder, captureFrames);
    return holder.stack ?? [];
  } finally {
    Error.prepareStackTrace = prepareStackTrace;
    Error.stackTraceLimit = stackTraceLimit;
  }
};
