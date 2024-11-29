import { Attachment, getMimeTypes } from 'qase-javascript-commons';
import path from 'path';

declare module 'mocha' {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  export interface Context extends Methods {
  }
}

export type Context = Mocha.Context & Methods;

export interface Test extends Mocha.Test {
  ctx?: Context;
}

export interface Hook extends Mocha.Hook {
  ctx?: Context;
}

export interface Methods {
  /**
   * Set IDs for the test case
   * Use `qase()` instead. This method is deprecated and kept for reverse compatibility.
   */
  qaseId(id: number | number[]): void;

  title(title: string): void;

  parameters(values: Record<string, string>): void;

  groupParameters(values: Record<string, string>): void;

  fields(values: Record<string, string>): void;

  suite(name: string): void;

  ignore(): void;

  attach(attach: { name?: string, paths?: string | string[], content?: Buffer | string, contentType?: string }): void;

  comment(message: string): void;

  step(title: string, func: () => void): void;
}

export class Metadata {
  ids?: number[];
  title?: string;
  fields?: Record<string, string>;
  parameters?: Record<string, string>;
  groupParameters?: Record<string, string>;
  ignore?: boolean;
  suite?: string;
  comment?: string;
  attachments?: Attachment[];

  constructor() {
    this.clear();
  }

  addQaseId(id: number | number[]) {
    this.ids = Array.isArray(id) ? id : [id];
  }

  addComment(message: string) {
    this.comment += message + '\n\n';
  }

  addAttachment(attach: { name?: string, paths?: string | string[], content?: Buffer | string, contentType?: string }) {
    if (attach.paths !== undefined) {
      const files = Array.isArray(attach.paths) ? attach.paths : [attach.paths];

      for (const file of files) {
        const attachmentName = path.basename(file);
        const contentType: string = getMimeTypes(file);
        this.attachments?.push({
          file_path: file,
          file_name: attachmentName,
          mime_type: contentType,
          content: '',
          size: 0,
          id: '',
        });

      }
    }

    this.attachments?.push({
      file_name: attach.name ?? '',
      mime_type: attach.contentType ?? 'text/plain',
      content: attach.content ?? '',
      file_path: null,
      size: 0,
      id: '',
    });
  }

  clear() {
    this.ids = [];
    this.title = '';
    this.fields = {};
    this.parameters = {};
    this.groupParameters = {};
    this.ignore = false;
    this.suite = '';
    this.comment = '';
    this.attachments = [];
  }
}
