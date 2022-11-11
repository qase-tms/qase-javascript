import { describe, it, expect } from 'vitest'
import {
    QaseCoreReporter,
    QaseCoreReporterOptions,
} from '../../../../src';

const qaseCoreReporterOptions: QaseCoreReporterOptions = {
    reporterName: 'qase-core-reporter',
    frameworkName: 'qase-core-reporter',
};

describe('runDescription', () => {
    it('should be able to set from reporterOptions.runDescription', () => {
        const reporter = new QaseCoreReporter(
            {
                report: true,
                apiToken: 'token',
                projectCode: 'code',
                logging: true,
                runDescription: 'runDescription',
            },
            qaseCoreReporterOptions);

        expect(reporter['options'].runDescription).toBe('runDescription');
    });
    it('should be able to set from QASE_RUN_DESCRIPTION', () => {
        process.env.QASE_RUN_DESCRIPTION = 'runDescriptionENV';
        const reporter = new QaseCoreReporter(
            {
                report: true,
                apiToken: 'token',
                projectCode: 'code',
                logging: true,
            },
            qaseCoreReporterOptions);

        expect(reporter['options'].runDescription).toBe('runDescriptionENV');
    });

    it('should default to empty string if QASE_RUN_DESCRIPTION and ', () => {
        delete process.env.QASE_RUN_DESCRIPTION;
        const reporter = new QaseCoreReporter(
            {
                apiToken: 'token',
                projectCode: 'code',
            },
            qaseCoreReporterOptions);
        expect(reporter['options'].runDescription).toBe('');
    });
});