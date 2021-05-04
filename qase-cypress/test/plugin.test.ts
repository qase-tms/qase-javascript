import 'jest';
import mocha from 'mocha';
import QaseCypressReporter from '../src';

describe('Client', () => {
    it('Init client', () => {
        const runner = new mocha.Runner(new mocha.Suite('new'), false)
        const options = {reporterOptions: {apiToken: ""}};
        new QaseCypressReporter(runner, options);
    });
});
