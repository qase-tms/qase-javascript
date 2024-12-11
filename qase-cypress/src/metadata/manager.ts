import { Attach, Metadata, StepStart } from './models';
import { readFileSync, existsSync, unlinkSync, writeFileSync } from 'fs';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import { Attachment, getMimeTypes } from 'qase-javascript-commons';

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class MetadataManager {
  static metadataPath = path.resolve(__dirname, 'qaseMetadata');

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
      steps: [],
      cucumberSteps: [],
      currentStepId: undefined,
      firstStepName: undefined,
      attachments: [],
      stepAttachments: {},
    };

    try {
      const data = readFileSync(this.metadataPath, 'utf8');
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

  public static addStepStart(name: string): void {
    const metadata = this.getMetadata() ?? {};

    if (metadata.firstStepName === name) {
      return;
    }

    if (!metadata.steps) {
      metadata.steps = [];
    }
    const id = uuidv4();
    const parentId = metadata.currentStepId ?? undefined;
    metadata.steps.push({ timestamp: Date.now(), name, id: id, parentId: parentId });
    metadata.currentStepId = id;

    if (!metadata.firstStepName) {
      metadata.firstStepName = name;
    }

    this.setMetadata(metadata);
  }

  public static addStepEnd(status: string): void {
    const metadata = this.getMetadata() ?? {};
    if (!metadata.steps || !metadata.currentStepId) {
      return;
    }
    const parentId = metadata.steps.reverse().find((step): step is StepStart => step.id === metadata.currentStepId)?.parentId;
    metadata.steps.push({ timestamp: Date.now(), status, id: metadata.currentStepId });
    metadata.currentStepId = parentId;
    this.setMetadata(metadata);
  }

  public static addCucumberStep(name: string): void {
    const metadata = this.getMetadata() ?? {};

    if (metadata.firstStepName === name) {
      return;
    }

    if (!metadata.cucumberSteps) {
      metadata.cucumberSteps = [];
    }
    const id = uuidv4();
    const parentId = metadata.currentStepId ?? undefined;
    metadata.cucumberSteps.push({ timestamp: Date.now(), name, id: id, parentId: parentId });
    metadata.currentStepId = id;

    if (!metadata.firstStepName) {
      metadata.firstStepName = name;
    }

    this.setMetadata(metadata);
  }

  public static addAttach(attach: Attach) {
    const metadata = this.getMetadata() ?? {};

    if (!metadata.attachments) {
      metadata.attachments = [];
    }
    if (!metadata.stepAttachments) {
      metadata.stepAttachments = {};
    }

    const attachments = this.prepareAttach(attach);

    if (metadata.currentStepId) {
      if (metadata.stepAttachments[metadata.currentStepId] === undefined) {
        metadata.stepAttachments[metadata.currentStepId] = attachments;
      } else {
        metadata.stepAttachments[metadata.currentStepId]?.push(...attachments);
      }
    } else {
      metadata.attachments.push(...attachments);
    }

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
      writeFileSync(this.metadataPath, data);
    } catch (err) {
      console.error('Error writing metadata file:', err);
    }
  }

  public static clear() {
    if (!this.isExists()) {
      return;
    }

    try {
      unlinkSync(this.metadataPath);
    } catch (err) {
      console.error('Error clearing state file:', err);
    }
  }

  static isExists(): boolean {
    return existsSync(this.metadataPath);
  }

  static prepareAttach(attach: Attach): Attachment[] {
    const attachments: Attachment[] = [];
    if (attach.paths) {
      if (Array.isArray(attach.paths)) {
        attach.paths.forEach((file) => {
          const attachmentName = path.basename(file);
          const contentType: string = getMimeTypes(file);
          attachments.push({
            file_name: attachmentName,
            mime_type: contentType,
            file_path: file,
            content: '',
            size: 0,
            id: uuidv4(),
          });
        });
      } else {
        const attachmentName = path.basename(attach.paths);
        const contentType: string = getMimeTypes(attach.paths);
        attachments.push({
          file_name: attachmentName,
          mime_type: contentType,
          file_path: attach.paths,
          content: '',
          size: 0,
          id: uuidv4(),
        });
      }
    } else if (attach.content) {
      attachments.push({
        file_name: attach.name ?? 'attachment',
        mime_type: attach.contentType ?? 'application/octet-stream',
        file_path: null,
        content: attach.content,
        size: 0,
        id: uuidv4(),
      });
    }

    return attachments;
  }
}
