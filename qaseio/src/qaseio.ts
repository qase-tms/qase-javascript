import axios from 'axios';
import axiosRetry from 'axios-retry';

import {
    ProjectsApi,
    CasesApi,
    ResultsApi,
    RunsApi,
    AttachmentsApi,
    PlansApi,
    SuitesApi,
    MilestonesApi,
    SharedStepsApi,
    DefectsApi,
    CustomFieldsApi,
    AuthorsApi,
    Configuration,
} from './generated';

export interface QaseApiInterface {
    projects: ProjectsApi;
    cases: CasesApi;
    results: ResultsApi;
    runs: RunsApi;
    attachments: AttachmentsApi;
    plans: PlansApi;
    suites: SuitesApi;
    milestones: MilestonesApi;
    sharedSteps: SharedStepsApi;
    defects: DefectsApi;
    customFields: CustomFieldsApi;
    authors: AuthorsApi;
}

export interface QaseApiOptionsInterface {
    apiToken: string;
    baseUrl?: string;
    headers?: Record<string, string>;
    retries?: number;
    retryDelay?: number;
    formDataCtor?: new () => unknown;
}

export class QaseApi implements QaseApiInterface {
    public projects: ProjectsApi;
    public cases: CasesApi;
    public results: ResultsApi;
    public runs: RunsApi;
    public attachments: AttachmentsApi;
    public plans: PlansApi;
    public suites: SuitesApi;
    public milestones: MilestonesApi;
    public sharedSteps: SharedStepsApi;
    public defects: DefectsApi;
    public customFields: CustomFieldsApi;
    public authors: AuthorsApi;

    public constructor(options: QaseApiOptionsInterface) {
        const {
            apiToken,
            baseUrl,
            headers,
            retries = 3,
            retryDelay = 0,
            formDataCtor,
        } = options;

        const transport = axios.create({
            headers,
            maxBodyLength: Infinity,
            maxContentLength: Infinity,
        });

        axiosRetry(transport, {
            retries,
            retryDelay: () => retryDelay,
        });

        const configuration = new Configuration({
            apiKey: apiToken,
            formDataCtor,
        });

        this.projects = new ProjectsApi(configuration, baseUrl, transport);
        this.cases = new CasesApi(configuration, baseUrl, transport);
        this.results = new ResultsApi(configuration, baseUrl, transport);
        this.runs = new RunsApi(configuration, baseUrl, transport);
        this.attachments = new AttachmentsApi(
            configuration,
            baseUrl,
            transport
        );
        this.plans = new PlansApi(configuration, baseUrl, transport);
        this.suites = new SuitesApi(configuration, baseUrl, transport);
        this.milestones = new MilestonesApi(configuration, baseUrl, transport);
        this.sharedSteps = new SharedStepsApi(
            configuration,
            baseUrl,
            transport
        );
        this.defects = new DefectsApi(configuration, baseUrl, transport);
        this.customFields = new CustomFieldsApi(
            configuration,
            baseUrl,
            transport
        );
        this.authors = new AuthorsApi(configuration, baseUrl, transport);
    }
}
