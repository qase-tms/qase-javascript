import { describe, it, expect } from 'vitest'
import {
    QaseCoreReporter,
} from '../../src';

describe('parseScreenshotDirectory', () => {
    it('should return screenshot directory', () => {
        const screenshotDirectory = QaseCoreReporter.parseAttachmentDirectory('/test/__artifacts__/screenshots');
        expect(screenshotDirectory).toEqual({
            2: {
                caseId: 2,
                file: ["withCaseId/screenshot (Qase ID: 2).png"]
            }
        });
    });

    it('should return empty when no files are found', () => {
        const screenshotDirectory = QaseCoreReporter.parseAttachmentDirectory(__dirname + '/not-existing');
        expect(screenshotDirectory).toEqual({});
    });
});