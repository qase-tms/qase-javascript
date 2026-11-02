import type { TestAnnotation } from 'vitest';
import { TestStepType } from 'qase-javascript-commons';

export interface StepRecord {
  name: string;
  status: 'start' | 'end' | 'failed';
  steps: StepRecord[];
}

export interface MetadataShape {
  title?: string;
  comment?: string;
  suite?: string;
  fields?: Record<string, string>;
  parameters?: Record<string, string>;
  groupParameters?: Record<string, string>;
  tags?: string[];
  muted?: boolean;
  steps: StepRecord[];
  openSteps?: StepRecord[];
  attachments: { name: string; path?: string; content?: string; contentType?: string }[];
  _profilerSteps?: TestStepType[];
}

export class MetadataAccumulator {
  private testMetadata = new Map<string, MetadataShape>();

  parseAnnotation(testId: string, annotation: TestAnnotation): void {
    if (!annotation.message) return;

    if (!this.testMetadata.has(testId)) {
      this.testMetadata.set(testId, { steps: [], attachments: [] });
    }
    const metadata = this.testMetadata.get(testId);
    if (!metadata) return;

    if (annotation.message.startsWith('Qase Profiler Steps: ')) {
      try {
        const stepsJson = annotation.message.replace('Qase Profiler Steps: ', '');
        const profilerSteps = JSON.parse(stepsJson) as TestStepType[];
        metadata._profilerSteps = profilerSteps;
      } catch {
        // Silent failure — corrupted profiler data should not affect test results
      }
      return;
    }

    if (!annotation.message.startsWith('Qase ')) {
      // Unknown non-Qase message — but we already created the entry. Remove it
      // to preserve "non-Qase annotation is ignored" semantics for the very
      // first annotation if no Qase data was added.
      if (
        metadata.steps.length === 0 &&
        metadata.attachments.length === 0 &&
        metadata.title === undefined &&
        metadata.comment === undefined &&
        metadata.suite === undefined &&
        metadata.fields === undefined &&
        metadata.parameters === undefined &&
        metadata.groupParameters === undefined &&
        metadata.tags === undefined &&
        metadata.muted === undefined &&
        metadata.openSteps === undefined &&
        metadata._profilerSteps === undefined
      ) {
        this.testMetadata.delete(testId);
      }
      return;
    }

    const qaseType = annotation.message.split(':')[0]?.replace('Qase ', '').toLowerCase().replace(' ', '-') ?? '';

    switch (qaseType) {
      case 'attempt':
        this.testMetadata.set(testId, { steps: [], attachments: [] });
        break;

      case 'title':
        metadata.title = annotation.message.replace('Qase Title: ', '');
        break;

      case 'comment':
        metadata.comment = annotation.message.replace('Qase Comment: ', '');
        break;

      case 'suite':
        metadata.suite = annotation.message.replace('Qase Suite: ', '');
        break;

      case 'fields': {
        const fieldsData = annotation.message.replace('Qase Fields: ', '');
        try {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          const parsed = JSON.parse(fieldsData);
          if (typeof parsed === 'object' && parsed !== null) {
            metadata.fields = parsed as Record<string, string>;
          }
        } catch {
          // ignore malformed JSON
        }
        break;
      }

      case 'parameters': {
        const parametersData = annotation.message.replace('Qase Parameters: ', '');
        try {
          const parsed: unknown = JSON.parse(parametersData);
          if (typeof parsed === 'object' && parsed !== null) {
            const stringified: Record<string, string> = {};
            for (const [k, v] of Object.entries(parsed as Record<string, unknown>)) {
              if (v != null) stringified[k] = String(v);
            }
            metadata.parameters = stringified;
          }
        } catch {
          // ignore malformed JSON
        }
        break;
      }

      case 'group-parameters': {
        const groupParametersData = annotation.message.replace('Qase Group Parameters: ', '');
        try {
          const parsed: unknown = JSON.parse(groupParametersData);
          if (typeof parsed === 'object' && parsed !== null) {
            const stringified: Record<string, string> = {};
            for (const [k, v] of Object.entries(parsed as Record<string, unknown>)) {
              if (v != null) stringified[k] = String(v);
            }
            metadata.groupParameters = stringified;
          }
        } catch {
          // ignore malformed JSON
        }
        break;
      }

      case 'tags': {
        const tagsData = annotation.message.replace('Qase Tags: ', '');
        try {
          const parsed: unknown = JSON.parse(tagsData);
          if (Array.isArray(parsed)) {
            metadata.tags = [...(metadata.tags ?? []), ...parsed.map(String)];
          } else {
            // Non-array JSON valid — fall back to comma split
            metadata.tags = [
              ...(metadata.tags ?? []),
              ...tagsData.split(',').map((t: string) => t.trim()).filter((t: string) => t.length > 0),
            ];
          }
        } catch {
          metadata.tags = [
            ...(metadata.tags ?? []),
            ...tagsData.split(',').map((t: string) => t.trim()).filter((t: string) => t.length > 0),
          ];
        }
        break;
      }

      case 'mute':
        metadata.muted = true;
        break;

      case 'step-start': {
        const step: StepRecord = { name: annotation.message.replace('Qase Step Start: ', ''), status: 'start', steps: [] };
        const openSteps = metadata.openSteps ?? [];
        const parent = openSteps[openSteps.length - 1];
        (parent ? parent.steps : metadata.steps).push(step);
        openSteps.push(step);
        metadata.openSteps = openSteps;
        break;
      }

      case 'step-end': {
        const name = annotation.message.replace('Qase Step End: ', '');
        MetadataAccumulator.closeStep(metadata, (step) => step.name === name, 'end');
        break;
      }

      case 'step-failed': {
        // The message is "<step name> - <error>"; both parts may contain " - ".
        const rest = annotation.message.replace('Qase Step Failed: ', '');
        MetadataAccumulator.closeStep(metadata, (step) => rest.startsWith(`${step.name} - `), 'failed');
        break;
      }

      case 'attachment': {
        const attachmentName = annotation.message.replace('Qase Attachment: ', '');
        const a = annotation.attachment;
        const attachment: MetadataShape['attachments'][number] = { name: attachmentName };
        if (a?.path) attachment.path = a.path;
        if (a?.body !== undefined) {
          attachment.content = typeof a.body === 'string'
            ? a.body
            : new TextDecoder().decode(a.body);
        }
        if (a?.contentType) attachment.contentType = a.contentType;
        metadata.attachments.push(attachment);
        break;
      }
    }
  }

  private static closeStep(
    metadata: MetadataShape,
    matches: (step: StepRecord) => boolean,
    status: 'end' | 'failed',
  ): void {
    const openSteps = metadata.openSteps ?? [];
    for (let i = openSteps.length - 1; i >= 0; i--) {
      const step = openSteps[i];
      if (step && matches(step)) {
        step.status = status;
        openSteps.splice(i, 1);
        break;
      }
    }
    if (openSteps.length === 0) {
      delete metadata.openSteps;
    }
  }

  getMetadata(testId: string): MetadataShape | undefined {
    return this.testMetadata.get(testId);
  }

  clearMetadata(testId: string): void {
    this.testMetadata.delete(testId);
  }
}
