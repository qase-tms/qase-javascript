import { BaseGetAllParams, ProjectCreate, ProjectCreated, ProjectInfo, ProjectList } from '../models';
import { AxiosResponse } from 'axios';
import { BaseService } from '.';


export class Projects extends BaseService {
    public getAll({limit, offset}: BaseGetAllParams): Promise<AxiosResponse<ProjectList>> {
        return this.api
            .get('/project', {params: {limit, offset}})
            .then(this.validateResponse<ProjectList>());
    }

    public get(code: string): Promise<AxiosResponse<ProjectInfo>> {
        return this.api
            .get(`/project/${code}`)
            .then(this.validateResponse<ProjectInfo>());
    }

    public create(data: ProjectCreate): Promise<AxiosResponse<ProjectCreated>> {
        return this.api
            .post('/project', data)
            .then(this.validateResponse<ProjectCreated>());
    }

    public exists(code: string): Promise<boolean> {
        return this.get(code)
            .then((resp: AxiosResponse<ProjectInfo>) => Boolean(resp.data.code))
            .catch(() => false);
    }
}
