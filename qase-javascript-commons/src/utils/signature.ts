/**
 * Generates a signature string from testops IDs, suites and parameters
 * @param testopsIds - Array of testops IDs or null
 * @param suites - Array of suite names
 * @param parameters - Map of parameter names to values
 * @returns Formatted signature string
 */
export const generateSignature = (
  testopsIds: number[] | null,
  suites: string[],
  parameters: Record<string, string>
): string => {
  const parts: string[] = [];
  
  if (testopsIds) {
    parts.push(testopsIds.join('-'));
  }
  
  if (suites.length > 0) {
    const processedSuites = suites
      .map(suite => suite.trim())
      .flatMap(suite => suite.split('::'))
      .map(suite => suite.trim())
      .flatMap(suite => suite.split('\t'))
      .map(suite => suite.trim())
      .map(suite => suite.replace(/\s+/g, '_'))
      .map(suite => suite.toLowerCase())
      .filter(suite => suite.length > 0);
    
    parts.push(processedSuites.join('::'));
  }
  
  const paramsString = Object.entries(parameters)
    .map(([key, value]) => `{'${key.toLowerCase()}':'${value.toLowerCase()}'}`)
    .join('::');
  
  if (paramsString) {
    parts.push(paramsString);
  }

  return parts.join('::');
}; 
