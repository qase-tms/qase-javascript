import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';


export class QaseIo {
    private api: AxiosInstance;

    public constructor(apiToken: string) {
        const config: AxiosRequestConfig = {
            headers: {
                Token: apiToken,
            },
            baseURL: 'https://api.qase.io/v1',
        };
        this.api = axios.create(config);
    }
}
