import { BaseGetAllParams, CustomFieldInfo, CustomFieldList } from '../models';
import { AxiosResponse } from 'axios';
import { BaseService } from '.';

export class CustomFields extends BaseService {
    public getAll(code: string, {limit, offset}: BaseGetAllParams): Promise<AxiosResponse<CustomFieldList>> {
        return this.api
            .get(`/custom_field/${code}`, {params: {limit, offset}})
            .then(this.validateResponse<CustomFieldList>());
    }

    public get(code: string, fieldId: string | number): Promise<AxiosResponse<CustomFieldInfo>> {
        return this.api
            .get(`/custom_field/${code}/${fieldId}`)
            .then(this.validateResponse<CustomFieldInfo>());
    }

    public exists(code: string, fieldId: string | number): Promise<boolean> {
        return this.get(code, fieldId)
            .then((resp: AxiosResponse<CustomFieldInfo>) => Boolean(resp.data.id))
            .catch(() => false);
    }
}
