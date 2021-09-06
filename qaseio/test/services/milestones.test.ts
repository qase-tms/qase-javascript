import 'jest';
import axios, { AxiosResponse } from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { QaseApi } from '../../src/qaseio';
import { Filter, MilestoneInfo, MilestoneList, MilestoneCreated, MilestoneCreate, MilestoneUpdate, MilestoneFilters } from '../../src/models';
import { list, milestone, statusTrue } from "../data";

const mock = new MockAdapter(axios);

describe('Milestone api', () => {
    Array.from([
        {limit: 10, offset: 30},
        {offset: 30},
        {limit: 10},
    ]).forEach((params) => {
        it('Get all milestones', async () => {
            const content = list(milestone())
            mock.onGet("/milestone/TEST").reply(200, statusTrue(content))
            const client = new QaseApi('123')
            const resp: AxiosResponse<MilestoneList> = await client.milestones.getAll("TEST", params)
            expect(resp.config.params).toEqual(params)
            expect(resp.data).toEqual(content as MilestoneList)
        })
    })

    it('Get specific milestone', async () => {
        const content = milestone()
        mock.onGet("/milestone/TEST/123").reply(200, statusTrue(content))
        const client = new QaseApi('123')
        const resp: AxiosResponse<MilestoneInfo> = await client.milestones.get("TEST", 123)
        expect(resp.data).toEqual(content as MilestoneInfo)
    })


    Array.from([
        {status: 200, content: milestone(), equal: true},
        {status: 404, content: {}, equal: false},
    ]).forEach(({status, content, equal}) => {
        it('Check milestone exists', async () => {
            mock.onGet("/milestone/TEST/123").reply(status, statusTrue(content))
            const client = new QaseApi('123')
            const exists: boolean = await client.milestones.exists("TEST", 123)
            expect(exists).toEqual(equal)
        })
    })

    it('Create new milestone', async () => {
        const content = {id: 1}
        mock.onPost("/milestone/TEST").reply(200, statusTrue(content))
        const client = new QaseApi('123')
        const create = new MilestoneCreate("new", {description: "some"})
        const resp: AxiosResponse<MilestoneCreated> = await client.milestones.create('TEST', create)
        expect(resp.config.data).toEqual(JSON.stringify({
            title: 'new',
            description: 'some',
        }))
        expect(resp.data).toEqual(content as MilestoneCreated)
    })

    it('Update milestone', async () => {
        const content = {id: 1}
        mock.onPatch("/milestone/TEST/123").reply(200, statusTrue(content))
        const client = new QaseApi('123')
        const update = new MilestoneUpdate({title: "new", description: "some"})
        const resp: AxiosResponse<MilestoneCreated> = await client.milestones.update('TEST', 123, update)
        expect(resp.config.data).toEqual(JSON.stringify({
            title: 'new',
            description: 'some',
        }))
        expect(resp.data).toEqual(content as MilestoneCreated)
    })

    it('Delete milestone', async () => {
        mock.onDelete("/milestone/TEST/123").reply(200, statusTrue({}))
        const client = new QaseApi('123')
        const resp: AxiosResponse<undefined> = await client.milestones.delete("TEST", 123)
        expect(resp.data).toEqual({})
    })
    
    it('Validate filters', () => {
        const filter = new Filter(new MilestoneFilters(
            {search: "some"}
        ).filter);
        expect(filter.filter()).toEqual(
            {"filters[search]": "some"}
        )
    })
})
