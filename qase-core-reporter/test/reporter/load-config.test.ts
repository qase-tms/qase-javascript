import { describe, it, expect } from 'vitest'
import { unlinkSync, writeFileSync } from 'fs'
import {
    QaseCoreReporter,
} from '../../src';

describe('load Qase config', () => {
    it('should load config from setting loadConfig=true,qase.config.json', () => {
        const testConfigData = require('../../qase.config.json');
        const reporter = new QaseCoreReporter(
            {} as any,
            {
                frameworkName: 'jest',
                reporterName: 'qase-core-reporter',
                loadConfig: true
            });
        expect(reporter.options.apiToken).toEqual(testConfigData.apiToken);
    });

    it('should load config from setting loadConfig=true,.qaserc', () => {
        // delete qase.config.json
        const testConfigData = require('../../qase.config.json');
        unlinkSync(process.cwd() + '/qase.config.json');
        const reporter = new QaseCoreReporter(
            {} as any,
            {
                frameworkName: 'jest',
                reporterName: 'qase-core-reporter',
                loadConfig: true
            });
        expect(reporter.options.projectCode).toEqual('ConfigRCProject');
        // restore qase.config.json
        writeFileSync(process.cwd() + '/qase.config.json', JSON.stringify(testConfigData, null, 2));
    });

    it('should load config from loadConfig public method - qase.config.json', () => {
        const loadedConfig = QaseCoreReporter.loadConfig('qase.config.json');
        const testConfigData = require('../../qase.config.json');
        expect(testConfigData).toEqual(loadedConfig);
    });

    it('should load config from loadConfig public method - .qaserc', () => {
        const loadedConfig = QaseCoreReporter.loadConfig('.qaserc');
        expect(loadedConfig).toEqual({
            "projectCode": "ConfigRCProject",
            "apiToken": "11235678909"
        });
    });

    it('should return empty object when config parsing throws error', () => {
        const testConfigData = require('../../qase.config.json');
        // create invalid json
        writeFileSync(process.cwd() + '/qase.config.json', 'invalid json');
        const loadedConfig = QaseCoreReporter.loadConfig('qase.config.json');
        expect(loadedConfig).toEqual({});
        // restore qase.config.json
        writeFileSync(process.cwd() + '/qase.config.json', JSON.stringify(testConfigData, null, 2));
    });

});