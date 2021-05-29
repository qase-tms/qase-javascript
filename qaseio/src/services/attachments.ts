import { AttachmentCreated, AttachmentInfo, AttachmentList, BaseGetAllParams } from '../models';
import { AxiosResponse } from 'axios';
import { BaseService } from '.';
import FormData from 'form-data';


export class Attachments extends BaseService {
    public getAll({limit, offset}: BaseGetAllParams): Promise<AxiosResponse<AttachmentList>> {
        return this.api
            .get('/attachment', {params: {limit, offset}})
            .then(this.validateResponse<AttachmentList>());
    }

    public get(hash: string): Promise<AxiosResponse<AttachmentInfo>> {
        return this.api
            .get(`/attachment/${hash}`)
            .then(this.validateResponse<AttachmentInfo>());
    }

    public create(
        code: string, ...files: Array<{value: string | Blob; filename?: string}>
    ): Promise<AxiosResponse<AttachmentCreated>> {
        const data = new FormData();
        files.forEach(({ value, filename }, index) => {
            data.append(index.toString(), value, filename);
        });
        return this.api
            .post(`/attachment/${code}`, data, { headers: data.getHeaders() })
            .then(this.validateResponse<AttachmentCreated>());
    }

    public delete(hash: string): Promise<AxiosResponse<undefined>> {
        return this.api
            .delete(`/attachment/${hash}`)
            .then(this.validateResponse<undefined>());
    }

    public exists(code: string): Promise<boolean> {
        return this.get(code)
            .then((resp: AxiosResponse<AttachmentInfo>) => Boolean(resp.data.hash))
            .catch(() => false);
    }
}
