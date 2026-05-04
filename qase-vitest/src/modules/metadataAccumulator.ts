import type { TestAnnotation } from '@vitest/runner';
import { TestStepType } from 'qase-javascript-commons';

export interface MetadataShape {
  title?: string;
  comment?: string;
  suite?: string;
  fields?: Record<string, string>;
  parameters?: Record<string, string>;
  groupParameters?: Record<string, string>;
  tags?: string[];
  currentStep?: string;
  steps: { name: string; status: 'start' | 'end' | 'failed' }[];
  attachments: { name: string; path?: string; content?: string; contentType?: string }[];
  _profilerSteps?: TestStepType[];
}

export class MetadataAccumulator {
  private testMetadata = new Map<string, MetadataShape>();
  private currentSuite: string | undefined = undefined;

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
        metadata.currentStep === undefined &&
        metadata._profilerSteps === undefined
      ) {
        this.testMetadata.delete(testId);
      }
      return;
    }

    const qaseType = annotation.message.split(':')[0]?.replace('Qase ', '').toLowerCase().replace(' ', '-') ?? '';

    switch (qaseType) {
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

      case 'step-start':
        metadata.currentStep = annotation.message.replace('Qase Step Start: ', '');
        break;

      case 'step-end':
        if (metadata.currentStep) {
          metadata.steps.push({ name: metadata.currentStep, status: 'end' });
          delete metadata.currentStep;
        }
        break;

      case 'step-failed':
        if (metadata.currentStep) {
          metadata.steps.push({ name: metadata.currentStep, status: 'failed' });
          delete metadata.currentStep;
        }
        break;

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

  getMetadata(testId: string): MetadataShape | undefined {
    return this.testMetadata.get(testId);
  }

  clearMetadata(testId: string): void {
    this.testMetadata.delete(testId);
  }

  setCurrentSuite(name: string): void {
    this.currentSuite = name;
  }

  clearCurrentSuite(): void {
    this.currentSuite = undefined;
  }

  getCurrentSuite(): string | undefined {
    return this.currentSuite;
  }
}
