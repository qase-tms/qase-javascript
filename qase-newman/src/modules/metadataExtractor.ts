import { EventList, Item, PropertyBase, PropertyBaseDefinition } from 'postman-collection';
import { TestopsProjectMapping } from 'qase-javascript-commons';
import { filterPositiveIds } from 'qase-javascript-commons/internal';

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class MetadataExtractor {
  static qaseIdRegExp = /\/\/\s*?[qQ]ase:\s?((?:[\d]+[\s,]{0,})+)/;
  static qaseParamRegExp = /qase\.parameters:\s*([\w.]+(?:\s*,\s*[\w.]+)*)/i;
  /** Matches // qase PROJ1: 1,2 or // qase PROJ2: 3 for multi-project. */
  static qaseProjectRegExp = /\/\/\s*[qQ]ase\s+([A-Za-z0-9_]+):\s*([\d,\s]+)/g;

  static getCaseIds(eventList: EventList): number[] {
    const ids: number[] = [];
    eventList.each((event) => {
      if (event.listen === 'test' && event.script.exec) {
        event.script.exec.forEach((line: string) => {
          const [, match] = line.match(MetadataExtractor.qaseIdRegExp) ?? [];
          if (match) {
            ids.push(...match.split(',').map((id) => Number(id)));
          }
        });
      }
    });
    return filterPositiveIds(ids);
  }

  static getProjectMapping(eventList: EventList): TestopsProjectMapping {
    const projectMapping: TestopsProjectMapping = {};
    eventList.each((event) => {
      if (event.listen === 'test' && event.script.exec) {
        event.script.exec.forEach((line: string) => {
          let m: RegExpExecArray | null;
          const re = new RegExp(MetadataExtractor.qaseProjectRegExp.source, 'gi');
          while ((m = re.exec(line)) !== null) {
            const projectCode = m[1]?.trim();
            const idsStr = (m[2] ?? '').replace(/\s/g, '');
            const rawIds = idsStr
              .split(',')
              .map((s) => parseInt(s, 10))
              .filter((n) => !Number.isNaN(n));
            const ids = filterPositiveIds(rawIds);
            if (projectCode && projectCode.toUpperCase() !== 'ID' && ids.length > 0) {
              const existing = projectMapping[projectCode] ?? [];
              projectMapping[projectCode] = [...existing, ...ids];
            }
          }
        });
      }
    });
    return projectMapping;
  }

  static getParameters(item: Item): string[] {
    const params: string[] = [];
    item.events.each((event) => {
      if (event.listen === 'test' && event.script.exec) {
        event.script.exec.forEach((line) => {
          const match = line.match(MetadataExtractor.qaseParamRegExp);
          if (match) {
            const parameters: string[] = match[1]?.split(/\s*,\s*/) ?? [];
            params.push(...parameters);
          }
        });
      }
    });
    const parent = item.parent();
    if (parent && 'events' in parent) {
      params.push(...MetadataExtractor.getParameters(parent as Item));
    }
    return params;
  }

  static getParentTitles(item: PropertyBase<PropertyBaseDefinition>): string[] {
    let titles: string[] = [];
    const parent = item.parent();
    if (parent) {
      titles = titles.concat(MetadataExtractor.getParentTitles(parent));
    }
    if ('name' in item) {
      titles.push(String((item as { name: unknown }).name));
    }
    return titles;
  }
}
