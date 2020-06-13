/* eslint-disable camelcase */

export const project = (): Record<any, any> => ({
    title: 'Demo Project',
    code: 'DEMO',
    counts: {
        cases: 10,
        suites: 3,
        milestones: 0,
        runs: {total: 1, active: 1},
        defects: {total: 0, open: 0},
    },
});

export const cases = (): Record<any, any> => ({
    id: 5,
    position: 1,
    title: 'Test case',
    description: 'Description for case',
    preconditions: '',
    postconditions: '',
    severity: 4,
    priority: 2,
    type: 1,
    behavior: 2,
    automation: 'is-not-automated',
    status: 'actual',
    milestone_id: null,
    suite_id: 1,
    tags: [],
    links: [],
    revision: 1,
    custom_fields: [],
    attachments: [],
    steps: [],
    created: '2018-05-02T20:32:23.000000Z',
    updated: '2019-07-21T13:24:08.000000Z',
});

export const run = (): Record<any, any> => ({
    id: 1,
    title: 'Test run 2019/12/12',
    description: null,
    status: 0,
    start_time: '2019-12-12 12:12:12',
    end_time: null,
    public: false,
    stats: {
        total: 3,
        untested: 3,
        passed: 0,
        failed: 0,
        blocked: 0,
        skipped: 0,
        retest: 0,
        deleted: 4,
    },
    time_spent: 0,
    user_id: 1,
    environment: null,
    cases: [1, 2, 3],
});

export const list = (data: Record<any, any>): Record<any, any> => ({
    total: 10,
    filtered: 10,
    count: 1,
    entities: [data],
});

export const statusTrue = (data: Record<any, any>): Record<any, any> => ({status: true, result: data});
