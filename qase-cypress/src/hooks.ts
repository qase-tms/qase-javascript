/// <reference types="cypress" />

import { composeOptions, ConfigLoader, QaseReporter } from 'qase-javascript-commons';
import { configSchema } from './configSchema';
import PluginConfigOptions = Cypress.PluginConfigOptions;

async function beforeRunHook(options: PluginConfigOptions) {
  const configLoader = new ConfigLoader(configSchema);
  const config = configLoader.load();
  const { reporterOptions } = options;
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const { ...composedOptions } = composeOptions(reporterOptions['cypressQaseReporterReporterOptions'], config);

  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  const reporter = QaseReporter.getInstance({
    ...composedOptions,
    frameworkPackage: 'cypress',
    frameworkName: 'cypress',
    reporterName: 'cypress-qase-reporter',
  });

  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  await reporter.startTestRunAsync();
}

async function afterRunHook(options: PluginConfigOptions) {

  const configLoader = new ConfigLoader(configSchema);
  const config = configLoader.load();
  const { reporterOptions } = options;
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const { ...composedOptions } = composeOptions(reporterOptions['cypressQaseReporterReporterOptions'], config);

  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  const reporter = QaseReporter.getInstance({
    ...composedOptions,
    frameworkPackage: 'cypress',
    frameworkName: 'cypress',
    reporterName: 'cypress-qase-reporter',
  });

  await reporter.complete();
}

module.exports = {
  beforeRunHook,
  afterRunHook,
};
