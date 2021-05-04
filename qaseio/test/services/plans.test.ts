import 'jest';
import axios, { AxiosResponse } from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { QaseApi } from '../../src/qaseio';
import { PlanInfo, PlanList, PlanCreated, PlanCreate, PlanUpdate } from '../../src/models';
import { list, plan, statusTrue } from "../data";

const mock = new MockAdapter(axios);

describe('Plan api', () => {
    Array.from([
        {limit: 10, offset: 30},
        {offset: 30},
        {limit: 10},
    ]).forEach((params) => {
        it('Get all plans', async () => {
            const content = list(plan())
            mock.onGet("/plan/TEST").reply(200, statusTrue(content))
            const client = new QaseApi('123')
            const resp: AxiosResponse<PlanList> = await client.plans.getAll("TEST", params)
            expect(resp.config.params).toEqual(params)
            expect(resp.data).toEqual(content as PlanList)
        })
    })

    it('Get specific plan', async () => {
        const content = plan()
        mock.onGet("/plan/TEST/123").reply(200, statusTrue(content))
        const client = new QaseApi('123')
        const resp: AxiosResponse<PlanInfo> = await client.plans.get("TEST", 123)
        expect(resp.data).toEqual(content as PlanInfo)
    })


    Array.from([
        {status: 200, content: plan(), equal: true},
        {status: 404, content: {}, equal: false},
    ]).forEach(({status, content, equal}) => {
        it('Check plan exists', async () => {
            mock.onGet("/plan/TEST/123").reply(status, statusTrue(content))
            const client = new QaseApi('123')
            const exists: boolean = await client.plans.exists("TEST", 123)
            expect(exists).toEqual(equal)
        })
    })

    it('Create new plan', async () => {
        const content = {id: 1}
        mock.onPost("/plan/TEST").reply(200, statusTrue(content))
        const client = new QaseApi('123')
        const create = new PlanCreate("new", [1,2,3], {description: "some"})
        const resp: AxiosResponse<PlanCreated> = await client.plans.create('TEST', create)
        expect(resp.config.data).toEqual(JSON.stringify({
            title: 'new',
            cases: [1, 2, 3],
            description: 'some',
        }))
        expect(resp.data).toEqual(content as PlanCreated)
    })

    it('Update plan', async () => {
        const content = {id: 1}
        mock.onPatch("/plan/TEST/123").reply(200, statusTrue(content))
        const client = new QaseApi('123')
        const update = new PlanUpdate({title: "new", cases: [1,2,3], description: "some"})
        const resp: AxiosResponse<PlanCreated> = await client.plans.update('TEST', 123, update)
        expect(resp.config.data).toEqual(JSON.stringify({
            cases: [1, 2, 3],
            title: 'new',
            description: 'some',
        }))
        expect(resp.data).toEqual(content as PlanCreated)
    })

    it('Delete plan', async () => {
        mock.onDelete("/plan/TEST/123").reply(200, statusTrue({}))
        const client = new QaseApi('123')
        const resp: AxiosResponse<undefined> = await client.plans.delete("TEST", 123)
        expect(resp.data).toEqual({})
    })
    
    it('Validate create', () => {
        expect(() => new PlanCreate("new")).toThrow()
    })
})
