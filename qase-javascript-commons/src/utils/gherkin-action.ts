/**
 * The action of a Gherkin step: its keyword and text, e.g. `Given a user`.
 * Reporters before cucumberjs-qase-reporter 2.6.1 put the step text in `keyword` too.
 */
export const gherkinAction = (keyword: string | undefined, name: string | undefined): string => {
  const parts = keyword === name ? [name] : [keyword, name];
  return parts.filter((part) => part).join(' ').trim();
};
