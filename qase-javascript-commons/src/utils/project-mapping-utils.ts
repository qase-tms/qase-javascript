import type { TestopsProjectMapping } from '../models';

/**
 * Result of parsing project/ID markers from a test title.
 * - legacyIds: from "(Qase ID: 123)" or "(Qase ID: 123,124)" — single-project mode.
 * - projectMapping: from "(Qase PROJ1: 123)" etc. — multi-project mode (project code -> IDs).
 * - cleanedTitle: title with all such patterns removed.
 */
export interface ParsedProjectMapping {
  legacyIds: number[];
  projectMapping: TestopsProjectMapping;
  cleanedTitle: string;
}

/**
 * Result of parsing @qaseid / @qaseid.PROJ tags.
 * - legacyIds: from @qaseid(123) or @qaseid(123,124).
 * - projectMapping: from @qaseid.PROJ1(123,124).
 */
export interface ParsedTagsProjectMapping {
  legacyIds: number[];
  projectMapping: TestopsProjectMapping;
}

/** Matches @qaseid(123) or @qaseid.PROJ1(123,124). */
const QASEID_TAG_REGEXP = /@qaseid(?:\.([A-Za-z0-9_]+))?\(([\d,]+)\)/gi;

/**
 * Parse @qaseid and @qaseid.PROJECT tags into legacy IDs and project mapping.
 *
 * @param tags — e.g. ["@qaseid(1,2)", "@qaseid.PROJ2(3)"]
 * @returns legacyIds from @qaseid(...), projectMapping from @qaseid.PROJ(...)
 */
export function parseProjectMappingFromTags(tags: string[]): ParsedTagsProjectMapping {
  const legacyIds: number[] = [];
  const projectMapping: TestopsProjectMapping = {};

  for (const tag of tags) {
    let m: RegExpExecArray | null;
    const re = new RegExp(QASEID_TAG_REGEXP.source, 'gi');
    while ((m = re.exec(tag)) !== null) {
      const projectCode = m[1]; // undefined for @qaseid(1)
      const idsStr = m[2] ?? '';
      const ids = idsStr.split(',').map((s) => parseInt(s, 10)).filter((n) => !Number.isNaN(n));

      if (!projectCode || projectCode.toUpperCase() === 'ID') {
        legacyIds.push(...ids);
      } else if (ids.length > 0) {
        const existing = projectMapping[projectCode] ?? [];
        projectMapping[projectCode] = [...existing, ...ids];
      }
    }
  }

  return { legacyIds, projectMapping };
}

/** Matches "(Qase ID: 123)" or "(Qase PROJ1: 123,124)" — optional space after "Qase". */
const QASE_MARKER_REGEXP = /\(Qase\s+([A-Za-z0-9_]+):\s*([\d,]+)\)/gi;

/**
 * Parse multi-project and legacy Qase ID markers from a test title.
 * - "(Qase ID: 123)" or "(Qase ID: 123,124)" → legacyIds, single-project.
 * - "(Qase PROJ1: 123)" or "(Qase PROJ2: 456)" → projectMapping for testops_multi.
 *
 * @param title — test title that may contain "(Qase ID: …)" or "(Qase PROJECT_CODE: …)".
 * @returns legacyIds, projectMapping, and cleanedTitle with all markers stripped.
 */
export function parseProjectMappingFromTitle(title: string): ParsedProjectMapping {
  const legacyIds: number[] = [];
  const projectMapping: TestopsProjectMapping = {};
  let cleanedTitle = title;

  let m: RegExpExecArray | null;
  const re = new RegExp(QASE_MARKER_REGEXP.source, 'gi');
  while ((m = re.exec(title)) !== null) {
    const projectCode = m[1] ?? '';
    const idsStr = m[2] ?? '';
    const ids = idsStr.split(',').map((s) => parseInt(s, 10)).filter((n) => !Number.isNaN(n));

    if (projectCode.toUpperCase() === 'ID') {
      legacyIds.push(...ids);
    } else if (projectCode && ids.length > 0) {
      const existing = projectMapping[projectCode] ?? [];
      projectMapping[projectCode] = [...existing, ...ids];
    }
    cleanedTitle = cleanedTitle.replace(m[0], '');
  }

  cleanedTitle = cleanedTitle.replace(/\s+/g, ' ').trim();
  return { legacyIds, projectMapping, cleanedTitle };
}

/**
 * Build a test title with multi-project markers for use in test names.
 * Use this (or framework-specific qase.projects()) so the reporter can parse project and IDs.
 *
 * @param title — base test title (e.g. "Login flow").
 * @param mapping — project code → list of test case IDs (e.g. { PROJ1: [1, 2], PROJ2: [3] }).
 * @returns title with appended markers, e.g. "Login flow (Qase PROJ1: 1,2) (Qase PROJ2: 3)".
 */
export function formatTitleWithProjectMapping(
  title: string,
  mapping: TestopsProjectMapping,
): string {
  if (!title || typeof title !== 'string') {
    return title;
  }
  const parts = Object.entries(mapping)
    .filter(([, ids]) => Array.isArray(ids) && ids.length > 0)
    .map(([code, ids]) => `(Qase ${code}: ${ids.join(',')})`);
  if (parts.length === 0) {
    return title.trim();
  }
  return `${title.trim()} ${parts.join(' ')}`;
}
