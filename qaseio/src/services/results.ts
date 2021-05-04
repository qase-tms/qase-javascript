import {
    BaseGetAllParams,
    Filter,
    ResultCreate,
    ResultCreated,
    ResultFilters,
    ResultInfo,
    ResultList,
    ResultUpdate,
} from '../models';
import { AxiosResponse } from 'axios';
import { BaseService } from '.';

interface ResultsGetAllParams extends BaseGetAllParams {
    filters?: ResultFilters;
}

export class Results extends BaseService {
    public getAll(code: string, {limit, offset, filters}: ResultsGetAllParams): Promise<AxiosResponse<ResultList>> {
        const filterParams: Record<string, string> = new Filter(filters?.filter).filter();
        return this.api
            .get(`/result/${code}`, {params: {limit, offset, ...filterParams}})
            .then(this.validateResponse<ResultList>());
    }

    public get(code: string, hash: string): Promise<AxiosResponse<ResultInfo>> {
        return this.api
            .get(`/result/${code}/${hash}`)
            .then(this.validateResponse<ResultInfo>());
    }

    public exists(code: string, hash: string): Promise<boolean> {
        return this.get(code, hash)
            .then((resp: AxiosResponse<ResultInfo>) => Boolean(resp.data.hash))
            .catch(() => false);
    }

    public create(code: string, runId: string | number, data: ResultCreate): Promise<AxiosResponse<ResultCreated>> {
        return this.api
            .post(`/result/${code}/${runId}`, data)
            .then(this.validateResponse<ResultCreated>());
    }

    public update(
        code: string, runId: string | number, hash: string, data: ResultUpdate
    ): Promise<AxiosResponse<ResultCreated>> {
        return this.api
            .patch(`/result/${code}/${runId}/${hash}`, data)
            .then(this.validateResponse<ResultCreated>());
    }

    public delete(code: string, runId: string | number, hash: string): Promise<AxiosResponse<undefined>> {
        return this.api
            .delete(`/result/${code}/${runId}/${hash}`)
            .then(this.validateResponse<undefined>());
    }
}
