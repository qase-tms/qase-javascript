export interface ExtractedStep {
  expectedResult: string | null;
  data: string | null;
  cleanedString: string;
}

/**
 * Parses a step string for inline `QaseExpRes:` (expected result) and `QaseData:`
 * (data) markers. Returns the extracted parts and the input string with markers
 * removed. If no markers are present, returns nulls and the original string.
 */
export function extractAndCleanStep(input: string): ExtractedStep {
  let expectedResult: string | null = null;
  let data: string | null = null;
  let cleanedString = input;

  const hasExpectedResult = input.includes('QaseExpRes:');
  const hasData = input.includes('QaseData:');

  if (hasExpectedResult || hasData) {
    const regex = /QaseExpRes:\s*:?\s*(.*?)\s*(?=QaseData:|$)QaseData:\s*:?\s*(.*)?/;
    const match = input.match(regex);

    if (match) {
      expectedResult = match[1]?.trim() ?? null;
      data = match[2]?.trim() ?? null;

      cleanedString = input
        .replace(/QaseExpRes:\s*:?\s*.*?(?=QaseData:|$)/, '')
        .replace(/QaseData:\s*:?\s*.*/, '')
        .trim();
    }
  }

  return { expectedResult, data, cleanedString };
}
