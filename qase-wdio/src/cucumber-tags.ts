import { parseQaseIdsFromString } from 'qase-javascript-commons/internal';
import { MetadataApplier } from './metadata';

interface TagLike {
  name: string;
}

export class CucumberTagAdapter {
  constructor(private readonly metadata: MetadataApplier) {}

  applyTags(tags: readonly TagLike[]): void {
    for (const tag of tags) {
      if (!tag.name.includes('=')) {
        continue;
      }
      const parsed = parseTag(tag.name);
      if (parsed === null) {
        continue;
      }
      switch (parsed.key.toLowerCase()) {
        case '@qaseid':
          this.metadata.addQaseId({ ids: parseQaseIdsFromString(parsed.value) });
          break;
        case '@title':
          this.metadata.addTitle({ title: parsed.value });
          break;
        case '@suite':
          this.metadata.addSuite({ suite: parsed.value });
          break;
        case '@tags':
          this.metadata.addTags({ tags: parsed.value.split(',').map((t) => t.trim()) });
          break;
      }
    }
  }
}

function parseTag(tag: string): { key: string; value: string } | null {
  const [key, value] = tag.split('=');
  if (!key || !value) {
    return null;
  }
  return { key, value };
}
