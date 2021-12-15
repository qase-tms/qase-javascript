import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { AttachmentsApi } from './api/attachments-api';
import { CasesApi } from './api/cases-api';
import { Configuration } from '.';
import { CustomFieldsApi } from './api/custom-fields-api';
import { DefectsApi } from './api/defects-api';
import { MilestonesApi } from './api/milestones-api';
import { PlansApi } from './api/plans-api';
import { ProjectsApi } from './api/projects-api';
import { ResultsApi } from './api/results-api';
import { RunsApi } from './api/runs-api';
import { SharedStepsApi } from './api/shared-steps-api';
import { SuitesApi } from './api/suites-api';
import { UsersApi } from './api/users-api';


export class QaseApi {
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
    public users: UsersApi;

    private api: AxiosInstance;
    private configuration: Configuration;

    public constructor(apiToken: string, basePath?: string) {
        const baseURL = basePath || 'https://api.qase.io/v1';
        const config: AxiosRequestConfig = {
            headers: {
                Token: apiToken,
            },
            baseURL,
        };
        this.api = axios.create(config);
        this.configuration = new Configuration({
            apiKey: apiToken,
            basePath,
        });

        this.projects = new ProjectsApi(this.configuration, baseURL, this.api);
        this.cases = new CasesApi(this.configuration, baseURL, this.api);
        this.results = new ResultsApi(this.configuration, baseURL, this.api);
        this.runs = new RunsApi(this.configuration, baseURL, this.api);
        this.attachments = new AttachmentsApi(this.configuration, baseURL, this.api);
        this.plans = new PlansApi(this.configuration, baseURL, this.api);
        this.suites = new SuitesApi(this.configuration, baseURL, this.api);
        this.milestones = new MilestonesApi(this.configuration, baseURL, this.api);
        this.sharedSteps = new SharedStepsApi(this.configuration, baseURL, this.api);
        this.defects = new DefectsApi(this.configuration, baseURL, this.api);
        this.customFields = new CustomFieldsApi(this.configuration, baseURL, this.api);
        this.users = new UsersApi(this.configuration, baseURL, this.api);
    }
}
