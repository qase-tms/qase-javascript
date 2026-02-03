import type { TestopsProjectMapping } from 'qase-javascript-commons';

export interface TestMetadata {
  ids: number[];
  /** Multi-project mapping (from @qaseid.PROJ(ids) tags). */
  projectMapping: TestopsProjectMapping;
  fields: Record<string, string>;
  title: string | null;
  isIgnore: boolean;
  parameters: Record<string, string>;
  group_params: Record<string, string>;
  suite: string | null;
}

export interface ScenarioData {
  name: string;
  parameters: Record<string, Record<string, string>>;
}


