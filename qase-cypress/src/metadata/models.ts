export interface Metadata {
  title?: string | undefined;
  fields?: Record<string, string>;
  parameters?: Record<string, string>;
  groupParams?: Record<string, string>;
  ignore?: boolean;
  suite?: string | undefined;
  comment?: string | undefined;
  steps?: (StepStart | StepEnd)[];
  currentStepId?: string | undefined;
  firstStepName?: string | undefined;
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
