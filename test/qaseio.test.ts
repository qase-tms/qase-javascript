import 'jest';
import { QaseIo } from '../src/qaseio';

describe('Client', () => {
    it('Init client', () => {
        const client = new QaseIo('123');
        expect(client.api.defaults.headers).toHaveProperty('Token', '123');
    });
});
