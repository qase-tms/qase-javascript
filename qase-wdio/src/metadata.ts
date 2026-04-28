import { Attachment, getMimeTypes, TestStepType } from 'qase-javascript-commons';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import { Storage } from './storage';
import {
  AddAttachmentEventArgs,
  AddCommentEventArgs,
  AddQaseIdEventArgs,
  AddRecordsEventArgs,
  AddSuiteEventArgs,
  AddTagsEventArgs,
  AddTitleEventArgs,
} from './models';

export class MetadataApplier {
  constructor(private readonly storage: Storage) {}

  addQaseId({ ids }: AddQaseIdEventArgs): void {
    const cur = this.storage.getCurrentTest();
    if (!cur) return;
    cur.testops_id = ids;
  }

  addTitle({ title }: AddTitleEventArgs): void {
    const cur = this.storage.getCurrentTest();
    if (!cur) return;
    cur.title = title;
  }

  addComment({ comment }: AddCommentEventArgs): void {
    this.storage.comment = comment;
  }

  addSuite({ suite }: AddSuiteEventArgs): void {
    const cur = this.storage.getCurrentTest();
    if (!cur) return;
    cur.relations = {
      suite: {
        data: [{ title: suite, public_id: null }],
      },
    };
  }

  addParameters({ records }: AddRecordsEventArgs): void {
    const cur = this.storage.getCurrentTest();
    if (!cur) return;
    const stringRecord: Record<string, string> = {};
    for (const [k, v] of Object.entries(records)) {
      stringRecord[String(k)] = String(v);
    }
    cur.params = stringRecord;
  }

  addGroupParameters({ records }: AddRecordsEventArgs): void {
    const cur = this.storage.getCurrentTest();
    if (!cur) return;
    const stringRecord: Record<string, string> = {};
    for (const [k, v] of Object.entries(records)) {
      stringRecord[String(k)] = String(v);
    }
    cur.group_params = stringRecord;
  }

  addFields({ records }: AddRecordsEventArgs): void {
    const cur = this.storage.getCurrentTest();
    if (!cur) return;
    cur.fields = records;
  }

  addTags({ tags }: AddTagsEventArgs): void {
    const cur = this.storage.getCurrentTest();
    if (!cur) return;
    cur.tags = [...cur.tags, ...tags];
  }

  addAttachment({ name, type, content, paths }: AddAttachmentEventArgs): void {
    const cur = this.storage.getCurrentTest();
    if (!cur) return;

    if (paths) {
      for (const file of paths) {
        const attach: Attachment = {
          file_path: file,
          size: 0,
          id: uuidv4(),
          file_name: path.basename(file),
          mime_type: getMimeTypes(file),
          content: '',
        };
        cur.attachments.push(attach);
      }
      return;
    }

    if (content) {
      const attach: Attachment = {
        file_path: null,
        size: content.length,
        id: uuidv4(),
        file_name: name ?? 'attachment',
        mime_type: type ?? 'application/octet-stream',
        content,
      };
      cur.attachments.push(attach);
    }
  }

  ignore(): void {
    const cur = this.storage.getCurrentTest();
    if (!cur) return;
    this.storage.ignore = true;
  }

  addStep(step: TestStepType): void {
    const cur = this.storage.getLastItem();
    if (!cur) return;
    cur.steps.push(step);
  }
}
