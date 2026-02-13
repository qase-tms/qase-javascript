'use strict';

// Placeholder Validation Script
// Detects unreplaced placeholders in markdown files (pattern: {{PLACEHOLDER}})
//
// Usage:
//   node .planning/tools/validate-placeholders.js <file|directory>
//
// Examples:
//   Validate single file:
//   node .planning/tools/validate-placeholders.js qase-jest/README.md
//
//   Validate entire package:
//   node .planning/tools/validate-placeholders.js qase-jest/
//
//   Validate all reporters:
//   node .planning/tools/validate-placeholders.js qase-*/
//
// Exit codes:
//   0 - No unreplaced placeholders found
//   1 - Unreplaced placeholders found
//   2 - Error (invalid arguments, file not found, etc.)

const fs = require('fs');
const path = require('path');

// Regex to match {{PLACEHOLDER}} pattern
const PLACEHOLDER_PATTERN = /\{\{[A-Z_]+\}\}/g;

// ANSI color codes (fallback to plain text if colors not supported)
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  reset: '\x1b[0m',
};

/**
 * Validates a single file for unreplaced placeholders
 * @param {string} filePath - Path to the markdown file
 * @returns {Array} Array of found placeholders with line numbers
 */
function validateFile(filePath) {
  const findings = [];

  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');

    lines.forEach((line, index) => {
      const matches = line.match(PLACEHOLDER_PATTERN);
      if (matches) {
        matches.forEach(placeholder => {
          findings.push({
            file: filePath,
            line: index + 1,
            placeholder: placeholder,
          });
        });
      }
    });
  } catch (error) {
    console.error(`${colors.red}Error reading file ${filePath}: ${error.message}${colors.reset}`);
  }

  return findings;
}

/**
 * Recursively scans directory for markdown files and validates them
 * @param {string} dirPath - Path to directory to scan
 * @param {Array} exclusions - Directories to exclude from scanning
 * @returns {Array} Array of all found placeholders
 */
function scanDirectory(dirPath, exclusions = []) {
  let allFindings = [];

  try {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);

      // Skip excluded directories
      if (entry.isDirectory() && exclusions.some(exc => fullPath.includes(exc))) {
        continue;
      }

      if (entry.isDirectory()) {
        // Recursively scan subdirectories
        const subFindings = scanDirectory(fullPath, exclusions);
        allFindings = allFindings.concat(subFindings);
      } else if (entry.isFile() && entry.name.endsWith('.md')) {
        // Validate markdown files
        const findings = validateFile(fullPath);
        allFindings = allFindings.concat(findings);
      }
    }
  } catch (error) {
    console.error(`${colors.red}Error scanning directory ${dirPath}: ${error.message}${colors.reset}`);
  }

  return allFindings;
}

/**
 * Main execution function
 */
function main() {
  const args = process.argv.slice(2);

  // Show help if requested or no arguments
  if (args.length === 0 || args[0] === '--help' || args[0] === '-h') {
    console.log('Usage: node validate-placeholders.js <file|directory>');
    console.log('');
    console.log('Detects unreplaced {{PLACEHOLDER}} patterns in markdown files.');
    console.log('');
    console.log('Examples:');
    console.log('  node validate-placeholders.js qase-jest/README.md');
    console.log('  node validate-placeholders.js qase-jest/');
    console.log('');
    process.exit(args.length === 0 ? 2 : 0);
  }

  const targetPath = args[0];

  // Check if target exists
  if (!fs.existsSync(targetPath)) {
    console.error(`${colors.red}Error: Path not found: ${targetPath}${colors.reset}`);
    process.exit(2);
  }

  const stats = fs.statSync(targetPath);
  let findings = [];

  if (stats.isDirectory()) {
    console.log(`Scanning directory: ${targetPath}`);
    // When scanning from project root or any directory, exclude .planning/ to avoid false positives from templates
    const exclusions = targetPath === '.' || targetPath === './' ? ['.planning/'] : [];
    findings = scanDirectory(targetPath, exclusions);
  } else if (stats.isFile()) {
    console.log(`Validating file: ${targetPath}`);
    findings = validateFile(targetPath);
  } else {
    console.error(`${colors.red}Error: Path is neither file nor directory: ${targetPath}${colors.reset}`);
    process.exit(2);
  }

  // Report findings
  if (findings.length > 0) {
    console.log('');
    findings.forEach(finding => {
      console.log(`${colors.red}${finding.file}:${finding.line}: Found unreplaced placeholder: ${finding.placeholder}${colors.reset}`);
    });

    // Summary
    const uniqueFiles = new Set(findings.map(f => f.file));
    console.log('');
    console.log(`${colors.red}Found ${findings.length} unreplaced placeholder${findings.length !== 1 ? 's' : ''} in ${uniqueFiles.size} file${uniqueFiles.size !== 1 ? 's' : ''}${colors.reset}`);
    process.exit(1);
  } else {
    console.log('');
    console.log(`${colors.green}✓ No unreplaced placeholders found${colors.reset}`);
    process.exit(0);
  }
}

// Export functions for testing
module.exports = {
  validateFile,
  scanDirectory,
};

// Run main if executed directly
if (require.main === module) {
  main();
}
