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

    public constructor(apiToken: string, basePath?: string) {
        const config: AxiosRequestConfig = {
            headers: {
                Token: apiToken,
            },
            baseURL: basePath || 'http://api.qase.io/v1',
        };

        const configuration = new Configuration({ apiKey: apiToken, basePath, baseOptions: {
            headers: {
                'Content-Type': 'application/json',
            },
        } });
        this.api = axios.create(config);

        this.projects = new ProjectsApi(configuration, basePath, this.api);
        this.cases = new CasesApi(configuration, basePath, this.api);
        this.results = new ResultsApi(configuration, basePath, this.api);
        this.runs = new RunsApi(configuration, basePath, this.api);
        this.attachments = new AttachmentsApi(configuration, basePath, this.api);
        this.plans = new PlansApi(configuration, basePath, this.api);
        this.suites = new SuitesApi(configuration, basePath, this.api);
        this.milestones = new MilestonesApi(configuration, basePath, this.api);
        this.sharedSteps = new SharedStepsApi(configuration, basePath, this.api);
        this.defects = new DefectsApi(configuration, basePath, this.api);
        this.customFields = new CustomFieldsApi(configuration, basePath, this.api);
        this.users = new UsersApi(configuration, basePath, this.api);
    }
}
