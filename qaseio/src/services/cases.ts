import { BaseGetAllParams, Filter, TestCaseFilters, TestCaseInfo, TestCaseList } from '../models';
import { AxiosResponse } from 'axios';
import { BaseService } from '.';

interface CasesGetAllParams extends BaseGetAllParams {
    filters?: TestCaseFilters;
}

export class Cases extends BaseService {
    public getAll(code: string, {limit, offset, filters}: CasesGetAllParams): Promise<AxiosResponse<TestCaseList>> {
        const filterParams: Record<string, string> = new Filter(filters?.filter).filter();
        return this.api
            .get(`/case/${code}`, {params: {limit, offset, ...filterParams}})
            .then(this.validateResponse<TestCaseList>());
    }

    public get(code: string, caseId: string | number): Promise<AxiosResponse<TestCaseInfo>> {
        return this.api
            .get(`/case/${code}/${caseId}`)
            .then(this.validateResponse<TestCaseInfo>());
    }

    public exists(code: string, caseId: string | number): Promise<boolean> {
        return this.get(code, caseId)
            .then((resp: AxiosResponse<TestCaseInfo>) => Boolean(resp.data.id))
            .catch(() => false);
    }

    public delete(code: string, caseId: string | number): Promise<AxiosResponse<undefined>> {
        return this.api
            .delete(`/case/${code}/${caseId}`)
            .then(this.validateResponse<undefined>());
    }
}
