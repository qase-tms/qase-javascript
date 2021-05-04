import 'jest';
import { EventEmitter } from 'events';
import NewmanQaseReporter from '../src';

describe('Tests', () => {
    it('Init main class', () => {
        new NewmanQaseReporter(new EventEmitter(), {apiToken: "", projectCode: ""}, {collection: ""});
    });
});
