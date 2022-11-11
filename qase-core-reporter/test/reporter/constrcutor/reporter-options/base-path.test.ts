import { describe, it, expect } from 'vitest'
import {
    QaseCoreReporter,
    QaseCoreReporterOptions,
} from '../../../../src';

const qaseCoreReporterOptions: QaseCoreReporterOptions = {
    reporterName: 'qase-core-reporter',
    frameworkName: 'qase-core-reporter',
};

describe('basePath', () => {
    it('should be able to set from reporterOptions.basePath', () => {
        const reporter = new QaseCoreReporter(
            {
                apiToken: 'token',
                projectCode: 'code',
                basePath: 'https://qase.io',
            },
            qaseCoreReporterOptions);

        expect(reporter['options'].basePath).toBe('https://qase.io');
    });
    it('should be able to set from QASE_API_BASE_URL', () => {
        process.env.QASE_API_BASE_URL = 'https://qase.io';
        const reporter = new QaseCoreReporter(
            {
                apiToken: 'token',
                projectCode: 'code',
            },
            qaseCoreReporterOptions);

        expect(reporter['options'].basePath).toBe('https://qase.io');
    });

    it('should take QASE_API_BASE_URL over reporterOptions.basePath', () => {
        process.env.QASE_API_BASE_URL = 'https://qase.io';
        const reporter = new QaseCoreReporter(
            {
                apiToken: 'token',
                projectCode: 'code',
                basePath: 'https://qase.io/api',
            },
            qaseCoreReporterOptions);

        expect(reporter['options'].basePath).toBe('https://qase.io');
    });
});
