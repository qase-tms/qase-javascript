import {
    BaseGetAllParams,
    Filter,
    SharedStepCreate,
    SharedStepCreated,
    SharedStepFilters,
    SharedStepInfo,
    SharedStepList,
    SharedStepUpdate,
} from '../models';
import { AxiosResponse } from 'axios';
import { BaseService } from '.';

interface SharedStepsGetAllParams extends BaseGetAllParams {
    filters?: SharedStepFilters;
}

export class SharedSteps extends BaseService {
    public getAll(
        code: string, {limit, offset, filters}: SharedStepsGetAllParams
    ): Promise<AxiosResponse<SharedStepList>> {
        const filterParams: Record<string, string> = new Filter(filters?.filter).filter();
        return this.api
            .get(`/shared_step/${code}`, {params: {limit, offset, ...filterParams}})
            .then(this.validateResponse<SharedStepList>());
    }

    public get(code: string, sharedStepHash: string): Promise<AxiosResponse<SharedStepInfo>> {
        return this.api
            .get(`/shared_step/${code}/${sharedStepHash}`)
            .then(this.validateResponse<SharedStepInfo>());
    }

    public exists(code: string, sharedStepHash: string): Promise<boolean> {
        return this.get(code, sharedStepHash)
            .then((resp: AxiosResponse<SharedStepInfo>) => Boolean(resp.data.hash))
            .catch(() => false);
    }

    public create(code: string, data: SharedStepCreate): Promise<AxiosResponse<SharedStepCreated>> {
        return this.api
            .post(`/shared_step/${code}`, data)
            .then(this.validateResponse<SharedStepCreated>());
    }

    public update(
        code: string, sharedStepHash: string, data: SharedStepUpdate
    ): Promise<AxiosResponse<SharedStepCreated>> {
        return this.api
            .patch(`/shared_step/${code}/${sharedStepHash}`, data)
            .then(this.validateResponse<SharedStepCreated>());
    }

    public delete(code: string, sharedStepHash: string): Promise<AxiosResponse<undefined>> {
        return this.api
            .delete(`/shared_step/${code}/${sharedStepHash}`)
            .then(this.validateResponse<undefined>());
    }
}
