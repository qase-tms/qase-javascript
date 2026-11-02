import * as fs from 'fs';

/**
 * Extracts tags for a given scenario name from a Gherkin feature file.
 * @param filePath - Path to the feature file.
 * @param scenarioName - Name of the scenario to search for.
 * @returns An array of tags found for the specified scenario.
 */
export function extractTags(filePath: string, scenarioName: string): string[] {
  // Read the file content
  const fileContent = fs.readFileSync(filePath, 'utf-8');

  // Split the content into lines
  const lines = fileContent.split('\n');

  let tags: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const trimmedLine = lines[i]?.trim(); // Ensure line exists and trim it

    // Check if the line is a Scenario line and matches the provided name
    if (trimmedLine?.startsWith('Scenario:') && trimmedLine === `Scenario: ${scenarioName}`) {

      // Collect the tag block right above the scenario; it may span several lines and contain comments
      for (let j = i - 1; j >= 0; j--) {
        const previousLine = lines[j]?.trim() ?? '';
        if (previousLine.startsWith('@')) {
          tags = [...previousLine.split(/\s+/).filter(tag => tag.startsWith('@')), ...tags];
        } else if (!previousLine.startsWith('#')) {
          break;
        }
      }

      break; // Stop processing further as the scenario is found
    }
  }

  return tags;
}
