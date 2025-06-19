export interface TestMetadata {
  ids: number[];
  fields: Record<string, string>;
  title: string | null;
  isIgnore: boolean;
}

export interface ScenarioData {
  name: string;
  parameters: Record<string, Record<string, string>>;
}


