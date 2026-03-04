import { Attachment, TestStepType } from 'qase-javascript-commons';

export interface Metadata {
  title: string | undefined;
  ignore: boolean;
  comment: string | undefined;
  suite: string | undefined;
  fields: Record<string, string>;
  parameters: Record<string, string>;
  groupParams: Record<string, string>;
  steps: TestStepType[];
  attachments: Attachment[];
}
