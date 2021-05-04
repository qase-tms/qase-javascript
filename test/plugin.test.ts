import 'jest';
import {IFormatterOptions} from "@cucumber/cucumber/lib/formatter";
import Index from '../src';

describe('Tests', () => {
    it('Init main class', () => {
        new Index({parsedArgvOptions:{}} as unknown as IFormatterOptions);
    });
});
