import { describe, it, expect, vi } from 'vitest'
import {
    QaseCoreReporter,
    QaseCoreReporterOptions,
} from '../../../../src';

const qaseCoreReporterOptions: QaseCoreReporterOptions = {
    reporterName: 'qase-core-reporter',
    frameworkName: 'qase-core-reporter',
};


describe('projectCode', () => {
    it('should be able to set from reporterOptions.projectCode', () => {
        const reporter = new QaseCoreReporter(
            {
                apiToken: 'token',
                projectCode: 'code',
            },
            qaseCoreReporterOptions);

        expect(reporter['options'].projectCode).toBe('code');
    });
    it('should be able to set from QASE_PROJECT_CODE', () => {
        process.env.QASE_PROJECT_CODE = 'code_env';
        const reporter = new QaseCoreReporter(
            {
                apiToken: 'token',
            } as any,
            qaseCoreReporterOptions);

        expect(reporter['options'].projectCode).toBe('code_env');
    });

    it('should take QASE_PROJECT_CODE over reporterOptions.projectCode', () => {
        process.env.QASE_PROJECT_CODE = 'code_env';
        const reporter = new QaseCoreReporter(
            {
                apiToken: 'token',
                projectCode: 'code',
            },
            qaseCoreReporterOptions);

        expect(reporter['options'].projectCode).toBe('code_env');
    });
});