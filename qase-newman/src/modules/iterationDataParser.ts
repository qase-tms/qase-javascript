export class IterationDataParser {
  parse(iterationData: unknown): Record<string, string>[] {
    if (!iterationData) {
      return [];
    }
    if (
      Array.isArray(iterationData) &&
      iterationData.every((item) => typeof item === 'object' && item !== null)
    ) {
      return iterationData.map((item: Record<string, unknown>) => this.convertToRecord(item));
    }
    return [];
  }

  private convertToRecord(obj: unknown, parentKey = ''): Record<string, string> {
    const record: Record<string, string> = {};
    if (this.isRecord(obj)) {
      for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
          const value = obj[key];
          const newKey = parentKey ? `${parentKey}.${key}` : key;
          if (this.isRecord(value)) {
            Object.assign(record, this.convertToRecord(value, newKey));
          } else {
            record[newKey.toLowerCase()] = String(value);
          }
        }
      }
    }
    return record;
  }

  private isRecord(obj: unknown): obj is Record<string, unknown> {
    return typeof obj === 'object' && obj !== null && !Array.isArray(obj);
  }
}
