import 'jest';
import axios, { AxiosResponse } from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { QaseApi } from '../../src/qaseio';
import { Filter, Automation, RunFilters, RunInfo, RunList, RunStatus, RunCreated, RunCreate } from '../../src/models';
import { list, run, statusTrue } from "../data";

const mock = new MockAdapter(axios);

describe('Run api', () => {
    Array.from([
        {limit: 10, offset: 30},
        {offset: 30},
        {limit: 10},
    ]).forEach((params) => {
        it('Get all runs', async () => {
            const content = list(run())
            mock.onGet("/run/TEST").reply(200, statusTrue(content))
            const client = new QaseApi('123')
            const resp: AxiosResponse<RunList> = await client.runs.getAll("TEST", params)
            expect(resp.config.params).toEqual(params)
            expect(resp.data).toEqual(content as RunList)
        })
    })

    it('Get specific run', async () => {
        const content = run()
        mock.onGet("/run/TEST/123").reply(200, statusTrue(content))
        const client = new QaseApi('123')
        const resp: AxiosResponse<RunInfo> = await client.runs.get("TEST", 123)
        expect(resp.data).toEqual(content as RunInfo)
    })


    Array.from([
        {status: 200, content: run(), equal: true},
        {status: 404, content: {}, equal: false},
    ]).forEach(({status, content, equal}) => {
        it('Check run exists', async () => {
            mock.onGet("/run/TEST/123").reply(status, statusTrue(content))
            const client = new QaseApi('123')
            const exists: boolean = await client.runs.exists("TEST", 123)
            expect(exists).toEqual(equal)
        })
    })

    it('Create new run', async () => {
        const content = {id: 1}
        mock.onPost("/run/TEST").reply(200, statusTrue(content))
        const client = new QaseApi('123')
        const create = new RunCreate("new", [1,2,3], {environment_id: 1, description: "some"})
        const resp: AxiosResponse<RunCreated> = await client.runs.create('TEST', create)
        expect(resp.config.data).toEqual(JSON.stringify({
            title: 'new',
            cases: [1, 2, 3],
            environment_id: 1,
            description: 'some',
        }))
        expect(resp.data).toEqual(content as RunCreated)
    })

    it('Delete run', async () => {
        mock.onDelete("/run/TEST/123").reply(200, statusTrue({}))
        const client = new QaseApi('123')
        const resp: AxiosResponse<undefined> = await client.runs.delete("TEST", 123)
        expect(resp.data).toEqual({})
    })

    it('Validate filters', () => {
        const filter = new Filter(new RunFilters(
            {status: [RunStatus.ABORT, RunStatus.ACTIVE]}
        ).filter);
        expect(filter.filter()).toEqual(
            {"filter[status]": "abort,active"}
        )
    })
})
