import { afterRunHook, beforeRunHook } from './hooks';
import { ConfigLoader, composeOptions } from 'qase-javascript-commons';
import { configSchema } from './configSchema';

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

  on('before:run', async () => {
    await beforeRunHook(config);
  });

  on('after:run', async () => {
    await afterRunHook(config);
  });

  return config;
};
