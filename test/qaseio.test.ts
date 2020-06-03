import 'jest';
import { QaseApi } from '../src/qaseio';

describe('Client', () => {
    it('Init client', () => {
        const client = new QaseApi('123');
        expect(client.api.defaults.headers).toHaveProperty('Token', '123');
    });
});
