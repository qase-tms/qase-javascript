import chalk from "chalk";
import { Configuration, ResultCreate, ResultExecution, ResultRelations, ResultsApi, ResultStep, ResultStepStatus } from "qase-api-v2-client";
import { Relation, StepStatusEnum, StepType, SuiteData, TestExecution, TestResultType, TestStatusEnum, TestStepType } from "../models";
import { LoggerInterface } from "../utils/logger";
import { ClientV1 } from "./clientV1";
import FormData from 'form-data';
import { TestOpsOptionsType } from "../models/config/TestOpsOptionsType";
import { HostData } from "../models/host-data";

const API_CONFIG = {
    DEFAULT_HOST: 'qase.io',
    BASE_URL: 'https://api-',
    VERSION: '/v2'
} as const;

export class ClientV2 extends ClientV1 {
    static statusMap: Record<TestStatusEnum, string> = {
        [TestStatusEnum.passed]: 'passed',
        [TestStatusEnum.failed]: 'failed',
        [TestStatusEnum.skipped]: 'skipped',
        [TestStatusEnum.disabled]: 'skipped',
        [TestStatusEnum.blocked]: 'blocked',
        [TestStatusEnum.invalid]: 'invalid',
    };

    static stepStatusMap: Record<StepStatusEnum, ResultStepStatus> = {
        [StepStatusEnum.passed]: ResultStepStatus.PASSED,
        [StepStatusEnum.failed]: ResultStepStatus.FAILED,
        [StepStatusEnum.blocked]: ResultStepStatus.BLOCKED,
        [StepStatusEnum.skipped]: ResultStepStatus.SKIPPED,
    };

    private readonly resultsClient: ResultsApi;

    constructor(
        logger: LoggerInterface,
        config: TestOpsOptionsType,
        environment: string | undefined,
        private readonly rootSuite: string | undefined,
        hostData?: HostData,
        reporterName?: string,
        frameworkName?: string
    ) {
        super(logger, config, environment);
        const apiConfig = this.createApiConfigV2(hostData, reporterName, frameworkName);
        this.resultsClient = new ResultsApi(apiConfig);
    }

    private createApiConfigV2(hostData?: HostData, reporterName?: string, frameworkName?: string): Configuration {
        const apiConfig = new Configuration({ apiKey: this.config.api.token, formDataCtor: FormData });

        apiConfig.basePath = this.config.api.host && this.config.api.host != API_CONFIG.DEFAULT_HOST
            ? `${API_CONFIG.BASE_URL}${this.config.api.host}${API_CONFIG.VERSION}`
            : `https://api.${API_CONFIG.DEFAULT_HOST}${API_CONFIG.VERSION}`;

        // Set default headers for all requests
        if (hostData) {
            const headers = this.buildHeaders(hostData, reporterName, frameworkName);
            const existingHeaders = (apiConfig.baseOptions as { headers?: Record<string, string> } | undefined)?.headers || {};
            const baseOptionsWithHeaders: { headers: Record<string, string> } = {
                ...(apiConfig.baseOptions as Record<string, unknown> || {}),
                headers: {
                    ...existingHeaders,
                    ...headers,
                },
            };
            apiConfig.baseOptions = baseOptionsWithHeaders;
        }

        return apiConfig;
    }

    private buildHeaders(hostData: HostData, reporterName?: string, frameworkName?: string): Record<string, string> {
        const headers: Record<string, string> = {};

        // Build X-Client header
        const clientParts: string[] = [];

        if (reporterName && reporterName.trim()) {
            clientParts.push(`reporter=${reporterName}`);
        }
        if (hostData.reporter && hostData.reporter.trim()) {
            clientParts.push(`reporter_version=${hostData.reporter}`);
        }
        if (frameworkName && frameworkName.trim()) {
            clientParts.push(`framework=${frameworkName}`);
        }
        if (hostData.framework && hostData.framework.trim()) {
            clientParts.push(`framework_version=${hostData.framework}`);
        }
        if (hostData.apiClientV1 && hostData.apiClientV1.trim()) {
            clientParts.push(`client_version_v1=${hostData.apiClientV1}`);
        }
        if (hostData.apiClientV2 && hostData.apiClientV2.trim()) {
            clientParts.push(`client_version_v2=${hostData.apiClientV2}`);
        }
        if (hostData.commons && hostData.commons.trim()) {
            clientParts.push(`core_version=${hostData.commons}`);
        }

        if (clientParts.length > 0) {
            headers['X-Client'] = clientParts.join(';');
        }

        // Build X-Platform header
        const platformParts: string[] = [];

        if (hostData.system && hostData.system.trim()) {
            platformParts.push(`os=${hostData.system}`);
        }
        if (hostData.arch && hostData.arch.trim()) {
            platformParts.push(`arch=${hostData.arch}`);
        }
        if (hostData.node && hostData.node.trim()) {
            platformParts.push(`node=${hostData.node}`);
        }
        if (hostData.npm && hostData.npm.trim()) {
            platformParts.push(`npm=${hostData.npm}`);
        }

        if (platformParts.length > 0) {
            headers['X-Platform'] = platformParts.join(';');
        }

        return headers;
    }

    override async uploadResults(runId: number, results: TestResultType[]): Promise<void> {
        try {
            const models = await Promise.all(
                results.map(result => this.transformTestResult(result))
            );
            await this.resultsClient.createResultsV2(this.config.project, runId, {
                results: models,
            });
        } catch (error) {
            throw this.processError(error, 'Error on uploading results', results);
        }
    }

    private async transformTestResult(result: TestResultType): Promise<ResultCreate> {
        const attachments = await this.uploadAttachments(result.attachments);
        if (result.preparedAttachments) {
            attachments.push(...result.preparedAttachments);
        }
        const steps = await this.transformSteps(result.steps, result.title);
        const params = this.transformParams(result.params);
        const groupParams = this.transformGroupParams(result.group_params, params);
        const relations = this.getRelation(result.relations);

        const model: ResultCreate = {
            title: result.title,
            execution: this.getExecution(result.execution),
            testops_ids: Array.isArray(result.testops_id)
                ? result.testops_id
                : result.testops_id !== null ? [result.testops_id] : null,
            attachments: attachments,
            steps: steps,
            params: params,
            param_groups: groupParams,
            relations: relations,
            message: result.message,
            fields: result.fields,
            defect: this.config.defect ?? false,
            signature: result.signature,
        };

        this.logger.logDebug(`Transformed result: ${JSON.stringify(model)}`);

        return model;
    }

    private transformParams(params: Record<string, string>): Record<string, string> {
        const transformedParams: Record<string, string> = {};

        for (const [key, value] of Object.entries(params)) {
            if (value) {
                transformedParams[key] = value;
            }
        }

        return transformedParams;
    }

    private transformGroupParams(groupParams: Record<string, string>, params: Record<string, string>): string[][] {
        const keys = Object.keys(groupParams);
        if (keys.length === 0) {
            return [];
        }

        for (const [key, value] of Object.entries(groupParams)) {
            if (value) {
                params[key] = value;
            }
        }

        return [keys];
    }

    private async transformSteps(steps: TestStepType[], testTitle: string): Promise<ResultStep[]> {
        return Promise.all(
            steps.map(step => this.transformStep(step, testTitle))
        );
    }

    private async transformStep(step: TestStepType, testTitle: string): Promise<ResultStep> {
        const attachmentHashes = await this.uploadAttachments(step.attachments);
        const resultStep = this.createBaseResultStep(attachmentHashes, step.execution.status);

        if (step.step_type === StepType.TEXT) {
            this.processTextStep(step, resultStep, testTitle);
        } else {
            this.processGherkinStep(step, resultStep);
        }

        if (step.steps.length > 0) {
            resultStep.steps = await this.transformSteps(step.steps, testTitle);
        }

        return resultStep;
    }

    private createBaseResultStep(attachmentHashes: string[], status: StepStatusEnum): ResultStep {
        return {
            data: {
                action: '',
            },
            execution: {
                status: ClientV2.stepStatusMap[status],
                attachments: attachmentHashes,
            },
        };
    }

    private processTextStep(step: TestStepType, resultStep: ResultStep, testTitle: string): void {
        if (!('action' in step.data) || !resultStep.data) {
            return;
        }

        const stepData = step.data;
        resultStep.data.action = stepData.action || 'Unnamed step';

        if (stepData.action === '') {
            this.logger.log(chalk`{magenta Test '${testTitle}' has empty action in step. The reporter will mark this step as unnamed step.}`);
        }

        if (stepData.expected_result != null) {
            resultStep.data.expected_result = stepData.expected_result;
        }

        if (stepData.data != null) {
            resultStep.data.input_data = stepData.data;
        }
    }

    private processGherkinStep(step: TestStepType, resultStep: ResultStep): void {
        if (!('keyword' in step.data) || !resultStep.data) {
            return;
        }

        const stepData = step.data;
        resultStep.data.action = stepData.keyword;
    }

    private getExecution(exec: TestExecution): ResultExecution {
        return {
            status: ClientV2.statusMap[exec.status],
            start_time: exec.start_time,
            end_time: exec.end_time,
            duration: exec.duration,
            stacktrace: exec.stacktrace,
            thread: exec.thread,
        };
    }

    private getRelation(relation: Relation | null): ResultRelations {
        if (!relation?.suite) {
            return this.getDefaultSuiteRelation();
        }

        const suiteData = this.buildSuiteData(relation.suite.data);
        return { suite: { data: suiteData } };
    }

    private getDefaultSuiteRelation(): ResultRelations {
        if (!this.rootSuite) return {};

        return {
            suite: {
                data: [{
                    public_id: null,
                    title: this.rootSuite,
                }],
            },
        };
    }

    private buildSuiteData(suiteData: SuiteData[]): SuiteData[] {
        const result: SuiteData[] = [];

        if (this.rootSuite) {
            result.push({
                public_id: null,
                title: this.rootSuite,
            });
        }

        return result.concat(
            suiteData.map(data => ({
                public_id: null,
                title: data.title,
            }))
        );
    }
}
