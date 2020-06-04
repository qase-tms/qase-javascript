import 'jest';
import axios, { AxiosResponse } from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { QaseApi } from '../../src/qaseio';
import { TestCaseInfo, TestCaseList } from '../../src/models';
import { list, cases, statusTrue } from "../data";

const mock = new MockAdapter(axios);

describe('Case api', () => {
    Array.from([
        {limit: 10, offset: 30},
        {offset: 30},
        {limit: 10},
    ]).forEach((params) => {
        it('Get all cases', async () => {
            const content = list(cases())
            mock.onGet("/case/TEST").reply(200, statusTrue(content))
            const client = new QaseApi('123')
            const resp: AxiosResponse<TestCaseList> = await client.cases.getAll("TEST", params.limit, params.offset)
            expect(resp.config.params).toEqual(params)
            expect(resp.data).toEqual(content as TestCaseList)
        })
    })

    it('Get specific case', async () => {
        const content = cases()
        mock.onGet("/case/TEST/123").reply(200, statusTrue(content))
        const client = new QaseApi('123')
        const resp: AxiosResponse<TestCaseInfo> = await client.cases.get("TEST", 123)
        expect(resp.data).toEqual(content as TestCaseInfo)
    })


    Array.from([
        {status: 200, content: cases(), equal: true},
        {status: 404, content: {}, equal: false},
    ]).forEach(({status, content, equal}) => {
        it('Check case exists', async () => {
            mock.onGet("/case/TEST/123").reply(status, statusTrue(content))
            const client = new QaseApi('123')
            const exists: boolean = await client.cases.exists("TEST", 123)
            expect(exists).toEqual(equal)
        })
    })

    it('Delete case', async () => {
        mock.onDelete("/case/TEST/123").reply(200, statusTrue({}))
        const client = new QaseApi('123')
        const resp: AxiosResponse<undefined> = await client.cases.delete("TEST", 123)
        expect(resp.data).toEqual({})
    })
})
