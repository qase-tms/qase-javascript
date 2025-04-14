
export interface TestOpsOptionsType {
  project: string;
  uploadAttachments?: boolean | undefined;
  api: TestOpsApiType;
  run: TestOpsRunType;
  plan: TestOpsPlanType;
  batch?: TestOpsBatchType;
  defect?: boolean | undefined;
}

export interface TestOpsRunType {
  id?: number | undefined;
  title: string;
  description: string;
  complete?: boolean | undefined;
}

export interface TestOpsPlanType {
  id?: number | undefined;
}

export interface TestOpsBatchType {
  size?: number | undefined;
}

export interface TestOpsApiType {
  token: string;
  host?: string | undefined;
}

