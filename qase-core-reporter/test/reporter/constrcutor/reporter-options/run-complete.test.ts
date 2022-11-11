import { describe, it, expect, vi } from 'vitest'
import {
    QaseCoreReporter,
    QaseCoreReporterOptions,
} from '../../../../src';

const qaseCoreReporterOptions: QaseCoreReporterOptions = {
    reporterName: 'qase-core-reporter',
    frameworkName: 'qase-core-reporter',
};

describe('runComplete', () => {
    it('should be false by default', () => {
        const reporter = new QaseCoreReporter(
            {
                apiToken: 'token',
                projectCode: 'code',
            },
            qaseCoreReporterOptions);

        expect(reporter['options'].runComplete).toBe(false);
    });
    it('should be able to set from reporterOptions.runComplete', () => {
        const reporter = new QaseCoreReporter(
            {
                apiToken: 'token',
                projectCode: 'code',
                runComplete: true,
            },
            qaseCoreReporterOptions);

        expect(reporter['options'].runComplete).toBe(true);
    });
    it('should be able to set from QASE_RUN_COMPLETE', () => {
        process.env.QASE_RUN_COMPLETE = 'true';
        const reporter = new QaseCoreReporter(
            {
                apiToken: 'token',
                projectCode: 'code',
            },
            qaseCoreReporterOptions);

        expect(reporter['options'].runComplete).toBe(true);
    });

    it('should take QASE_RUN_COMPLETE over reporterOptions.runComplete', () => {
        process.env.QASE_RUN_COMPLETE = 'true';
        const reporter = new QaseCoreReporter(
            {
                apiToken: 'token',
                projectCode: 'code',
                runComplete: false,
            },
            qaseCoreReporterOptions);

        expect(reporter['options'].runComplete).toBe(true);
    });
});