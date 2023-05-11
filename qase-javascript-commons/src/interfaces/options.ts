
export interface QaseOptions {
    frameworkName: string;
    reporterName: string;
    customFrameworkName?: string;
    customReporterName?: string;
    screenshotFolder?: string;
    videoFolder?: string;
    loadConfig?: boolean;
    enabledSupport?: boolean;
    logging?: boolean;
}

export interface QaseTestOpsOptions {
    mode?: 'async' | 'sync';
    apiToken: string;
    basePath?: string;
    projectCode: string;
    environmentId?: number;
    runId?: number;
    runDescription?: string;
    runName?: string;
    runComplete?: boolean;
}

export interface QaseReportOptions {
    path: string;
}