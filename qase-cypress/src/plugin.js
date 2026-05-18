const { afterRunHook, afterSpecHook, beforeRunHook } = require('./hooks');
const { ConfigLoader, composeOptions } = require('qase-javascript-commons');
const { configSchema } = require('./configSchema');

module.exports = function (on, config) {
  try {
    const configLoader = new ConfigLoader(configSchema);
    const qaseConfig = configLoader.load();
    const reporterOptions = config.reporterOptions?.['cypressQaseReporterReporterOptions'] ?? {};
    const composed = composeOptions(reporterOptions, qaseConfig);
    if (composed.profilers?.includes('network')) {
      config.env['QASE_PROFILER_ENABLED'] = 'true';
      config.env['QASE_PROFILER_SKIP_DOMAINS'] = JSON.stringify(
        composed.networkProfiler?.skip_domains ?? []
      );
    }
  } catch (e) {
    // Silent — profiler config errors must not break test runs
  }

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
