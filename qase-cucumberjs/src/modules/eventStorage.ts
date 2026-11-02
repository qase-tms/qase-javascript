import {
  Attachment as Attach,
  GherkinDocument,
  Pickle,
  TestCaseStarted,
  TestStepFinished,
  TestStepStarted,
} from '@cucumber/messages';
import { TestCase } from '@cucumber/messages/dist/esm/src/messages';
import { Attachment } from 'qase-javascript-commons';
import { v4 as uuidv4 } from 'uuid';
import { ScenarioData } from '../models';

export class EventStorage {
  private pickles: Record<string, Pickle> = {};
  private testCaseStarts: Record<string, TestCaseStarted> = {};
  private testStepStarted: Record<string, TestStepStarted> = {};
  private testStepFinished: Record<string, TestStepFinished> = {};
  private testCases: Record<string, TestCase> = {};
  private scenarios: Record<string, ScenarioData> = {};
  private attachments: Record<string, Attachment[]> = {};
  private stepKeywords: Record<string, string> = {};

  addPickle(pickle: Pickle): void {
    this.pickles[pickle.id] = pickle;
  }

  addScenario(document: GherkinDocument): void {
    if (!document.feature) return;

    const { children, name } = document.feature;

    const nodes = children.flatMap((child) => (child.rule ? child.rule.children : [child]));
    for (const node of nodes) {
      for (const step of [...(node.background?.steps ?? []), ...(node.scenario?.steps ?? [])]) {
        this.stepKeywords[step.id] = step.keyword.trim();
      }
    }
    const scenarios = children.flatMap((child) => {
      if (child.scenario) return [child.scenario];
      return child.rule?.children.flatMap((ruleChild) => (ruleChild.scenario ? [ruleChild.scenario] : [])) ?? [];
    });

    for (const scenario of scenarios) {

      const parameters: Record<string, Record<string, string>> = {};

      scenario.examples?.forEach((example) => {
        if (example.tableHeader) {
          const columnNames = example.tableHeader.cells.map((cell) => cell.value);

          example.tableBody.forEach((row) => {
            const rowParams: Record<string, string> = {};

            row.cells.forEach((cell, index) => {
              const columnName = columnNames[index];
              if (columnName) {
                rowParams[columnName] = cell.value;
              }
            });

            parameters[row.id] = rowParams;
          });
        }
      });

      this.scenarios[scenario.id] = {
        name,
        parameters,
      };
    }
  }

  addAttachment(attachment: Attach): void {
    if (attachment.testStepId) {
      // Step ids repeat across retry attempts, so key by the attempt as well.
      this.appendAttachment(
        EventStorage.stepKey(attachment.testCaseStartedId, attachment.testStepId),
        attachment,
      );
    } else if (attachment.testCaseStartedId) {
      this.appendAttachment(attachment.testCaseStartedId, attachment);
    }
  }

  addTestCase(testCase: TestCase): void {
    this.testCases[testCase.id] = testCase;
  }

  addTestCaseStarted(testCaseStarted: TestCaseStarted): void {
    this.testCaseStarts[testCaseStarted.id] = testCaseStarted;
  }

  addTestStepStarted(step: TestStepStarted): void {
    this.testStepStarted[step.testStepId] = step;
  }

  addTestStepFinished(step: TestStepFinished): void {
    this.testStepFinished[step.testStepId] = step;
  }

  getPickle(id: string): Pickle | undefined {
    return this.pickles[id];
  }

  getTestCase(id: string): TestCase | undefined {
    return this.testCases[id];
  }

  getTestCaseStarted(id: string): TestCaseStarted | undefined {
    return this.testCaseStarts[id];
  }

  getStepKeyword(astNodeId: string): string | undefined {
    return this.stepKeywords[astNodeId];
  }

  getScenario(id: string): ScenarioData | undefined {
    return this.scenarios[id];
  }

  getAttachments(key: string): Attachment[] {
    return this.attachments[key] ?? [];
  }

  getStepAttachments(testCaseStartedId: string, testStepId: string): Attachment[] {
    return this.getAttachments(EventStorage.stepKey(testCaseStartedId, testStepId));
  }

  private static stepKey(testCaseStartedId: string | undefined, testStepId: string): string {
    return `${testCaseStartedId ?? ''}:${testStepId}`;
  }

  getTestStepFinished(id: string): TestStepFinished | undefined {
    return this.testStepFinished[id];
  }

  getAllTestStepFinished(): Map<string, TestStepFinished> {
    return new Map(Object.entries(this.testStepFinished));
  }

  getAllTestStepStarted(): Map<string, TestStepStarted> {
    return new Map(Object.entries(this.testStepStarted));
  }

  private appendAttachment(key: string, attachment: Attach): void {
    const list = this.attachments[key] ?? [];
    this.attachments[key] = list;
    list.push({
      file_name: EventStorage.getFileNameFromMediaType(attachment.mediaType),
      mime_type: attachment.mediaType,
      file_path: null,
      content: attachment.body,
      size: 0,
      id: uuidv4(),
    });
  }

  static getFileNameFromMediaType(mediaType: string): string {
    const extensions: Record<string, string> = {
      'text/plain': 'txt',
      'application/json': 'json',
      'image/png': 'png',
      'image/jpeg': 'jpg',
      'image/gif': 'gif',
      'text/html': 'html',
      'application/pdf': 'pdf',
      'application/xml': 'xml',
      'application/zip': 'zip',
      'application/msword': 'doc',
      'application/vnd.ms-excel': 'xls',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
    };
    const extension = extensions[mediaType];
    return extension ? `file.${extension}` : 'file';
  }
}
