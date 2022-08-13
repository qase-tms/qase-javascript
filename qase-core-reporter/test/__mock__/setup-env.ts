import { server } from './server'

beforeAll(() => {
    console.log('Starting low level mock server');
    server.listen()
})
afterEach(() => server.resetHandlers())
afterAll(() => {
    console.log('Stopping low level mock server');
    server.close()
})