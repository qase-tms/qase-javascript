import 'jest';
import QaseReporter from '../src';

describe('Client', () => {
    it('Init client', () => {
        const options = {apiToken: "", projectCode: ""};
        new QaseReporter({}, options);
    });
});
