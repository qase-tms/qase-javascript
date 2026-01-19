export interface TestMetadata {
  ids: number[];
  fields: Record<string, string>;
  title: string | null;
  isIgnore: boolean;
  parameters: Record<string, string>;
  group_params: Record<string, string>;
}

export interface ScenarioData {
  name: string;
  parameters: Record<string, Record<string, string>>;
}


