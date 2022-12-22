import { describe, it, expect } from 'vitest'
import {
    qase,
    qaseTitle,
    qaseParam,
} from '../../src';

describe('qase exports', () => {
    describe('qase', () => {
        it('should return test when test is undefined', () => {
            const testData = undefined;
            const result = qase([1], testData);
            expect(result).toBe(undefined);
        });

        it('should return test object with Qase ID when string is used', () => {
            const test = {
                title: 'test',
            };
            const newTest = qase('1', test);
            expect(newTest.title).toBe('test (Qase ID: 1)');
        });

        it('should return test object with Qase ID when number is used', () => {
            const test = {
                title: 'test',
            };
            const newTest = qase(1, test);
            expect(newTest.title).toBe('test (Qase ID: 1)');
        });

        it('should return test object with Qase ID when array is used', () => {
            const test = {
                title: 'test',
            };
            const newTest = qase([1, 2], test);
            expect(newTest.title).toBe('test (Qase ID: 1,2)');
        });
    });

    describe('qaseParam', () => {
        it('should return test title with param format - object, caseId array', () => {
            const test = {
                title: 'test',
            };
            const newTest = qaseParam([1, 2], [0, { a: 'a', b: 'b', expected: 'ab' }], test.title);
            expect(newTest).toBe('test (Qase ID: 1,2) (Qase Dataset: #0 (a: a, b: b, expected: ab))');
        });

        it('should return test title with param format - string, caseId array', () => {
            const test = {
                title: 'test',
            };
            const newTest = qaseParam([1, 2], [0, 'a: a, b: b, expected: ab'], test.title);
            expect(newTest).toBe('test (Qase ID: 1,2) (Qase Dataset: #0 (a: a, b: b, expected: ab))');
        });

        it('should return test title with param format - string, no caseId', () => {
            const test = {
                title: 'test',
            };
            const newTest = qaseParam(null, [0, 'a: a, b: b, expected: ab'], test.title);
            expect(newTest).toBe('test (Qase Dataset: #0 (a: a, b: b, expected: ab))');
        });

        it('should return test title with param format - string, caseId string|number', () => {
            const test = {
                title: 'test',
            };
            const newTest = qaseParam('1', [0, 'a: a, b: b, expected: ab'], test.title);
            expect(newTest).toBe('test (Qase ID: 1) (Qase Dataset: #0 (a: a, b: b, expected: ab))');
        });
    });

    describe('qaseTitle', () => {
        it('should return title with Qase ID when string is used', () => {
            const title = qaseTitle('1', 'My First Test');
            expect(title).toBe('My First Test (Qase ID: 1)');
        });

        it('should return title with Qase ID when number is used', () => {
            const title = qaseTitle(1, 'My First Test');
            expect(title).toBe('My First Test (Qase ID: 1)');
        });

        it('should return title with Qase ID when array is used', () => {
            const title = qaseTitle([1, 2], 'My First Test');
            expect(title).toBe('My First Test (Qase ID: 1,2)');
        });
    });
});