import 'jest';
import axios, { AxiosResponse } from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { QaseApi } from '../../src/qaseio';
import { CustomFieldInfo, CustomFieldList } from '../../src/models';
import { list, customField, statusTrue } from "../data";

const mock = new MockAdapter(axios);

describe('Custom fields api', () => {
    Array.from([
        {limit: 10, offset: 30},
        {offset: 30},
        {limit: 10},
    ]).forEach((params) => {
        it('Get all fields', async () => {
            const content = list(customField())
            mock.onGet("/custom_field/TEST").reply(200, statusTrue(content))
            const client = new QaseApi('123')
            const resp: AxiosResponse<CustomFieldList> = await client.customFields.getAll("TEST", params)
            expect(resp.config.params).toEqual(params)
            expect(resp.data).toEqual(content as CustomFieldList)
        })
    })

    it('Get specific field', async () => {
        const content = customField()
        mock.onGet("/custom_field/TEST/123").reply(200, statusTrue(content))
        const client = new QaseApi('123')
        const resp: AxiosResponse<CustomFieldInfo> = await client.customFields.get("TEST", 123)
        expect(resp.data).toEqual(content as CustomFieldInfo)
    })


    Array.from([
        {status: 200, content: customField(), equal: true},
        {status: 404, content: {}, equal: false},
    ]).forEach(({status, content, equal}) => {
        it('Check field exists', async () => {
            mock.onGet("/custom_field/TEST/123").reply(status, statusTrue(content))
            const client = new QaseApi('123')
            const exists: boolean = await client.customFields.exists("TEST", 123)
            expect(exists).toEqual(equal)
        })
    })
})
