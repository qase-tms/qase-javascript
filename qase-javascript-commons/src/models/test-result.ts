import { TestStepType } from './test-step';
import { Attachment } from './attachment';
import { TestExecution } from './test-execution';

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
  relations: Relation | null
  muted: boolean
  message: string | null
}

export type Relation = {
  suite?: Suite
}

export type Suite = {
  data: SuiteData[]
}

export type SuiteData = {
  title: string
  public_id: number | null
}
