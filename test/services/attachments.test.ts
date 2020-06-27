import 'jest';
import axios, { AxiosResponse } from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { QaseApi } from '../../src/qaseio';
import { ProjectList, ProjectInfo, ProjectCreated, ProjectCreate, AttachmentList, AttachmentInfo, AttachmentCreated } from '../../src/models';
import { list, project, statusTrue, attachment, attachment_created } from "../data";

const mock = new MockAdapter(axios);

describe('Attachments api', () => {
    Array.from([
        {limit: 10, offset: 30},
        {offset: 30},
        {limit: 10},
    ]).forEach((params) => {
        it('Get all attachments', async () => {
            const content = list(attachment())
            mock.onGet("/attachment").reply(200, statusTrue(content))
            const client = new QaseApi('123')
            const resp: AxiosResponse<AttachmentList> = await client.attachments.getAll(params)
            expect(resp.config.params).toEqual(params)
            expect(resp.data).toEqual(content as AttachmentList)
        })
    })

    it('Get specific attachment', async() => {
        const content = attachment()
        mock.onGet("/attachment/1q2w3e").reply(200, statusTrue(content))
        const client = new QaseApi('123')
        const resp: AxiosResponse<AttachmentInfo> = await client.attachments.get("1q2w3e")
        expect(resp.data).toEqual(content as AttachmentInfo)
    })


    Array.from([
        {status: 200, content: attachment(), equal: true},
        {status: 404, content: {}, equal: false},
    ]).forEach(({status, content, equal}) => {
        it('Check attachment exists', async () => {
            mock.onGet("/attachment/1q2w3e").reply(status, statusTrue(content))
            const client = new QaseApi('123')
            const exists: boolean = await client.attachments.exists("1q2w3e")
            expect(exists).toEqual(equal)
        })
    })

    it('Create new attachment', async () => {
        const content = attachment_created()
        mock.onPost("/attachment/TEST").reply(200, statusTrue(content))
        const client = new QaseApi('123')
        const resp: AxiosResponse<AttachmentCreated> = await client.attachments.create(
            "TEST", {value: '{"test": true}', filename: "data.json"}
        )
        expect(resp.data).toEqual(content as AttachmentCreated)
    })

    it('Delete attachment', async () => {
        mock.onDelete('/attachment/1q2w3e').reply(200, statusTrue({}))
        const client = new QaseApi('123')
        const resp: AxiosResponse<undefined> = await client.attachments.delete('1q2w3e')
        expect(resp.data).toEqual({})
    })
})
