import {
    BaseGetAllParams,
    Filter,
    MilestoneCreate,
    MilestoneCreated,
    MilestoneFilters,
    MilestoneInfo,
    MilestoneList,
    MilestoneUpdate,
} from '../models';
import { AxiosResponse } from 'axios';
import { BaseService } from '.';

interface MilestonesGetAllParams extends BaseGetAllParams {
    filters?: MilestoneFilters;
}

export class Milestones extends BaseService {
    public getAll(
        code: string, {limit, offset, filters}: MilestonesGetAllParams
    ): Promise<AxiosResponse<MilestoneList>> {
        const filterParams: Record<string, string> = new Filter(filters?.filter).filter();
        return this.api
            .get(`/milestone/${code}`, {params: {limit, offset, ...filterParams}})
            .then(this.validateResponse<MilestoneList>());
    }

    public get(code: string, milestoneId: string | number): Promise<AxiosResponse<MilestoneInfo>> {
        return this.api
            .get(`/milestone/${code}/${milestoneId}`)
            .then(this.validateResponse<MilestoneInfo>());
    }

    public exists(code: string, milestoneId: string | number): Promise<boolean> {
        return this.get(code, milestoneId)
            .then((resp: AxiosResponse<MilestoneInfo>) => Boolean(resp.data.id))
            .catch(() => false);
    }

    public create(code: string, data: MilestoneCreate): Promise<AxiosResponse<MilestoneCreated>> {
        return this.api
            .post(`/milestone/${code}`, data)
            .then(this.validateResponse<MilestoneCreated>());
    }

    public update(
        code: string, milestoneId: string | number, data: MilestoneUpdate
    ): Promise<AxiosResponse<MilestoneCreated>> {
        return this.api
            .patch(`/milestone/${code}/${milestoneId}`, data)
            .then(this.validateResponse<MilestoneCreated>());
    }

    public delete(code: string, milestoneId: string | number): Promise<AxiosResponse<undefined>> {
        return this.api
            .delete(`/milestone/${code}/${milestoneId}`)
            .then(this.validateResponse<undefined>());
    }
}
