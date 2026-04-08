import { Attachment } from 'qase-javascript-commons';

export interface NetworkRequestData {
  method: string;
  url: string;
  statusCode: number | null;
  duration: number;
  responseBody: string | null;
  startTime: number;
}


export interface Metadata {
  title?: string | undefined;
  fields?: Record<string, string>;
  parameters?: Record<string, string>;
  groupParams?: Record<string, string>;
  ignore?: boolean;
  suite?: string | undefined;
  comment?: string | undefined;
  tags?: string[];
  steps?: (StepStart | StepEnd)[];
  cucumberSteps?: StepStart[];
  currentStepId?: string | undefined;
  firstStepName?: string | undefined;
  attachments?: Attachment[];
  stepAttachments?: Record<string, Attachment[]>;
  networkRequests?: NetworkRequestData[];
}

export interface StepStart {
  id: string;
  timestamp: number;
  name: string;
  parentId: string | undefined;
}

export interface StepEnd {
  id: string;
  timestamp: number;
  status: string;
}


export interface Attach {
  name?: string;
  paths?: string | string[];
  content?: Buffer | string;
  contentType?: string;
}
