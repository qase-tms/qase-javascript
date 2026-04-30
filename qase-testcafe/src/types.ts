export interface CallsiteRecordType {
  filename?: string;
  lineNum?: number;
  callsiteFrameIdx?: number;
  stackFrames?: unknown[];
  isV8Frames?: boolean;
}

export interface TestRunErrorFormattableAdapterType {
  userAgent: string;
  screenshotPath: string;
  testRunId: string;
  testRunPhase: string;
  type: string;
  code?: string;
  isTestCafeError?: boolean;
  callsite?: CallsiteRecordType;
  errMsg: string;
  diff?: boolean;
  id?: string;
}

export interface ScreenshotType {
  screenshotPath: string;
  thumbnailPath: string;
  userAgent: string;
  quarantineAttempt: number;
  takenOnFail: boolean;
}

export interface FixtureType {
  id: string;
  name: string;
  path?: string;
  meta: Record<string, unknown>;
}

export enum metadataEnum {
  id = 'QaseID',
  title = 'QaseTitle',
  suite = 'QaseSuite',
  fields = 'QaseFields',
  parameters = 'QaseParameters',
  groupParameters = 'QaseGroupParameters',
  oldID = 'CID',
  ignore = 'QaseIgnore',
  projects = 'QaseProjects',
  tags = 'QaseTags',
}

export interface MetadataType {
  [metadataEnum.id]: number[];
  [metadataEnum.title]: string | undefined;
  [metadataEnum.suite]: string | undefined;
  [metadataEnum.fields]: Record<string, string>;
  [metadataEnum.parameters]: Record<string, string>;
  [metadataEnum.groupParameters]: Record<string, string>;
  [metadataEnum.ignore]: boolean;
  [metadataEnum.projects]: Record<string, number[]>;
  [metadataEnum.tags]: string[];
}

export interface TestRunInfoType {
  errs: TestRunErrorFormattableAdapterType[];
  warnings: string[];
  durationMs: number;
  unstable: boolean;
  screenshotPath: string;
  screenshots: ScreenshotType[];
  quarantine: Record<string, Record<'passed', boolean>>;
  skipped: boolean;
  fixture: FixtureType;
}
