import { BaseGetAllParams, Filter, RunCreate, RunCreated, RunFilters, RunInfo, RunList } from '../models';
import { AxiosResponse } from 'axios';
import { BaseService } from '.';

interface RunsGetAllParams extends BaseGetAllParams {
    filters?: RunFilters;
    include?: 'cases';
}

export class Runs extends BaseService {
    public getAll(code: string, {limit, offset, filters, include}: RunsGetAllParams): Promise<AxiosResponse<RunList>> {
        const filterParams: Record<string, string> = new Filter(filters?.filter).filter();
        return this.api
            .get(`/run/${code}`, {params: {limit, offset, include, ...filterParams}})
            .then(this.validateResponse<RunList>());
    }

    public get(code: string, runId: string | number): Promise<AxiosResponse<RunInfo>> {
        return this.api
            .get(`/run/${code}/${runId}`)
            .then(this.validateResponse<RunInfo>());
    }

    public exists(code: string, runId: string | number): Promise<boolean> {
        return this.get(code, runId)
            .then((resp: AxiosResponse<RunInfo>) => Boolean(resp.data.id))
            .catch(() => false);
    }

    public complete(code: string, runId: string | number): Promise<AxiosResponse<undefined>> {
        return this.api
            .post(`/run/${code}/${runId}/complete`)
            .then(this.validateResponse<undefined>());
    }

    public create(code: string, data: RunCreate): Promise<AxiosResponse<RunCreated>> {
        return this.api
            .post(`/run/${code}`, data)
            .then(this.validateResponse<RunCreated>());
    }

    public delete(code: string, runId: string | number): Promise<AxiosResponse<undefined>> {
        return this.api
            .delete(`/run/${code}/${runId}`)
            .then(this.validateResponse<undefined>());
    }
}
