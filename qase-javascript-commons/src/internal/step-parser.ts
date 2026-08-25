export interface ExtractedStep {
  expectedResult: string | null;
  data: string | null;
  cleanedString: string;
}

const EXPECTED_RESULT_MARKER = 'QaseExpRes:';
const DATA_MARKER = 'QaseData:';

/**
 * Drops the marker's optional second colon and the surrounding whitespace, so
 * that both `QaseExpRes: value` and `QaseExpRes:: value` yield `value`.
 */
function readMarkerValue(raw: string): string {
  return raw.replace(/^\s*:?\s*/, '').trim();
}

/**
 * Parses a step string for inline `QaseExpRes:` (expected result) and `QaseData:`
 * (data) markers. Returns the extracted parts and the input string with markers
 * removed. If no markers are present, returns nulls and the original string.
 */
export function extractAndCleanStep(input: string): ExtractedStep {
  const expectedResultIndex = input.indexOf(EXPECTED_RESULT_MARKER);
  const dataIndex = input.indexOf(DATA_MARKER);

  if (expectedResultIndex === -1 && dataIndex === -1) {
    return { expectedResult: null, data: null, cleanedString: input };
  }

  // Each marker's value runs until the next marker, or to the end of the input.
  // Slicing instead of matching `.` keeps multiline values intact.
  const expectedResultEnd = dataIndex > expectedResultIndex ? dataIndex : input.length;
  const dataEnd = expectedResultIndex > dataIndex ? expectedResultIndex : input.length;

  const expectedResult = expectedResultIndex === -1
    ? null
    : readMarkerValue(input.slice(expectedResultIndex + EXPECTED_RESULT_MARKER.length, expectedResultEnd));

  const data = dataIndex === -1
    ? ''
    : readMarkerValue(input.slice(dataIndex + DATA_MARKER.length, dataEnd));

  const markerIndexes = [expectedResultIndex, dataIndex].filter((index) => index !== -1);

  return {
    expectedResult,
    // an omitted data value stays `null`, matching the long-standing contract
    data: data === '' ? null : data,
    cleanedString: input.slice(0, Math.min(...markerIndexes)).trim(),
  };
}
