import { TestStepType } from './test-step';
import { Attachment } from './attachment';
import { TestExecution } from './test-execution';


// export type TestResultType = {
//   id: string;
//   testOpsId: number[];
//   title: string;
//   status: `${TestStatusEnum}`;
//   suiteTitle?: string | string[] | undefined;
//   error?: Error | undefined;
//   startTime?: number | undefined;
//   duration?: number | undefined;
//   endTime?: number | undefined;
//   steps?: TestStepType[] | undefined;
//   attachments?: string[] | undefined;
// };

export type TestResultType = {
  id: string
  title: string
  signature: string
  run_id: number | null
  testops_id: number | number[] | null
  execution: TestExecution
  fields: Record<string, string>
  attachments: Attachment[]
  steps: TestStepType[]
  params: Record<string, string>
  author: string | null
  relations: any[]
  muted: boolean
  message: string | null
}

