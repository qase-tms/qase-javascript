import { Metadata } from './models';
import { readFileSync, existsSync, unlinkSync, writeFileSync } from 'fs';

const metadataPath = 'qaseMetadata';

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class MetadataManager {
  public static getMetadata(): Metadata | undefined {
    if (!this.isExists()) {
      return undefined;
    }

    let metadata: Metadata = {
      title: undefined,
      fields: {},
      parameters: {},
      groupParams: {},
      ignore: false,
      suite: undefined,
      comment: undefined,
    };

    try {
      const data = readFileSync(metadataPath, 'utf8');
      metadata = JSON.parse(data) as Metadata;

      return metadata;
    } catch (err) {
      console.error('Error reading metadata file:', err);
    }

    return undefined;
  }

  public static setIgnore(): void {
    const metadata = this.getMetadata() ?? {};
    metadata.ignore = true;
    this.setMetadata(metadata);
  }

  public static setSuite(suite: string): void {
    const metadata = this.getMetadata() ?? {};
    metadata.suite = suite;
    this.setMetadata(metadata);
  }

  public static setComment(comment: string): void {
    const metadata = this.getMetadata() ?? {};
    metadata.comment = comment;
    this.setMetadata(metadata);
  }

  public static setTitle(title: string): void {
    const metadata = this.getMetadata() ?? {};
    metadata.title = title;
    this.setMetadata(metadata);
  }

  public static setFields(fields: Record<string, string>): void {
    const metadata = this.getMetadata() ?? {};
    metadata.fields = fields;
    this.setMetadata(metadata);
  }

  public static setParameters(parameters: Record<string, string>): void {
    const metadata = this.getMetadata() ?? {};
    metadata.parameters = parameters;
    this.setMetadata(metadata);
  }

  public static setGroupParams(groupParams: Record<string, string>): void {
    const metadata = this.getMetadata() ?? {};
    metadata.groupParams = groupParams;
    this.setMetadata(metadata);
  }

  private static setMetadata(metadata: Metadata): void {
    try {
      const data = JSON.stringify(metadata);
      writeFileSync(metadataPath, data);
    } catch (err) {
      console.error('Error writing metadata file:', err);
    }
  }

  public static clear() {
    if (!this.isExists()) {
      return;
    }

    try {
      unlinkSync(metadataPath);
    } catch (err) {
      console.error('Error clearing state file:', err);
    }
  }

  static isExists(): boolean {
    return existsSync(metadataPath);
  }
}
