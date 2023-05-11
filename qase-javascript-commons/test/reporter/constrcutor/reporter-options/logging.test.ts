import { describe, it, expect, vi } from 'vitest'
import {
    QaseCoreReporter,
    QaseCoreReporterOptions,
} from '../../../../src';

const qaseCoreReporterOptions: QaseCoreReporterOptions = {
    reporterName: 'qase-core-reporter',
    frameworkName: 'qase-core-reporter',
};

describe('logging', () => {
    it('should be able to set from reporterOptions.logging', () => {
        const _ = new QaseCoreReporter(
            {
                apiToken: 'token',
                projectCode: 'code',
                logging: true,
            },
            qaseCoreReporterOptions);

        expect(process.env.QASE_LOGGING).toBe('true');
    });

    it('should default to false if reporterOptions.logging and QASE_LOGGING is not set', () => {
        delete process.env.QASE_LOGGING;
        const _ = new QaseCoreReporter(
            {
                apiToken: 'token',
                projectCode: 'code',
            },
            qaseCoreReporterOptions);

        expect(process.env.QASE_LOGGING).toBe('false');
    });

    it('should be able to set from QASE_LOGGING', () => {
        process.env.QASE_LOGGING = 'true';
        const _ = new QaseCoreReporter(
            {
                apiToken: 'token',
                projectCode: 'code',
            },
            qaseCoreReporterOptions);

        expect(process.env.QASE_LOGGING).toBe('true');
    });

    it('should take QASE_LOGGING over reporterOptions.logging', () => {
        process.env.QASE_LOGGING = 'false';
        const _ = new QaseCoreReporter(
            {
                apiToken: 'token',
                projectCode: 'code',
                logging: true,
            },
            qaseCoreReporterOptions);

        expect(process.env.QASE_LOGGING).toBe('false');
    });
});