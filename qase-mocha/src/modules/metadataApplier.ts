import { Metadata } from '../types';

interface AttachInput {
  name?: string;
  paths?: string | string[];
  content?: Buffer | string;
  contentType?: string;
}

export class MetadataApplier {
  private metadata: Metadata = new Metadata();

  reset(): void {
    this.metadata.clear();
  }

  get(): Metadata {
    return this.metadata;
  }

  applyQaseId(id: number | number[]): void {
    this.metadata.addQaseId(id);
  }

  applyTitle(title: string): void {
    this.metadata.title = title;
  }

  applyParameters(values: Record<string, string>): void {
    this.metadata.parameters = MetadataApplier.coerceStringRecord(values);
  }

  applyGroupParameters(values: Record<string, string>): void {
    this.metadata.groupParameters = MetadataApplier.coerceStringRecord(values);
  }

  applyFields(values: Record<string, string>): void {
    this.metadata.fields = MetadataApplier.coerceStringRecord(values);
  }

  applySuite(name: string): void {
    this.metadata.suite = name;
  }

  applyIgnore(): void {
    this.metadata.ignore = true;
  }

  applyAttach(attach: AttachInput): void {
    this.metadata.addAttachment(attach);
  }

  applyComment(message: string): void {
    this.metadata.addComment(message);
  }

  applyTags(values: string[]): void {
    this.metadata.addTags(values);
  }

  private static coerceStringRecord(values: Record<string, unknown>): Record<string, string> {
    const result: Record<string, string> = {};
    for (const [key, value] of Object.entries(values)) {
      result[String(key)] = String(value);
    }
    return result;
  }
}
