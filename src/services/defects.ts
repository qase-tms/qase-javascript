import {
    BaseGetAllParams,
    DefectFilters,
    DefectInfo,
    DefectList,
    DefectUpdated,
    Filter,
} from '../models';
import { AxiosResponse } from 'axios';
import { BaseService } from '.';

interface DefectsGetAllParams extends BaseGetAllParams {
    filters?: DefectFilters;
}

export class Defects extends BaseService {
    public getAll(code: string, {limit, offset, filters}: DefectsGetAllParams): Promise<AxiosResponse<DefectList>> {
        const filterParams: Record<string, string> = new Filter(filters?.filter).filter();
        return this.api
            .get(`/defect/${code}`, {params: {limit, offset, ...filterParams}})
            .then(this.validateResponse<DefectList>());
    }

    public get(code: string, defectId: string | number): Promise<AxiosResponse<DefectInfo>> {
        return this.api
            .get(`/defect/${code}/${defectId}`)
            .then(this.validateResponse<DefectInfo>());
    }

    public exists(code: string, defectId: string | number): Promise<boolean> {
        return this.get(code, defectId)
            .then((resp: AxiosResponse<DefectInfo>) => Boolean(resp.data.id))
            .catch(() => false);
    }

    public resolve(code: string, defectId: string | number): Promise<AxiosResponse<DefectUpdated>> {
        return this.api
            .patch(`/defect/${code}/resolve/${defectId}`)
            .then(this.validateResponse<DefectUpdated>());
    }

    public delete(code: string, defectId: string | number): Promise<AxiosResponse<undefined>> {
        return this.api
            .delete(`/defect/${code}/${defectId}`)
            .then(this.validateResponse<undefined>());
    }
}
