import { TestResult } from '@playwright/test/reporter';
import { Attachment } from 'qase-javascript-commons';
import { v4 as uuidv4 } from 'uuid';
import * as path from 'path';
import { MetadataMessage, ReporterContentType } from './playwright';
import { StepIndex } from './step-index';

const PROFILER_CONTENT_TYPE = 'application/qase.profiler-steps+json';
const stepAttachRegexp = /^step_attach_(body|file)_(\w{8}-\w{4}-\w{4}-\w{4}-\w{12})_/i;

type ArrayItemType<T> = T extends (infer R)[] ? R : never;

export interface TestCaseMetadata {
  ids: number[];
  /** Multi-project mapping: project code -> test case IDs. */
  projectMapping?: Record<string, number[]>;
  title: string;
  fields: Record<string, string>;
  parameters: Record<string, string>;
  groupParams: Record<string, string>;
  attachments: Attachment[];
  ignore: boolean;
  suite: string;
  comment: string;
  tags: string[];
}

/**
 * Parses Playwright `result.attachments` into a `TestCaseMetadata` object and,
 * as a side effect, routes per-step attachments into the supplied `StepIndex`.
 *
 * Recognised attachment shapes:
 *  - `qase-metadata` content type — JSON metadata payload (ids/title/fields/...).
 *  - profiler steps content type — skipped here; merged later in onTestEnd.
 *  - `step_attach_(body|file)_<uuid>_<name>` — routed to the parent step's
 *    attachment list inside `StepIndex`.
 *  - everything else — appended to the test-level attachment list.
 */
export class MetadataExtractor {
  constructor(private readonly stepIndex: StepIndex) {}

  transform(testAttachments: ArrayItemType<TestResult['attachments']>[]): TestCaseMetadata {
    const metadata: TestCaseMetadata = {
      ids: [],
      title: '',
      fields: {},
      parameters: {},
      groupParams: {},
      attachments: [],
      ignore: false,
      suite: '',
      comment: '',
      tags: [],
    };
    const attachments: Attachment[] = [];

    for (const attachment of testAttachments) {
      if (attachment.contentType === ReporterContentType) {
        if (attachment.body == undefined) {
          continue;
        }

        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const message: MetadataMessage = JSON.parse(attachment.body.toString());

        if (message.title) {
          metadata.title = message.title;
        }

        if (message.ids) {
          metadata.ids = message.ids;
        }

        if (message.projectMapping && typeof message.projectMapping === 'object') {
          metadata.projectMapping = message.projectMapping as Record<string, number[]>;
        }

        if (message.fields) {
          metadata.fields = message.fields;
        }

        if (message.parameters) {
          metadata.parameters = message.parameters;
        }

        if (message.ignore) {
          metadata.ignore = message.ignore;
        }

        if (message.suite) {
          metadata.suite = message.suite;
        }

        if (message.comment) {
          metadata.comment = message.comment;
        }

        if (message.groupParams) {
          metadata.groupParams = message.groupParams;
        }

        if (message.tags) {
          metadata.tags = [...(metadata.tags ?? []), ...message.tags];
        }

        continue;
      }

      if (attachment.contentType === PROFILER_CONTENT_TYPE) {
        // Profiler steps attachment — skip adding to test attachments.
        // Will be processed separately in onTestEnd by the reporter.
        continue;
      }

      const matches = attachment.name.match(stepAttachRegexp);
      if (matches) {
        const step = this.stepIndex.findStepByTitle(attachment.name);

        if (step) {
          this.stepIndex.removeStep(step);
        }

        let attachmentModel: Attachment;
        if (attachment.name.match(/^step_attach_body_/i)) {
          attachmentModel = {
            content: attachment.body == undefined ? '' : attachment.body,
            file_name: decodeURIComponent(attachment.name.substring(matches[0].length)),
            file_path: null,
            mime_type: attachment.contentType,
            size: attachment.body == undefined ? 0 : Buffer.byteLength(attachment.body),
            id: uuidv4(),
          };
        } else {
          attachmentModel = {
            content: '',
            file_name: decodeURIComponent(attachment.name.substring(matches[0].length)),
            file_path: attachment.body != undefined ? attachment.body.toString() : null,
            mime_type: attachment.contentType,
            size: 0,
            id: uuidv4(),
          };
        }

        if (step?.parent) {
          this.stepIndex.addAttachmentToStep(step.parent, attachmentModel);
          continue;
        }

        attachments.push(attachmentModel);
        continue;
      }

      const attachmentModel: Attachment = {
        content: attachment.body == undefined ? '' : attachment.body,
        file_name: attachment.path == undefined ? attachment.name : path.basename(attachment.path),
        file_path: attachment.path == undefined ? null : attachment.path,
        mime_type: attachment.contentType,
        size: 0,
        id: uuidv4(),
      };

      attachments.push(attachmentModel);
    }

    metadata.attachments = attachments;
    return metadata;
  }
}
