export interface AddQaseIdEventArgs {
  ids: number[];
}

export interface AddRecordsEventArgs {
  records: Record<string, string>;
}

export interface AddTitleEventArgs {
  title: string;
}

export interface AddSuiteEventArgs {
  suite: string;
}

export interface AddAttachmentEventArgs {
  name?: string;
  type?: string;
  content?: string;
  paths?: string[];
}
