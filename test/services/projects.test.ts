import 'jest';
import axios, { AxiosResponse } from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { QaseApi } from '../../src/qaseio';
import { ProjectList, ProjectInfo, ProjectCreated, ProjectCreate } from '../../src/models';
import { list, project, statusTrue } from "../data";

const mock = new MockAdapter(axios);

describe('Project api', () => {
    Array.from([
        {limit: 10, offset: 30},
        {offset: 30},
        {limit: 10},
    ]).forEach((params) => {
        it('Get all projects', async () => {
            const content = list(project())
            mock.onGet("/project").reply(200, statusTrue(content))
            const client = new QaseApi('123')
            const resp: AxiosResponse<ProjectList> = await client.projects.getAll(params.limit, params.offset)
            expect(resp.config.params).toEqual(params)
            expect(resp.data).toEqual(content as ProjectList)
        })
    })

    it('Get specific project', async() => {
        const content = project()
        mock.onGet("/project/TEST").reply(200, statusTrue(content))
        const client = new QaseApi('123')
        const resp: AxiosResponse<ProjectInfo> = await client.projects.get("TEST")
        expect(resp.data).toEqual(content as ProjectInfo)
    })


    Array.from([
        {status: 200, content: project(), equal: true},
        {status: 404, content: {}, equal: false},
    ]).forEach(({status, content, equal}) => {
        it('Check project exists', async () => {
            mock.onGet("/project/TEST").reply(status, statusTrue(content))
            const client = new QaseApi('123')
            const exists: boolean = await client.projects.exists("TEST")
            expect(exists).toEqual(equal)
        })
    })

    it('Create new project', async () => {
        const content = {code: "TEST"}
        mock.onPost("/project").reply(200, statusTrue(content))
        const client = new QaseApi('123')
        const create = new ProjectCreate("new project", "TEST")
        const resp: AxiosResponse<ProjectCreated> = await client.projects.create(create)
        expect(resp.config.data).toEqual(JSON.stringify(create))
        expect(resp.data).toEqual(content as ProjectCreated)
    })
})
