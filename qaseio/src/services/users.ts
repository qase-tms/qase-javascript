import { BaseGetAllParams, UserInfo, UserList } from '../models';
import { AxiosResponse } from 'axios';
import { BaseService } from '.';


export class Users extends BaseService {
    public getAll({limit, offset}: BaseGetAllParams): Promise<AxiosResponse<UserList>> {
        return this.api
            .get('/user', {params: {limit, offset}})
            .then(this.validateResponse<UserList>());
    }

    public get(userId: string | number): Promise<AxiosResponse<UserInfo>> {
        return this.api
            .get(`/user/${userId}`)
            .then(this.validateResponse<UserInfo>());
    }

    public exists(userId: string | number): Promise<boolean> {
        return this.get(userId)
            .then((resp: AxiosResponse<UserInfo>) => Boolean(resp.data.id))
            .catch(() => false);
    }
}
