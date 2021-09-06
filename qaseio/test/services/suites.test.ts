import 'jest';
import axios, { AxiosResponse } from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { QaseApi } from '../../src/qaseio';
import { Filter, SuiteInfo, SuiteList, SuiteCreated, SuiteCreate, SuiteUpdate, SuiteFilters } from '../../src/models';
import { list, suite, statusTrue } from "../data";

const mock = new MockAdapter(axios);

describe('Suite api', () => {
    Array.from([
        {limit: 10, offset: 30},
        {offset: 30},
        {limit: 10},
    ]).forEach((params) => {
        it('Get all suites', async () => {
            const content = list(suite())
            mock.onGet("/suite/TEST").reply(200, statusTrue(content))
            const client = new QaseApi('123')
            const resp: AxiosResponse<SuiteList> = await client.suites.getAll("TEST", params)
            expect(resp.config.params).toEqual(params)
            expect(resp.data).toEqual(content as SuiteList)
        })
    })

    it('Get specific suite', async () => {
        const content = suite()
        mock.onGet("/suite/TEST/123").reply(200, statusTrue(content))
        const client = new QaseApi('123')
        const resp: AxiosResponse<SuiteInfo> = await client.suites.get("TEST", 123)
        expect(resp.data).toEqual(content as SuiteInfo)
    })


    Array.from([
        {status: 200, content: suite(), equal: true},
        {status: 404, content: {}, equal: false},
    ]).forEach(({status, content, equal}) => {
        it('Check suite exists', async () => {
            mock.onGet("/suite/TEST/123").reply(status, statusTrue(content))
            const client = new QaseApi('123')
            const exists: boolean = await client.suites.exists("TEST", 123)
            expect(exists).toEqual(equal)
        })
    })

    it('Create new suite', async () => {
        const content = {id: 1}
        mock.onPost("/suite/TEST").reply(200, statusTrue(content))
        const client = new QaseApi('123')
        const create = new SuiteCreate("new", {description: "some"})
        const resp: AxiosResponse<SuiteCreated> = await client.suites.create('TEST', create)
        expect(resp.config.data).toEqual(JSON.stringify({
            title: 'new',
            description: 'some',
        }))
        expect(resp.data).toEqual(content as SuiteCreated)
    })

    it('Update suite', async () => {
        const content = {id: 1}
        mock.onPatch("/suite/TEST/123").reply(200, statusTrue(content))
        const client = new QaseApi('123')
        const update = new SuiteUpdate({title: "new", description: "some"})
        const resp: AxiosResponse<SuiteCreated> = await client.suites.update('TEST', 123, update)
        expect(resp.config.data).toEqual(JSON.stringify({
            title: 'new',
            description: 'some',
        }))
        expect(resp.data).toEqual(content as SuiteCreated)
    })

    it('Delete suite', async () => {
        mock.onDelete("/suite/TEST/123").reply(200, statusTrue({}))
        const client = new QaseApi('123')
        const resp: AxiosResponse<undefined> = await client.suites.delete("TEST", 123)
        expect(resp.data).toEqual({})
    })
    
    it('Validate filters', () => {
        const filter = new Filter(new SuiteFilters(
            {search: "some"}
        ).filter);
        expect(filter.filter()).toEqual(
            {"filters[search]": "some"}
        )
    })
})
