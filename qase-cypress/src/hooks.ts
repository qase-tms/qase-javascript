/// <reference types="cypress" />

import { Attachment, composeOptions, ConfigLoader, QaseReporter } from 'qase-javascript-commons';
import { configSchema } from './configSchema';
import PluginConfigOptions = Cypress.PluginConfigOptions;
import Spec = Cypress.Spec;
import { ResultsManager } from './metadata/resultsManager';
import { FileSearcher } from './fileSearcher';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import fs from 'fs';

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
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const uploadVideos = composedOptions.testops?.uploadAttachments !== false;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment
    const uploadDelay = composedOptions.framework?.cypress?.uploadDelay ?? 10;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const specFileName = path.basename(spec.name, '.cy.js');
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const videoFiles = videosFolder ? FileSearcher.findVideoFiles(videosFolder, specFileName) : [];

    if (videoFiles.length > 0 && uploadVideos) {
      const existingVideoFiles = videoFiles.filter(file => fs.existsSync(file));

      if (existingVideoFiles.length === 0) {
        console.warn('No video files found for upload');
        return;
      }

      // Add delay before uploading videos
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      console.log(`Waiting ${uploadDelay} seconds before uploading video files...`);
      await new Promise(resolve => setTimeout(resolve, uploadDelay * 1000));

      const videoAttachments = existingVideoFiles.map((file) => {
        const stats = fs.statSync(file);
        const attachment = {
          content: '',
          id: uuidv4(),
          mime_type: 'video/mp4',
          size: stats.size,
          file_name: path.basename(file),
          file_path: file,
        } as Attachment;
        return attachment;
      });

      try {
        console.log(`Attempting to upload ${videoAttachments.length} video files...`);
        const videoHashes = await Promise.all(videoAttachments.map(async (attachment) => {
          try {
            // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
            console.log(`Uploading video: ${attachment.file_name} (${attachment.file_path})`);
            return await reporter.uploadAttachment(attachment);
          } catch (uploadError) {
            console.error(`Failed to upload video ${attachment.file_name}:`, uploadError);
            return null;
          }
        }));

        const validHashes = videoHashes.filter((hash): hash is string => hash !== null);
        if (validHashes.length > 0) {
          results.forEach((result) => {
            result.preparedAttachments = validHashes;
          });
          console.log(`Successfully uploaded ${validHashes.length} video files`);
        } else {
          console.warn('No video files were successfully uploaded');
        }
      } catch (error) {
        console.error('Failed to upload video attachments:', error);
      }
    }

    // eslint-disable-next-line @typescript-eslint/await-thenable
    await reporter.setTestResults(results);
    await reporter.sendResults();
  }
  ResultsManager.clear();
}

export {
  beforeRunHook,
  afterRunHook,
  afterSpecHook,
};
