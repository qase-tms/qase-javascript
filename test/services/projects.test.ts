import 'jest';
import axios, { AxiosResponse } from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { QaseIo } from '../../src/qaseio';
import { ProjectList, ProjectInfo, ProjectCreated, ProjectCreate } from '../../src/models';
import { list, project, statusTrue } from "../data";

const mock = new MockAdapter(axios);

describe('Project api', () => {
    Array.from([
        {limit: 10, offset: 30},
        {offset: 30},
        {limit: 10},
    ]).forEach((params) => {
        it('Get all projects', () => {
            const content = list(project())
            mock.onGet("/project").reply(200, statusTrue(content))
            const client = new QaseIo('123')
            client.projects.getAll(params.limit, params.offset).then((resp: AxiosResponse<ProjectList>) => {
                expect(resp.config.params).toEqual(params)
                expect(resp.data).toEqual(content as ProjectList)
            })
        })
    })

    it('Get specific project', () => {
        const content = project()
        mock.onGet("/project/TEST").reply(200, statusTrue(content))
        const client = new QaseIo('123')
        client.projects.get("TEST").then((resp: AxiosResponse<ProjectInfo>) => {
            expect(resp.data).toEqual(content as ProjectInfo)
        })
    })


    Array.from([
        {status: 200, content: project(), equal: true},
        {status: 404, content: {}, equal: false},
    ]).forEach(({status, content, equal}) => {
        it('Check project exists', () => {
            mock.onGet("/project/TEST").reply(status, statusTrue(content))
            const client = new QaseIo('123')
            client.projects.exists("TEST").then((exists: boolean) => {
                expect(exists).toEqual(equal)
            })
        })
    })

    it('Create new project', () => {
        const content = {code: "TEST"}
        mock.onPost("/project").reply(200, statusTrue(content))
        const client = new QaseIo('123')
        const create = new ProjectCreate("new project", "TEST")
        client.projects.create(create).then((resp: AxiosResponse<ProjectCreated>) => {
            expect(resp.config.data).toEqual(JSON.stringify(create))
            expect(resp.data).toEqual(content as ProjectCreated)
        })
    })
})
