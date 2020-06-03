
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

export const list = (data: Record<any, any>): Record<any, any> => ({
    total: 10,
    filtered: 10,
    count: 1,
    entities: [data],
});

export const statusTrue = (data: Record<any, any>): Record<any, any> => ({status: true, result: data});
