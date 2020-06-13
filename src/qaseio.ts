import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { Cases } from './services/cases';
import { Projects } from './services/projects';
import { Runs } from './services/runs';


export class QaseApi {
    public projects: Projects;
    public cases: Cases;
    public runs: Runs;

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
        this.runs = new Runs(this.api);
    }
}
