import { describe, it, expect } from 'vitest'
import {
    QaseCoreReporter,
    QaseCoreReporterOptions,
} from '../../../../src';

const qaseCoreReporterOptions: QaseCoreReporterOptions = {
    reporterName: 'qase-core-reporter',
    frameworkName: 'qase-core-reporter',
};

describe('environmentId', () => {
    it('should be able to set from reporterOptions.environmentId', () => {
        const reporter = new QaseCoreReporter(
            {
                apiToken: 'token',
                projectCode: 'code',
                environmentId: 1,
            },
            qaseCoreReporterOptions);

        expect(reporter['options'].environmentId).toBe(1);
    });

    it('should be able to set from QASE_ENVIRONMENT_ID', () => {
        process.env.QASE_ENVIRONMENT_ID = '2';
        const reporter = new QaseCoreReporter(
            {
                apiToken: 'token',
                projectCode: 'code',
            },
            qaseCoreReporterOptions);

        expect(reporter['options'].environmentId).toBe(2);
    });

    it('should take QASE_ENVIRONMENT_ID over reporterOptions.environmentId', () => {
        process.env.QASE_ENVIRONMENT_ID = '2';
        const reporter = new QaseCoreReporter(
            {
                apiToken: 'token',
                projectCode: 'code',
                environmentId: 1,
            },
            qaseCoreReporterOptions);

        expect(reporter['options'].environmentId).toBe(2);
    });
});
