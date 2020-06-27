import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { Attachments } from './services/attachments';
import { Cases } from './services/cases';
import { Defects } from './services/defects';
import { Milestones } from './services/milestones';
import { Plans } from './services/plans';
import { Projects } from './services/projects';
import { Results } from './services/results';
import { Runs } from './services/runs';
import { SharedSteps } from './services/sharedSteps';
import { Suites } from './services/suites';


export class QaseApi {
    public projects: Projects;
    public cases: Cases;
    public results: Results;
    public runs: Runs;
    public attachments: Attachments;
    public plans: Plans;
    public suites: Suites;
    public milestones: Milestones;
    public sharedSteps: SharedSteps;
    public defects: Defects;

    private api: AxiosInstance;

    public constructor(apiToken: string) {
        const config: AxiosRequestConfig = {
            headers: {
                Token: apiToken,
            },
            baseURL: 'https://api.qase.io/v1',
        };
        this.api = axios.create(config);

        this.projects = new Projects(this.api);
        this.cases = new Cases(this.api);
        this.results = new Results(this.api);
        this.runs = new Runs(this.api);
        this.attachments = new Attachments(this.api);
        this.plans = new Plans(this.api);
        this.suites = new Suites(this.api);
        this.milestones = new Milestones(this.api);
        this.sharedSteps = new SharedSteps(this.api);
        this.defects = new Defects(this.api);
    }
}
