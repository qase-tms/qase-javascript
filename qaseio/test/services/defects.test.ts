import 'jest';
import axios, { AxiosResponse } from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { QaseApi } from '../../src/qaseio';
import { Filter, DefectInfo, DefectList, DefectUpdated, DefectFilters, DefectStatus } from '../../src/models';
import { list, defect, statusTrue } from "../data";

const mock = new MockAdapter(axios);

describe('Defect api', () => {
    Array.from([
        {limit: 10, offset: 30},
        {offset: 30},
        {limit: 10},
    ]).forEach((params) => {
        it('Get all defects', async () => {
            const content = list(defect())
            mock.onGet("/defect/TEST").reply(200, statusTrue(content))
            const client = new QaseApi('123')
            const resp: AxiosResponse<DefectList> = await client.defects.getAll("TEST", params)
            expect(resp.config.params).toEqual(params)
            expect(resp.data).toEqual(content as DefectList)
        })
    })

    it('Get specific defect', async () => {
        const content = defect()
        mock.onGet("/defect/TEST/123").reply(200, statusTrue(content))
        const client = new QaseApi('123')
        const resp: AxiosResponse<DefectInfo> = await client.defects.get("TEST", 123)
        expect(resp.data).toEqual(content as DefectInfo)
    })


    Array.from([
        {status: 200, content: defect(), equal: true},
        {status: 404, content: {}, equal: false},
    ]).forEach(({status, content, equal}) => {
        it('Check defect exists', async () => {
            mock.onGet("/defect/TEST/123").reply(status, statusTrue(content))
            const client = new QaseApi('123')
            const exists: boolean = await client.defects.exists("TEST", 123)
            expect(exists).toEqual(equal)
        })
    })

    it('Resolve defect', async () => {
        const content = {id: 1}
        mock.onPatch("/defect/TEST/resolve/123").reply(200, statusTrue(content))
        const client = new QaseApi('123')
        const resp: AxiosResponse<DefectUpdated> = await client.defects.resolve('TEST', 123)
        expect(resp.data).toEqual(content as DefectUpdated)
    })

    it('Delete defect', async () => {
        mock.onDelete("/defect/TEST/123").reply(200, statusTrue({}))
        const client = new QaseApi('123')
        const resp: AxiosResponse<undefined> = await client.defects.delete("TEST", 123)
        expect(resp.data).toEqual({})
    })
    
    it('Validate filters', () => {
        const filter = new Filter(new DefectFilters(
            {status: DefectStatus.OPEN}
        ).filter);
        expect(filter.filter()).toEqual(
            {"filters[status]": "open"}
        )
    })
})
