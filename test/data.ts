
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
    // eslint-disable-next-line camelcase
    milestone_id: null,
    // eslint-disable-next-line camelcase
    suite_id: 1,
    tags: [],
    links: [],
    revision: 1,
    // eslint-disable-next-line camelcase
    custom_fields: [],
    attachments: [],
    steps: [],
    created: '2018-05-02T20:32:23.000000Z',
    updated: '2019-07-21T13:24:08.000000Z',
});

export const list = (data: Record<any, any>): Record<any, any> => ({
    total: 10,
    filtered: 10,
    count: 1,
    entities: [data],
});

export const statusTrue = (data: Record<any, any>): Record<any, any> => ({status: true, result: data});
