import { parseQaseIdsFromString } from 'qase-javascript-commons/internal';

export type Annotation = { type: string; description?: string };

export class AnnotationExtractor {
  extractQaseIds(annotations: Annotation[]): number[] {
    const ids: number[] = [];
    for (const item of annotations) {
      if (item.type.toLowerCase() === 'qaseid' && item.description) {
        ids.push(...parseQaseIdsFromString(item.description));
      }
    }
    return ids;
  }

  extractProjectMapping(annotations: Annotation[]): Record<string, number[]> | null {
    for (const item of annotations) {
      if (item.type.toLowerCase() === 'qaseprojects' && item.description) {
        try {
          const parsed = JSON.parse(item.description) as Record<string, number[]>;
          if (parsed && typeof parsed === 'object' && Object.keys(parsed).length > 0) {
            return parsed;
          }
        } catch {
          // ignore invalid JSON
        }
      }
    }
    return null;
  }

  extractSuite(annotations: Annotation[]): string[] {
    const suites: string[] = [];
    for (const item of annotations) {
      if (item.type.toLowerCase() === 'qasesuite' && item.description) {
        suites.push(item.description);
      }
    }
    return suites;
  }
}
