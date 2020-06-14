import 'jest';
import { QaseCypressReporter } from '../src';

describe('Client', () => {
    it('Init client', () => {
        new QaseCypressReporter();
    });
});
