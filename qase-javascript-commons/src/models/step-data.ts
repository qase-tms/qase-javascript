export interface StepTextData {
  action: string;
  expected_result: string | null;
  data: string | null;
}

export interface StepGherkinData {
  keyword: string;
  name: string;
  line: number;
}

export interface StepRequestData {
  request_method: string;
  request_url: string;
  request_headers: Record<string, string> | null;
  request_body: string | null;
  status_code: number | null;
  response_body: string | null;
  response_headers: Record<string, string> | null;
}
