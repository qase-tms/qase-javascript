import { AxiosInstance, AxiosResponse } from 'axios';

export class BaseService {
    protected api: AxiosInstance;

    public constructor(api: AxiosInstance) {
        this.api = api;
    }

    public validateResponse<T>(): (response: AxiosResponse) => T | undefined {
        interface QaseResponse {
            status: boolean;
            result: T;
        }
        return (response: AxiosResponse): T | undefined => {
            const resp: QaseResponse = response.data as QaseResponse;
            if (resp.status) {
                return resp.result;
            }
        };
    }
}
