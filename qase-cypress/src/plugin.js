const { afterRunHook, afterSpecHook, beforeRunHook } = require('./hooks');
const { ConfigLoader, composeOptions } = require('qase-javascript-commons');
const { configSchema } = require('./configSchema');

module.exports = function (on, config) {
  const profiler = { enabled: false, skipDomains: [] };
  try {
    const configLoader = new ConfigLoader(configSchema);
    const qaseConfig = configLoader.load();
    const reporterOptions = config.reporterOptions?.['cypressQaseReporterReporterOptions'] ?? {};
    const composed = composeOptions(reporterOptions, qaseConfig);
    if (composed.profilers?.includes('network')) {
      profiler.enabled = true;
      profiler.skipDomains = composed.networkProfiler?.skip_domains ?? [];
    }
  } catch (e) {
    // Silent — profiler config errors must not break test runs
  }

  // Read by `cypress-qase-reporter/support` before each test.
  on('task', {
    qaseProfilerConfig() {
      return profiler;
    },
  });

  on('before:browser:launch', (browser, launchOptions) => {
    config.browser = browser;
    return launchOptions;
  });

  on('before:run', async () => {
    await beforeRunHook(config);
  });

  // Auto-register after:spec so results buffered by the browser-side Mocha reporter
  // (via ResultsManager file bridge) are flushed to Qase without the user having to
  // wire this hook manually. Previously users had to add an explicit
  // `on('after:spec', ...)` in setupNodeEvents; forgetting it produced empty runs.
  on('after:spec', async (spec) => {
    await afterSpecHook(spec, config);
  });

  on('after:run', async () => {
    await afterRunHook(config);
  });

  return config;
};
