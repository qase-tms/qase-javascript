import { rest } from 'msw';

const qaseio = (path) => `https://api.qase.io/v1${path}`;

const handlers = [
    // https://developers.qase.io/reference/create-result-bulk
    rest.post(qaseio('/result/:code/:id/bulk'), (request, response, context) => {
        if (request.params.code.includes('invalid')) {
            return response(
                context.json({ errorMessage: 'Could not send results' }),
                context.status(500)
            );
        }
        return response(context.json(true));
    }),

    // https://developers.qase.io/reference/get-project
    rest.get(qaseio('/project/:code'), (request, response, context) => {
        if (request.params.code.includes('invalid')) {
            return response(
                context.json({ errorMessage: 'Project not found!' }),
                context.status(404)
            );
        }
        return response(context.json({ result: { code: request.params.code } }));
    }),

    // https://developers.qase.io/reference/get-run
    rest.get(qaseio('/run/:code/:id'), (request, response, context) => {
        if (request.params.id === '404') {
            return response(
                context.json({ errorMessage: 'Run not found!' }),
                context.status(404)
            );
        }
        if (request.params.id.includes('invalid')) {
            return response(
                context.json({ errorMessage: 'Run not found!' }),
                context.status(404)
            );
        }
        return response(context.json({ result: { id: request.params.id } }));
    }),

    // https://developers.qase.io/reference/create-run
    rest.post(qaseio('/run/:code'), (request, response, context) => {
        if (request.params.code === 'run-404') {
            return response(
                context.status(404)
            );
        }
        if (request.params.code.includes('invalid')) {
            return response(
                context.json({ errorMessage: 'Could not create run!' }),
                context.status(404)
            );
        }
        return response(context.json({ result: { id: 1 } }));
    }),

    // https://developers.qase.io/reference/complete-run
    rest.post(qaseio('/run/:code/:id/complete'), (request, response, context) => {
        if (request.params.code.includes('run-incomplete')) {
            return response(
                context.json({ errorMessage: 'Could not complete run!' }),
                context.status(500)
            );
        }
        return response(context.json(true));
    }),

    // https://developers.qase.io/reference/upload-attachment
    rest.post(qaseio('/attachment/:code'), (request, response, context) => {
        if (request.params.code.includes('invalid')) {
            return response(
                context.json({ errorMessage: 'Could not upload attachment!' }),
                context.status(500)
            );
        }
        return response(context.json({
            result: [
                { hash: '6a8544c6384de9cdc7a27cc00e6538e90b9e69c5' }
            ]
        }));
    })

];

export { handlers };