import { rest } from 'msw';

const qaseio = (path) => `https://api.qase.io/v1${path}`;

const handlers = [
    // https://developers.qase.io/reference/create-result-bulk
    rest.post(qaseio('/result/:code/:id/bulk'), (_, res, ctx) => {
        return res(ctx.json(true));
    }),

    // https://developers.qase.io/reference/get-project
    rest.get(qaseio('/project/:code'), (req, res, ctx) => {
        return res(ctx.json({ result: { code: req.params.code } }));
    }),

    // https://developers.qase.io/reference/get-run
    rest.get(qaseio('/run/:code/:id'), (req, res, ctx) => {
        return res(ctx.json({ result: { id: req.params.id } }));
    }),

    // https://developers.qase.io/reference/create-run
    rest.post(qaseio('/run/:code'), (_, res, ctx) => {
        return res(ctx.json({ result: { id: 1 } }));
    }),

    // https://developers.qase.io/reference/complete-run
    rest.post(qaseio('/run/:code/:id/complete'), (req, res, ctx) => {
        return res(ctx.json(true));
    }),

    // https://developers.qase.io/reference/upload-attachment
    rest.post(qaseio('/attachment/:code'), (_, res, ctx) => {
        return res(ctx.json({
            result: [
                { hash: '6a8544c6384de9cdc7a27cc00e6538e90b9e69c5' }
            ]
        }));
    })

];

export { handlers };