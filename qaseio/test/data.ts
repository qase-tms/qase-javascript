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

export const result = (): Record<any, any> => ({
    hash: '6efce6e4f9de887a2ee863e8197cb74ab626a273',
    comment: 'some comment',
    stacktrace: 'some stacktrace',
    run_id: 1,
    case_id: 1,
    steps: null,
    status: 'Passed',
    is_api_result: true,
    time_spent: 0,
    end_time: '2018-11-11 11:11:11',
    attachments: [
        '6efce6e4f9de887a2ee863e8197cb74ab626a271',
        '6efce6e4f9de887a2ee863e8197cb74ab626a272',
    ],
});

export const attachment = (): Record<any, any> => ({
    hash: '2497be4bc95f807d2fe3c2203793673f6e5140e8',
    file: 'filename.ext',
    mime: 'text/plain',
    size: 100,
    full_path: 'https://storage.cdn.example/filename.ext',
});

export const attachment_created = (): Record<any, any> => ({
    filename: 'qaseio_pytest.py',
    url: 'https://storage.cdn.example/filename.ext',
    extension: 'py',
    hash: 'd81bb2beb147c2eceddbf3e10f98e6216cc757e3',
    mime: 'text\\/x-python',
    team: 'c66dc393c83fe149449e5de3e64545279e1442ed',
});

export const plan = (): Record<any, any> => ({
    id: 1,
    title: 'Sample plan',
    description: 'Regression',
    cases_count: 10,
    created: '2019-01-10T22:47:53.000000Z',
    updated: '2019-01-10T22:47:53.000000Z',
});

export const suite = (): Record<any, any> => ({
    id: 1,
    title: 'Level 1',
    description: 'Set from API',
    preconditions: 'Set from API',
    position: 1,
    cases_count: 10,
    parent_id: null,
    created: '2018-05-02T10:49:01.000000Z',
    updated: '2019-07-21T19:10:15.000000Z',
});

export const milestone = (): Record<any, any> => ({
    id: 1,
    title: 'Release 1.0',
    description: null,
    due_date: null,
    created: '2018-08-31T23:59:10.000000Z',
    updated: '2018-08-31T23:59:10.000000Z',
});

export const sharedStep = (): Record<any, any> => ({
    hash: '0223905c291bada23e6049d415385982af92d758',
    title: 'Shared step',
    action: 'Open signup page',
    expected_result: 'Page is opened',
    cases: [41, 35, 42, 30],
    cases_count: 4,
    created: '2019-02-09T23:16:49.000000Z',
    updated: '2019-02-09T23:16:49.000000Z',
});

export const defect = (): Record<any, any> => ({
    id: 1,
    title: 'Dangerous defect',
    actual_result: 'Something happened',
    status: 'open',
    user_id: 1,
    attachments: [],
    created: '2019-11-08T22:03:07.000000Z',
    updated: '2019-11-19T22:29:57.000000Z',
});

export const customField = (): Record<any, any> => ({
    id: 1,
    title: 'Description',
    type: 'Text',
    placeholder: 'Write something',
    default_value: null,
    value: null,
    is_required: false,
    is_visible: false,
    is_filterable: false,
    created: '2019-08-26T22:30:07.000000Z',
    updated: '2019-08-26T22:30:07.000000Z',
});

export const user = (): Record<any, any> => ({
    id: 1,
    name: 'John Smith',
    email: 'john@example.com',
    title: 'Team Owner',
    status: 1,
});

export const list = (data: Record<any, any>): Record<any, any> => ({
    total: 10,
    filtered: 10,
    count: 1,
    entities: [data],
});

export const statusTrue = (data: Record<any, any>): Record<any, any> => ({status: true, result: data});
