#!/usr/bin/env node

/**
 * Validation script for Qase JavaScript examples
 *
 * Validates 9 primary examples for:
 * 1. Required files (package.json, README.md, config files)
 * 2. README sections (Overview, Prerequisites, etc.)
 * 3. Qase feature coverage (presence of features)
 * 4. Minimum usage counts (realistic demonstration thresholds)
 *
 * Exit codes:
 * 0 - All examples pass all checks
 * 1 - One or more examples failed checks
 */

const fs = require('fs');
const path = require('path');

// Hardcoded list of 9 primary examples (excludes legacy cypressBadeballCucumber, cypressCucumber)
const PRIMARY_EXAMPLES = [
  'playwright',
  'cypress',
  'testcafe',
  'wdio',
  'jest',
  'mocha',
  'vitest',
  'cucumberjs',
  'newman'
];

// Framework config file mapping
const FRAMEWORK_CONFIGS = {
  playwright: 'playwright.config.js',
  cypress: 'cypress.config.js',
  testcafe: 'qase.config.json',
  wdio: 'wdio.conf.js',
  jest: 'jest.config.js',
  mocha: 'qase.config.json',
  vitest: 'vitest.config.ts',
  cucumberjs: 'cucumber.js',
  newman: 'qase.config.json'
};

// Required README sections (case-insensitive)
const REQUIRED_README_SECTIONS = [
  'Overview',
  'Prerequisites',
  'Installation',
  'Configuration',
  'Running Tests',
  'Qase Features Demonstrated'
];

// Known limitations per framework (features NOT supported)
const KNOWN_LIMITATIONS = {
  newman: ['title', 'fields', 'step', 'attach', 'comment', 'ignore'],
  testcafe: ['comment'],
  cucumberjs: ['comment']
};

// Minimum usage counts for realistic demonstrations
const MIN_USAGE_COUNTS = {
  id: 2,
  title: 1,
  fields: 1,
  suite: 1,
  step: 2,
  attach: 1,
  comment: 1,
  parameters: 1,
  ignore: 1
};

// Test file extensions to scan
const TEST_FILE_EXTENSIONS = ['.js', '.ts', '.spec.js', '.spec.ts', '.test.js', '.test.ts', '.feature', '.json'];

// Directories to exclude from scanning
const EXCLUDE_DIRS = ['node_modules', 'build', 'dist', 'logs'];

/**
 * Check if file exists
 */
function fileExists(filePath) {
  try {
    return fs.existsSync(filePath);
  } catch (err) {
    return false;
  }
}

/**
 * Read file content
 */
function readFile(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf8');
  } catch (err) {
    return '';
  }
}

/**
 * Get all files in directory recursively
 */
function getAllFiles(dirPath, arrayOfFiles = []) {
  const files = fs.readdirSync(dirPath);

  files.forEach(file => {
    const filePath = path.join(dirPath, file);

    if (fs.statSync(filePath).isDirectory()) {
      // Skip excluded directories
      if (!EXCLUDE_DIRS.includes(file)) {
        arrayOfFiles = getAllFiles(filePath, arrayOfFiles);
      }
    } else {
      arrayOfFiles.push(filePath);
    }
  });

  return arrayOfFiles;
}

/**
 * Check 1: Validate required files
 */
function checkRequiredFiles(exampleDir, framework) {
  const results = {
    pass: true,
    missing: []
  };

  // Check package.json
  const packageJson = path.join(exampleDir, 'package.json');
  if (!fileExists(packageJson)) {
    results.pass = false;
    results.missing.push('package.json');
  } else {
    // Check for test script
    const pkg = JSON.parse(readFile(packageJson));
    if (!pkg.scripts || !pkg.scripts.test) {
      results.pass = false;
      results.missing.push('package.json:scripts.test');
    }
  }

  // Check README.md
  const readme = path.join(exampleDir, 'README.md');
  if (!fileExists(readme)) {
    results.pass = false;
    results.missing.push('README.md');
  }

  // Check framework config
  const configFile = FRAMEWORK_CONFIGS[framework];
  const configPath = path.join(exampleDir, configFile);
  if (!fileExists(configPath)) {
    results.pass = false;
    results.missing.push(configFile);
  }

  return results;
}

/**
 * Check 2: Validate README sections
 */
function checkReadmeSections(exampleDir) {
  const readmePath = path.join(exampleDir, 'README.md');
  const content = readFile(readmePath);

  const results = {
    pass: true,
    missing: []
  };

  REQUIRED_README_SECTIONS.forEach(section => {
    // Case-insensitive regex for ## Section Name
    const regex = new RegExp(`^##\\s+${section}`, 'im');
    if (!regex.test(content)) {
      results.pass = false;
      results.missing.push(section);
    }
  });

  return results;
}

/**
 * Check 3 & 4: Validate Qase feature coverage and minimum usage counts
 */
function checkQaseFeatures(exampleDir, framework) {
  const allFiles = getAllFiles(exampleDir);

  // Filter to test files
  const testFiles = allFiles.filter(file => {
    const ext = path.extname(file);
    const basename = path.basename(file);
    return TEST_FILE_EXTENSIONS.includes(ext) ||
           basename.endsWith('.spec.js') ||
           basename.endsWith('.spec.ts') ||
           basename.endsWith('.test.js') ||
           basename.endsWith('.test.ts') ||
           basename === 'api-collection.json';
  });

  // Count feature occurrences
  const featureCounts = {
    id: 0,
    title: 0,
    fields: 0,
    suite: 0,
    step: 0,
    attach: 0,
    comment: 0,
    parameters: 0,
    ignore: 0
  };

  testFiles.forEach(file => {
    const content = readFile(file);

    // id: qase(\d+, @QaseID=, // qase:, .id(\d+, withQase(
    const idMatches = content.match(/qase\(\d+|@QaseID=|\/\/\s*qase:|\.id\(\d+|withQase\(/g);
    if (idMatches) featureCounts.id += idMatches.length;

    // title: qase.title(, @QaseTitle=, also count qase(id, name) as implicit title, .title(
    const titleMatches = content.match(/qase\.title\(|@QaseTitle=|\.title\(/g);
    if (titleMatches) featureCounts.title += titleMatches.length;
    // Also count qase(id, 'name') wrapper pattern as implicit title
    const wrapperMatches = content.match(/qase\(\d+,\s*['"][^'"]+['"]/g);
    if (wrapperMatches) featureCounts.title += wrapperMatches.length;
    // Also count qase(id, it('name', ...)) wrapper pattern (Cypress) as implicit title
    const cypressWrapperMatches = content.match(/qase\(\d+,\s*\n?\s*it\(/g);
    if (cypressWrapperMatches) featureCounts.title += cypressWrapperMatches.length;

    // fields: qase.fields(, @QaseFields=, .fields(
    const fieldsMatches = content.match(/qase\.fields\(|@QaseFields=|\.fields\(/g);
    if (fieldsMatches) featureCounts.fields += fieldsMatches.length;

    // suite: qase.suite(, @QaseSuite=, .suite(
    // Special case: Newman uses folder structure for automatic suites (check for "item" array in collection)
    let suiteMatches = content.match(/qase\.suite\(|@QaseSuite=|\.suite\(/g);
    if (suiteMatches) featureCounts.suite += suiteMatches.length;
    // Newman: count folder structure as suite (check for nested "item" arrays in JSON)
    if (framework === 'newman' && file.endsWith('.json')) {
      const nestedItemMatches = content.match(/"item"\s*:\s*\[/g);
      if (nestedItemMatches && nestedItemMatches.length > 1) {
        // Multiple "item" arrays mean nested folder structure (automatic suites)
        featureCounts.suite += nestedItemMatches.length - 1;
      }
    }

    // step: qase.step(, test.step(, Given(|When(|Then( (BDD steps)
    const stepMatches = content.match(/qase\.step\(|test\.step\(|Given\(|When\(|Then\(/g);
    if (stepMatches) featureCounts.step += stepMatches.length;

    // attach: qase.attach(, this.attach(
    const attachMatches = content.match(/qase\.attach\(|this\.attach\(/g);
    if (attachMatches) featureCounts.attach += attachMatches.length;

    // comment: qase.comment(
    const commentMatches = content.match(/qase\.comment\(/g);
    if (commentMatches) featureCounts.comment += commentMatches.length;

    // parameters: qase.parameters(, @QaseParameters=, qase.parameters:, .parameters(
    const parametersMatches = content.match(/qase\.parameters\(|@QaseParameters=|qase\.parameters:|\.parameters\(/g);
    if (parametersMatches) featureCounts.parameters += parametersMatches.length;

    // ignore: qase.ignore(, @QaseIgnore, .ignore(
    const ignoreMatches = content.match(/qase\.ignore\(|@QaseIgnore|\.ignore\(/g);
    if (ignoreMatches) featureCounts.ignore += ignoreMatches.length;
  });

  // Get limitations for this framework
  const limitations = KNOWN_LIMITATIONS[framework] || [];

  // Check coverage and minimum counts
  const results = {
    pass: true,
    missing: [],
    belowMinimum: [],
    covered: 0,
    total: 9,
    limitations: limitations.length,
    counts: featureCounts
  };

  Object.keys(featureCounts).forEach(feature => {
    const count = featureCounts[feature];
    const isLimitation = limitations.includes(feature);
    const minCount = MIN_USAGE_COUNTS[feature];

    if (isLimitation) {
      // Feature is a known limitation, don't count as missing
      results.total--;
    } else {
      if (count === 0) {
        results.pass = false;
        results.missing.push(feature);
      } else if (count < minCount) {
        results.pass = false;
        results.belowMinimum.push(`${feature}: ${count}/${minCount} min`);
      } else {
        results.covered++;
      }
    }
  });

  return results;
}

/**
 * Validate a single example
 */
function validateExample(framework) {
  const exampleDir = path.join(process.cwd(), 'examples', 'single', framework);

  if (!fs.existsSync(exampleDir)) {
    return {
      framework,
      error: `Directory not found: ${exampleDir}`
    };
  }

  const structure = checkRequiredFiles(exampleDir, framework);
  const readme = checkReadmeSections(exampleDir);
  const features = checkQaseFeatures(exampleDir, framework);

  return {
    framework,
    structure,
    readme,
    features,
    pass: structure.pass && readme.pass && features.pass
  };
}

/**
 * Format validation results
 */
function formatResults(results) {
  let output = '=== Validation Results ===\n\n';
  let allPass = true;

  results.forEach(result => {
    if (result.error) {
      output += `${result.framework}:\n`;
      output += `  ERROR: ${result.error}\n\n`;
      allPass = false;
      return;
    }

    output += `${result.framework}:\n`;

    // Structure check
    if (result.structure.pass) {
      const configFile = FRAMEWORK_CONFIGS[result.framework];
      output += `  Structure: PASS (package.json, README.md, ${configFile})\n`;
    } else {
      output += `  Structure: FAIL (missing: ${result.structure.missing.join(', ')})\n`;
      allPass = false;
    }

    // README check
    if (result.readme.pass) {
      output += `  README: PASS (${REQUIRED_README_SECTIONS.length}/${REQUIRED_README_SECTIONS.length} required sections)\n`;
    } else {
      output += `  README: FAIL (missing: ${result.readme.missing.join(', ')})\n`;
      allPass = false;
    }

    // Features check
    if (result.features.pass) {
      const expected = result.features.total;
      output += `  Features: PASS (${result.features.covered}/${expected} features demonstrated`;
      if (result.features.limitations > 0) {
        output += `, ${result.features.limitations} known limitations`;
      }
      output += ', all above minimum usage thresholds)\n';
    } else {
      output += `  Features: FAIL (`;
      const issues = [];
      if (result.features.missing.length > 0) {
        issues.push(`missing: ${result.features.missing.join(', ')}`);
      }
      if (result.features.belowMinimum.length > 0) {
        issues.push(result.features.belowMinimum.join(', '));
      }
      output += issues.join('; ');
      output += ')\n';
      allPass = false;
    }

    output += '\n';
  });

  // Summary
  const passCount = results.filter(r => r.pass).length;
  output += '=== Summary ===\n';
  output += `${passCount}/${results.length} examples passed all checks\n`;

  return { output, allPass };
}

/**
 * Main execution
 */
function main() {
  console.log('Validating Qase JavaScript examples...\n');

  const results = PRIMARY_EXAMPLES.map(framework => validateExample(framework));
  const { output, allPass } = formatResults(results);

  console.log(output);

  process.exit(allPass ? 0 : 1);
}

main();
