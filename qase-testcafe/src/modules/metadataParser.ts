import { metadataEnum, MetadataType } from '../types';

export class MetadataParser {
  static parse(meta: Record<string, string>): MetadataType {
    const metadata: MetadataType = {
      QaseID: [],
      QaseTitle: undefined,
      QaseSuite: undefined,
      QaseFields: {},
      QaseParameters: {},
      QaseGroupParameters: {},
      QaseIgnore: false,
      QaseProjects: {},
      QaseTags: [],
    };

    if (meta[metadataEnum.oldID] !== undefined && meta[metadataEnum.oldID] !== '') {
      const v = meta[metadataEnum.oldID].split(',');
      metadata.QaseID = Array.isArray(v) ? v.map(Number) : [Number(v)];
    }

    if (meta[metadataEnum.id] !== undefined && meta[metadataEnum.id] !== '') {
      const v = meta[metadataEnum.id].split(',');
      metadata.QaseID = Array.isArray(v) ? v.map(Number) : [Number(v)];
    }

    if (meta[metadataEnum.title] !== undefined && meta[metadataEnum.title] !== '') {
      metadata.QaseTitle = meta[metadataEnum.title];
    }

    if (meta[metadataEnum.suite] !== undefined && meta[metadataEnum.suite] !== '') {
      metadata.QaseSuite = meta[metadataEnum.suite];
    }

    if (meta[metadataEnum.fields] !== undefined && meta[metadataEnum.fields] !== '') {
      metadata.QaseFields = JSON.parse(meta[metadataEnum.fields]) as Record<string, string>;
    }

    if (meta[metadataEnum.parameters] !== undefined && meta[metadataEnum.parameters] !== '') {
      metadata.QaseParameters = JSON.parse(meta[metadataEnum.parameters]) as Record<string, string>;
    }

    if (meta[metadataEnum.groupParameters] !== undefined && meta[metadataEnum.groupParameters] !== '') {
      metadata.QaseGroupParameters = JSON.parse(meta[metadataEnum.groupParameters]) as Record<string, string>;
    }

    if (meta[metadataEnum.ignore] !== undefined && meta[metadataEnum.ignore] !== '') {
      metadata.QaseIgnore = meta[metadataEnum.ignore] === 'true';
    }

    if (meta[metadataEnum.tags] !== undefined && meta[metadataEnum.tags] !== '') {
      metadata.QaseTags = meta[metadataEnum.tags]
        .split(',')
        .map((t: string) => t.trim())
        .filter((t: string) => t.length > 0);
    }

    if (meta[metadataEnum.projects] !== undefined && meta[metadataEnum.projects] !== '') {
      try {
        const parsed = JSON.parse(meta[metadataEnum.projects]) as Record<string, number[]>;
        if (parsed && typeof parsed === 'object') {
          metadata.QaseProjects = parsed;
        }
      } catch {
        // ignore invalid JSON
      }
    }

    return metadata;
  }
}
