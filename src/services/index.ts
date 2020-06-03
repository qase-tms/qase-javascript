import { AxiosInstance, AxiosResponse } from 'axios';

export class BaseService {
    protected api: AxiosInstance;

    public constructor(api: AxiosInstance) {
        this.api = api;
    }

    public validateResponse<T>(): (response: AxiosResponse) => AxiosResponse<T | any> {
        interface QaseResponse {
            status: boolean;
            result: T;
        }
        return (response: AxiosResponse): AxiosResponse<T | any> => {
            const resp: QaseResponse = response.data as QaseResponse;
            if (resp.status) {
                response.data = resp.result;
            }
            return response;
        };
    }
}
