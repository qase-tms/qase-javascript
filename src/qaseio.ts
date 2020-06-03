import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { Projects } from './services/projects';


export class QaseApi {
    public projects: Projects;

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
    }
}
