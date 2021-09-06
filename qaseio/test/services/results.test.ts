import 'jest';
import axios, { AxiosResponse } from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { QaseApi } from '../../src/qaseio';
import { Filter, Automation, RunFilters, RunInfo, RunList, RunStatus, RunCreated, ResultUpdate, ResultList, ResultInfo, ResultCreate, ResultCreated, ResultStatus, ResultStepCreate, ResultFilters } from '../../src/models';
import { list, run, statusTrue, result } from '../data';

const mock = new MockAdapter(axios);

describe('Result api', () => {
    Array.from([
        {limit: 10, offset: 30},
        {offset: 30},
        {limit: 10},
    ]).forEach((params) => {
        it('Get all results', async () => {
            const content = list(result())
            mock.onGet('/result/TEST').reply(200, statusTrue(content))
            const client = new QaseApi('123')
            const resp: AxiosResponse<ResultList> = await client.results.getAll('TEST', params)
            expect(resp.config.params).toEqual(params)
            expect(resp.data).toEqual(content as ResultList)
        })
    })

    it('Get specific result', async () => {
        const content = result()
        mock.onGet('/result/TEST/1q2w3e').reply(200, statusTrue(content))
        const client = new QaseApi('123')
        const resp: AxiosResponse<ResultInfo> = await client.results.get('TEST', '1q2w3e')
        expect(resp.data).toEqual(content as ResultInfo)
    })


    Array.from([
        {status: 200, content: result(), equal: true},
        {status: 404, content: {}, equal: false},
    ]).forEach(({status, content, equal}) => {
        it('Check result exists', async () => {
            mock.onGet('/result/TEST/1q2w3e').reply(status, statusTrue(content))
            const client = new QaseApi('123')
            const exists: boolean = await client.results.exists('TEST', '1q2w3e')
            expect(exists).toEqual(equal)
        })
    })

    it('Create new result', async () => {
        const content = {hash: '1q2w3e'}
        mock.onPost('/result/TEST/123').reply(200, statusTrue(content))
        const client = new QaseApi('123')
        const create = new ResultCreate(
            3, ResultStatus.IN_PROGRESS, {comment: 'some', steps: [new ResultStepCreate(2, ResultStatus.PASSED)]}
        )
        const resp: AxiosResponse<ResultCreated> = await client.results.create('TEST', 123, create)
        expect(resp.config.data).toEqual(JSON.stringify({
            case_id: 3,
            status: 'in_progress',
            comment: 'some',
            steps: [{
                position: 2,
                status: 'passed',
                attachments: [],
            }],
        }))
        expect(resp.data).toEqual(content as ResultCreated)
    })

    it('Update result', async () => {
        const content = {hash: '1q2w3e'}
        mock.onPatch('/result/TEST/123/1q2w3e').reply(200, statusTrue(content))
        const client = new QaseApi('123')
        const update = new ResultUpdate(
            {status: ResultStatus.IN_PROGRESS, comment: 'some', steps: [new ResultStepCreate(2, ResultStatus.PASSED)]}
        )
        const resp: AxiosResponse<ResultCreated> = await client.results.update('TEST', 123, '1q2w3e', update)
        expect(resp.config.data).toEqual(JSON.stringify({
            status: 'in_progress',
            comment: 'some',
            steps: [{
                position: 2,
                status: 'passed',
                attachments: [],
            }],
        }))
        expect(resp.data).toEqual(content as ResultCreated)
    })

    it('Delete result', async () => {
        mock.onDelete('/result/TEST/123/1q2w3e').reply(200, statusTrue({}))
        const client = new QaseApi('123')
        const resp: AxiosResponse<undefined> = await client.results.delete('TEST', 123, '1q2w3e')
        expect(resp.data).toEqual({})
    })
    
    it('Validate filters', () => {
        const filter = new Filter(new ResultFilters(
            {
                status: [ResultStatus.IN_PROGRESS, ResultStatus.FAILED],
                to_end_time: 'sometime'
            }
        ).filter);
        expect(filter.filter()).toEqual(
            {'filters[status]': 'in_progress,failed', 'filters[to_end_time]': 'sometime'}
        )
    })
})
