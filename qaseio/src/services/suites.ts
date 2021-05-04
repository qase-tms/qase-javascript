import {
    BaseGetAllParams,
    Filter,
    SuiteCreate,
    SuiteCreated,
    SuiteFilters,
    SuiteInfo,
    SuiteList,
    SuiteUpdate,
} from '../models';
import { AxiosResponse } from 'axios';
import { BaseService } from '.';

interface SuitesGetAllParams extends BaseGetAllParams {
    filters?: SuiteFilters;
}

export class Suites extends BaseService {
    public getAll(code: string, {limit, offset, filters}: SuitesGetAllParams): Promise<AxiosResponse<SuiteList>> {
        const filterParams: Record<string, string> = new Filter(filters?.filter).filter();
        return this.api
            .get(`/suite/${code}`, {params: {limit, offset, ...filterParams}})
            .then(this.validateResponse<SuiteList>());
    }

    public get(code: string, suiteId: string | number): Promise<AxiosResponse<SuiteInfo>> {
        return this.api
            .get(`/suite/${code}/${suiteId}`)
            .then(this.validateResponse<SuiteInfo>());
    }

    public exists(code: string, suiteId: string | number): Promise<boolean> {
        return this.get(code, suiteId)
            .then((resp: AxiosResponse<SuiteInfo>) => Boolean(resp.data.id))
            .catch(() => false);
    }

    public create(code: string, data: SuiteCreate): Promise<AxiosResponse<SuiteCreated>> {
        return this.api
            .post(`/suite/${code}`, data)
            .then(this.validateResponse<SuiteCreated>());
    }

    public update(
        code: string, suiteId: string | number, data: SuiteUpdate
    ): Promise<AxiosResponse<SuiteCreated>> {
        return this.api
            .patch(`/suite/${code}/${suiteId}`, data)
            .then(this.validateResponse<SuiteCreated>());
    }

    public delete(code: string, suiteId: string | number): Promise<AxiosResponse<undefined>> {
        return this.api
            .delete(`/suite/${code}/${suiteId}`)
            .then(this.validateResponse<undefined>());
    }
}
