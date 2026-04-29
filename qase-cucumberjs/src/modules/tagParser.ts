import { PickleTag } from '@cucumber/messages';
import { parseProjectMappingFromTags } from 'qase-javascript-commons';
import { TestMetadata } from '../models';

const qaseIdRegExp = /^@[Qq]-?(\d+)$/;
const newQaseIdRegExp = /^@[Qq]ase[Ii][Dd]=(\d+(?:,\s*\d+)*)$/;
const qaseTitleRegExp = /^@[Qq]ase[Tt]itle=(.+)$/;
const qaseFieldsRegExp = /^@[Qq]ase[Ff]ields=(.+)$/;
const qaseParametersRegExp = /^@[Qq]ase[Pp]arameters=(.+)$/;
const qaseGroupParametersRegExp = /^@[Qq]ase[Gg]roup[Pp]arameters=(.+)$/;
const qaseSuiteRegExp = /^@[Qq]ase[Ss]uite=(.+)$/;
const qaseIgnoreRegExp = /^@[Qq]ase[Ii][Gg][Nn][Oo][Rr][Ee]$/;
const qaseTagsRegExp = /^@[Qq]ase[Tt]ags=(.+)$/;

export class TagParser {
  static parse(tags: readonly PickleTag[]): TestMetadata {
    const tagNames = tags.map((t) => t.name);
    const { legacyIds, projectMapping } = parseProjectMappingFromTags(tagNames);

    const metadata: TestMetadata = {
      ids: [...legacyIds],
      projectMapping: { ...projectMapping },
      fields: {},
      title: null,
      isIgnore: false,
      parameters: {},
      group_params: {},
      suite: null,
      tags: [],
    };

    for (const tag of tags) {
      if (qaseIdRegExp.test(tag.name)) {
        metadata.ids.push(Number(tag.name.replace(/^@[Qq]-?/, '')));
        continue;
      }

      if (newQaseIdRegExp.test(tag.name)) {
        const idsStr = tag.name.replace(/^@[Qq]ase[Ii][Dd]=/, '');
        metadata.ids.push(...idsStr.split(',').map((s) => Number(s.trim())));
        continue;
      }

      if (qaseTitleRegExp.test(tag.name)) {
        metadata.title = tag.name.replace(/^@[Qq]ase[Tt]itle=/, '');
        continue;
      }

      if (qaseFieldsRegExp.test(tag.name)) {
        const value = tag.name.replace(/^@[Qq]ase[Ff]ields=/, '');
        try {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          const record: Record<string, string> = JSON.parse(TagParser.normalizeJsonString(value));
          metadata.fields = { ...metadata.fields, ...record };
        } catch {
          // do nothing
        }
      }

      if (qaseParametersRegExp.test(tag.name)) {
        const value = tag.name.replace(/^@[Qq]ase[Pp]arameters=/, '');
        try {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          const record: Record<string, string> = JSON.parse(TagParser.normalizeJsonString(value));
          metadata.parameters = { ...metadata.parameters, ...record };
        } catch {
          // do nothing
        }
      }

      if (qaseGroupParametersRegExp.test(tag.name)) {
        const value = tag.name.replace(/^@[Qq]ase[Gg]roup[Pp]arameters=/, '');
        try {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          const record: Record<string, string> = JSON.parse(TagParser.normalizeJsonString(value));
          metadata.group_params = { ...metadata.group_params, ...record };
        } catch {
          // do nothing
        }
      }

      if (qaseSuiteRegExp.test(tag.name)) {
        metadata.suite = tag.name.replace(/^@[Qq]ase[Ss]uite=/, '');
        continue;
      }

      if (qaseTagsRegExp.test(tag.name)) {
        const value = tag.name.replace(/^@[Qq]ase[Tt]ags=/, '');
        const parsedTags = value.split(',').map((t) => t.trim()).filter((t) => t.length > 0);
        metadata.tags.push(...parsedTags);
        continue;
      }

      if (qaseIgnoreRegExp.test(tag.name)) {
        metadata.isIgnore = true;
      }
    }

    return metadata;
  }

  static normalizeJsonString(jsonString: string): string {
    if (jsonString.includes("'")) {
      return jsonString.replace(/'/g, '"');
    }
    return jsonString;
  }
}
