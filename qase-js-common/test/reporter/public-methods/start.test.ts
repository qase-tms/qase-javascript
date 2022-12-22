import { describe, it, expect } from 'vitest'
import {
    QaseCoreReporter,
    QaseCoreReporterOptions,
} from '../../../src';

const qaseCoreReporterOptions: QaseCoreReporterOptions = {
    reporterName: 'qase-core-reporter',
    frameworkName: 'qase-core-reporter',
};

describe('start', () => {
    process.env.QASE_LOGGING = 'true';
    it('should check valid project, and existing run', async () => {
        const reporter = new QaseCoreReporter(
            {
                report: true,
                apiToken: '123',
                projectCode: 'TP',
                logging: true,
                basePath: 'https://api.qase.io/v1',
                runComplete: true,
                environmentId: 1,
                rootSuiteTitle: 'Cypress tests',
            },
            qaseCoreReporterOptions);

        await reporter.start();
        expect(reporter['isDisabled']).toBe(false);
    });

    it('should disable if project does not exist', async () => {
        const reporter = new QaseCoreReporter(
            {
                report: true,
                apiToken: '123',
                projectCode: 'TP-not-exist',
                logging: true,
                basePath: 'https://api.qase.io/v1',
                runComplete: true,
                environmentId: 1,
                rootSuiteTitle: 'Cypress tests',
            },
            qaseCoreReporterOptions);

        await reporter.start();
        expect(reporter['isDisabled']).toBe(true);
    });

    it('should disable if run does not exist', async () => {
        process.env.QASE_RUN_ID = '999';
        const reporter = new QaseCoreReporter(
            {
                report: true,
                apiToken: '123',
                projectCode: 'TP',
                logging: true,
                basePath: 'https://api.qase.io/v1',
                runComplete: true,
                environmentId: 1,
                rootSuiteTitle: 'Cypress tests',
            },
            qaseCoreReporterOptions);

        await reporter.start();
        expect(reporter['isDisabled']).toBe(true);
    });

    it('should disable if there is an issue while checking project', async () => {
        const reporter = new QaseCoreReporter(
            {
                report: true,
                apiToken: '123',
                projectCode: 'TP-invalid',
                logging: true,
                basePath: 'https://api.qase.io/v1',
                runComplete: true,
                environmentId: 1,
                rootSuiteTitle: 'Cypress tests',
            },
            qaseCoreReporterOptions);

        await reporter.start();
        expect(reporter['isDisabled']).toBe(true);
    });

    it('should disable if there is an issue while creating run', async () => {
        delete process.env.QASE_RUN_ID;
        const reporter = new QaseCoreReporter(
            {
                report: true,
                apiToken: '123',
                projectCode: 'run-404',
                basePath: 'https://api.qase.io/v1',
                runComplete: true,
                environmentId: 1,
                rootSuiteTitle: 'Cypress tests',
                runName: 'Run error',
            },
            qaseCoreReporterOptions);
        await reporter.start();
        expect(reporter['isDisabled']).toBe(true);
    });

    it('should disable if cannot create run in project', async () => {
        delete process.env.QASE_RUN_ID;
        const reporter = new QaseCoreReporter(
            {
                report: true,
                apiToken: '123',
                projectCode: 'run-403',
                basePath: 'https://api.qase.io/v1',
                runComplete: true,
                environmentId: 1,
                rootSuiteTitle: 'Cypress tests',

            },
            qaseCoreReporterOptions);

        await reporter.start();

        expect(reporter['isDisabled']).toBe(true);
    });

    it('should disable if there is an issue while checking run', async () => {
        process.env.QASE_RUN_ID = '404';
        const reporter = new QaseCoreReporter(
            {
                report: true,
                apiToken: '123',
                projectCode: 'TP',
                basePath: 'https://api.qase.io/v1',
                runComplete: true,
                environmentId: 1,
                rootSuiteTitle: 'Cypress tests',
            },
            qaseCoreReporterOptions);

        await reporter.start();
        expect(reporter['isDisabled']).toBe(true);
        process.env.QASE_RUN_ID = undefined;
    });

    it('should not run start if disabled', async () => {
        const reporter = new QaseCoreReporter(
            {
                report: false,
                apiToken: '123',
                projectCode: 'TP',
                logging: true,
                basePath: 'https://api.qase.io/v1',
                runComplete: true,
                environmentId: 1,
                rootSuiteTitle: 'Cypress tests',
            },
            qaseCoreReporterOptions);

        await reporter.start();
        expect(reporter['isDisabled']).toBe(true);
    });
});