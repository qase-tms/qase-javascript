import { parseProjectMappingFromTags } from 'qase-javascript-commons';
import { filterPositiveIds } from 'qase-javascript-commons/internal';
import { MetadataApplier } from './metadata';

interface TagLike {
  name: string;
}

// The same tags as cucumberjs-qase-reporter, plus the `@Title=`, `@Suite=` and `@Tags=`
// spellings this reporter has always documented. Keys are case-insensitive.
const ID_KEYS = ['@qaseid'];
const TITLE_KEYS = ['@qasetitle', '@title'];
const SUITE_KEYS = ['@qasesuite', '@suite'];
const TAGS_KEYS = ['@qasetags', '@tags'];
const FIELDS_KEYS = ['@qasefields'];
const PARAMETERS_KEYS = ['@qaseparameters'];
const GROUP_PARAMETERS_KEYS = ['@qasegroupparameters'];

const SHORT_ID_REGEXP = /^@q-?(\d+)$/i;

export class CucumberTagAdapter {
  constructor(private readonly metadata: MetadataApplier) {}

  applyTags(tags: readonly TagLike[]): void {
    const names = tags.map((tag) => tag.name);
    const { legacyIds, projectMapping } = parseProjectMappingFromTags(names);
    const ids = [...legacyIds];
    let fields: Record<string, string> | undefined;
    let parameters: Record<string, string> | undefined;
    let groupParameters: Record<string, string> | undefined;

    for (const name of names) {
      const lower = name.toLowerCase();
      if (lower === '@qasemuted') {
        this.metadata.mute();
        continue;
      }
      if (lower === '@qaseignore') {
        this.metadata.ignore();
        continue;
      }

      const shortId = SHORT_ID_REGEXP.exec(name);
      if (shortId) {
        ids.push(...filterPositiveIds([Number(shortId[1])]));
        continue;
      }

      const parsed = parseTag(name);
      if (!parsed) continue;
      const key = parsed.key.toLowerCase();

      if (ID_KEYS.includes(key)) {
        ids.push(...filterPositiveIds(parsed.value.split(',').map((s) => Number(s.trim()))));
      } else if (TITLE_KEYS.includes(key)) {
        this.metadata.addTitle({ title: parsed.value });
      } else if (SUITE_KEYS.includes(key)) {
        this.metadata.addSuite({ suite: parsed.value });
      } else if (TAGS_KEYS.includes(key)) {
        const values = parsed.value.split(',').map((t) => t.trim()).filter((t) => t.length > 0);
        this.metadata.addTags({ tags: values });
      } else if (FIELDS_KEYS.includes(key)) {
        fields = { ...fields, ...parseRecord(parsed.value) };
      } else if (PARAMETERS_KEYS.includes(key)) {
        parameters = { ...parameters, ...parseRecord(parsed.value) };
      } else if (GROUP_PARAMETERS_KEYS.includes(key)) {
        groupParameters = { ...groupParameters, ...parseRecord(parsed.value) };
      }
    }

    if (ids.length > 0) this.metadata.addQaseId({ ids });
    if (Object.keys(projectMapping).length > 0) this.metadata.addProjectMapping(projectMapping);
    if (fields) this.metadata.addFields({ records: fields });
    if (parameters) this.metadata.addParameters({ records: parameters });
    if (groupParameters) this.metadata.addGroupParameters({ records: groupParameters });
  }
}

// Splits at the first `=` only, so values may contain `=` themselves.
function parseTag(tag: string): { key: string; value: string } | null {
  const index = tag.indexOf('=');
  if (index <= 0) return null;
  const value = tag.slice(index + 1);
  return value ? { key: tag.slice(0, index), value } : null;
}

// JSON with single quotes is accepted, as Gherkin examples usually write it that way.
function parseRecord(value: string): Record<string, string> {
  try {
    const parsed: unknown = JSON.parse(value.replace(/'/g, '"'));
    if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) return {};
    const record: Record<string, string> = {};
    for (const [k, v] of Object.entries(parsed)) {
      record[k] = String(v);
    }
    return record;
  } catch {
    return {};
  }
}
