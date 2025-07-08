/// <reference types="cypress" />

import { Attachment, composeOptions, ConfigLoader, QaseReporter } from 'qase-javascript-commons';
import { configSchema } from './configSchema';
import PluginConfigOptions = Cypress.PluginConfigOptions;
import Spec = Cypress.Spec;
import { ResultsManager } from './metadata/resultsManager';
import { FileSearcher } from './fileSearcher';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';

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

async function afterSpecHook(spec: Spec, options: PluginConfigOptions) {
  const results = ResultsManager.getResults();
  if (results) {

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

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    const videosFolder = composedOptions.framework?.cypress?.videosFolder;
    const specFileName = path.basename(spec.name, '.cy.js');
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const videoFiles = videosFolder ? FileSearcher.findVideoFiles(videosFolder, specFileName) : [];

    if (videoFiles.length > 0) {
      results.forEach((result) => {
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        result.attachments = [...(result.attachments ?? []), ...videoFiles.map((file) => {
          const attachment = {
            content: '',
            id: uuidv4(),
            mime_type: 'video/mp4',
            size: 0,
            file_name: path.basename(file),
            file_path: file,
          } as Attachment;
          return attachment;
        })];
      });
    }

    // eslint-disable-next-line @typescript-eslint/await-thenable
    await reporter.setTestResults(results);
    await reporter.sendResults();
  }
  ResultsManager.clear();
}

module.exports = {
  beforeRunHook,
  afterRunHook,
  afterSpecHook,
};


