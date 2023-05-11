import { QaseOptions } from "../interfaces/options";
import chalk from 'chalk';

// eslint-disable-next-line no-shadow
export enum Envs {
    mode = 'QASE_MODE',
    toApiToken = 'QASE_TO_API_TOKEN',
    toBasePath = 'QASE_TO_API_BASE_URL',
    toProjectCode = 'QASE_TO_PROJECT_CODE',
    toRunId = 'QASE_TO_RUN_ID',
    toRunName = 'QASE_TO_RUN_TITLE',
    toRunDescription = 'QASE_TO_RUN_DESCRIPTION',
    toRunComplete = 'QASE_TO_RUN_COMPLETE',
    toEnvironmentId = 'QASE_TO_ENVIRONMENT_ID',

    rootSuiteTitle = 'QASE_ROOT_SUITE_TITLE',
    logging = 'QASE_LOGGING',
    uploadAttachments = 'QASE_UPLOAD_ATTACHMENTS',
    sendScreenshot = 'QASE_SCREENSHOT_SENDING',
    screenshotFolder = 'QASE_SCREENSHOT_FOLDER',
    videoFolder = 'QASE_VIDEO_FOLDER',
}

export const Statuses = {
    passed: 'passed',
    failed: 'failed',
    skipped: 'skipped',
    pending: 'skipped',
    disabled: 'blocked',
    invalid: 'invalid',
};

export interface Suite {
    parent: Suite | string;
    title: string;
}

interface ParameterizedTestData {
    id: string;
    dataset: string;
}

export class BaseReporter {
    _reporterOptions: QaseOptions;

    constructor(options: QaseOptions) {
        this._reporterOptions = options;

        if (process.env.QASE_LOGGING === undefined) {
            process.env.QASE_LOGGING = this._reporterOptions.logging
                ? String(this._reporterOptions.logging)
                : 'false';
        }
    }

    public getEnv(name: Envs) {
        return process.env[name];
    }

    public logger(message?: string, ...optionalParams: any[]): void {
        // eslint-disable-next-line no-console
        const logging = this.getEnv(Envs.logging) === 'true'
            ? true
            : false;
        if (logging) {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
            console.log(chalk`{bold {blue qase:}} ${message}`, ...optionalParams);
        }
    }
}