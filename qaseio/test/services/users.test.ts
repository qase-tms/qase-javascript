import 'jest';
import axios, { AxiosResponse } from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { QaseApi } from '../../src/qaseio';
import { UserList, UserInfo } from '../../src/models';
import { list, user, statusTrue } from "../data";

const mock = new MockAdapter(axios);

describe('User api', () => {
    Array.from([
        {limit: 10, offset: 30},
        {offset: 30},
        {limit: 10},
    ]).forEach((params) => {
        it('Get all users', async () => {
            const content = list(user())
            mock.onGet("/user").reply(200, statusTrue(content))
            const client = new QaseApi('123')
            const resp: AxiosResponse<UserList> = await client.users.getAll(params)
            expect(resp.config.params).toEqual(params)
            expect(resp.data).toEqual(content as UserList)
        })
    })

    it('Get specific user', async() => {
        const content = user()
        mock.onGet("/user/123").reply(200, statusTrue(content))
        const client = new QaseApi('123')
        const resp: AxiosResponse<UserInfo> = await client.users.get(123)
        expect(resp.data).toEqual(content as UserInfo)
    })


    Array.from([
        {status: 200, content: user(), equal: true},
        {status: 404, content: {}, equal: false},
    ]).forEach(({status, content, equal}) => {
        it('Check user exists', async () => {
            mock.onGet("/user/123").reply(status, statusTrue(content))
            const client = new QaseApi('123')
            const exists: boolean = await client.users.exists(123)
            expect(exists).toEqual(equal)
        })
    })
})
