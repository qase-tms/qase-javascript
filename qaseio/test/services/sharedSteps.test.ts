import 'jest';
import axios, { AxiosResponse } from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { QaseApi } from '../../src/qaseio';
import { Filter, SharedStepInfo, SharedStepList, SharedStepCreated, SharedStepCreate, SharedStepUpdate, SharedStepFilters } from '../../src/models';
import { list, sharedStep, statusTrue } from "../data";

const mock = new MockAdapter(axios);

describe('SharedStep api', () => {
    Array.from([
        {limit: 10, offset: 30},
        {offset: 30},
        {limit: 10},
    ]).forEach((params) => {
        it('Get all shared steps', async () => {
            const content = list(sharedStep())
            mock.onGet("/shared_step/TEST").reply(200, statusTrue(content))
            const client = new QaseApi('123')
            const resp: AxiosResponse<SharedStepList> = await client.sharedSteps.getAll("TEST", params)
            expect(resp.config.params).toEqual(params)
            expect(resp.data).toEqual(content as SharedStepList)
        })
    })

    it('Get specific shared step', async () => {
        const content = sharedStep()
        mock.onGet("/shared_step/TEST/1q2w3e").reply(200, statusTrue(content))
        const client = new QaseApi('123')
        const resp: AxiosResponse<SharedStepInfo> = await client.sharedSteps.get("TEST", "1q2w3e")
        expect(resp.data).toEqual(content as SharedStepInfo)
    })


    Array.from([
        {status: 200, content: sharedStep(), equal: true},
        {status: 404, content: {}, equal: false},
    ]).forEach(({status, content, equal}) => {
        it('Check shared step exists', async () => {
            mock.onGet("/shared_step/TEST/1q2w3e").reply(status, statusTrue(content))
            const client = new QaseApi('123')
            const exists: boolean = await client.sharedSteps.exists("TEST", "1q2w3e")
            expect(exists).toEqual(equal)
        })
    })

    it('Create new shared step', async () => {
        const content = {hash: '1q2w3e'}
        mock.onPost("/shared_step/TEST").reply(200, statusTrue(content))
        const client = new QaseApi('123')
        const create = new SharedStepCreate("new", "data", {expected_result: "some"})
        const resp: AxiosResponse<SharedStepCreated> = await client.sharedSteps.create('TEST', create)
        expect(resp.config.data).toEqual(JSON.stringify({
            title: 'new',
            action: 'data',
            expected_result: 'some',
        }))
        expect(resp.data).toEqual(content as SharedStepCreated)
    })

    it('Update shared step', async () => {
        const content = {hash: '1q2w3e'}
        mock.onPatch("/shared_step/TEST/1q2w3e").reply(200, statusTrue(content))
        const client = new QaseApi('123')
        const update = new SharedStepUpdate({title: "new", action: "some"})
        const resp: AxiosResponse<SharedStepCreated> = await client.sharedSteps.update('TEST', "1q2w3e", update)
        expect(resp.config.data).toEqual(JSON.stringify({
            title: 'new',
            action: 'some',
        }))
        expect(resp.data).toEqual(content as SharedStepCreated)
    })

    it('Delete shared step', async () => {
        mock.onDelete("/shared_step/TEST/1q2w3e").reply(200, statusTrue({}))
        const client = new QaseApi('123')
        const resp: AxiosResponse<undefined> = await client.sharedSteps.delete("TEST", "1q2w3e")
        expect(resp.data).toEqual({})
    })
    
    it('Validate filters', () => {
        const filter = new Filter(new SharedStepFilters(
            {search: "some"}
        ).filter);
        expect(filter.filter()).toEqual(
            {"filters[search]": "some"}
        )
    })
})
