import { BaseGetAllParams, PlanCreate, PlanCreated, PlanInfo, PlanList, PlanUpdate } from '../models';
import { AxiosResponse } from 'axios';
import { BaseService } from '.';

export class Plans extends BaseService {
    public getAll(code: string, {limit, offset}: BaseGetAllParams): Promise<AxiosResponse<PlanList>> {
        return this.api
            .get(`/plan/${code}`, {params: {limit, offset}})
            .then(this.validateResponse<PlanList>());
    }

    public get(code: string, planId: string | number): Promise<AxiosResponse<PlanInfo>> {
        return this.api
            .get(`/plan/${code}/${planId}`)
            .then(this.validateResponse<PlanInfo>());
    }

    public exists(code: string, planId: string | number): Promise<boolean> {
        return this.get(code, planId)
            .then((resp: AxiosResponse<PlanInfo>) => Boolean(resp.data.id))
            .catch(() => false);
    }

    public create(code: string, data: PlanCreate): Promise<AxiosResponse<PlanCreated>> {
        return this.api
            .post(`/plan/${code}`, data)
            .then(this.validateResponse<PlanCreated>());
    }

    public update(
        code: string, planId: string | number, data: PlanUpdate
    ): Promise<AxiosResponse<PlanCreated>> {
        return this.api
            .patch(`/plan/${code}/${planId}`, data)
            .then(this.validateResponse<PlanCreated>());
    }

    public delete(code: string, planId: string | number): Promise<AxiosResponse<undefined>> {
        return this.api
            .delete(`/plan/${code}/${planId}`)
            .then(this.validateResponse<undefined>());
    }
}
