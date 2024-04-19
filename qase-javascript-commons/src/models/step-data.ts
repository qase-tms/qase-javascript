export interface StepTextData {
  action: string;
  expected_result: string | null;
}

export interface StepGherkinData {
  keyword: string;
  name: string;
  line: number;
}
