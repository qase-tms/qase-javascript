export interface Metadata {
  title?: string | undefined;
  fields?: Record<string, string>;
  parameters?: Record<string, string>;
  groupParams?: Record<string, string>;
  ignore?: boolean;
  suite?: string | undefined;
  comment?: string | undefined;
}
