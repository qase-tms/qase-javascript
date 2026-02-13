'use strict';

// Terminology Validation Script
// Detects terminology inconsistencies in markdown files using .planning/config/terminology.json
//
// Usage:
//   node .planning/tools/validate-terminology.js <file|directory>
//
// Examples:
//   Validate entire package:
//   node .planning/tools/validate-terminology.js qase-jest/
//
//   Validate all reporters:
//   node .planning/tools/validate-terminology.js qase-*/
//
//   Validate single file:
//   node .planning/tools/validate-terminology.js qase-jest/README.md
//
// Exit codes:
//   0 - No deprecated terms found (warnings allowed)
//   1 - Deprecated terms found (errors)
//   2 - Error (invalid arguments, file not found, etc.)

const fs = require('fs');
const path = require('path');
const { findMarkdownFiles } = require('./extract-code-blocks');

// ANSI color codes
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  reset: '\x1b[0m',
};

/**
 * Load terminology dictionary from config
 * @returns {Object} Terminology configuration
 */
function loadTerminology() {
  const configPath = path.join(__dirname, '..', 'config', 'terminology.json');
  try {
    const content = fs.readFileSync(configPath, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    console.error(`${colors.red}Error loading terminology config: ${error.message}${colors.reset}`);
    process.exit(2);
  }
}

/**
 * Check if line is inside a code block
 * @param {Array<string>} lines - All lines in the file
 * @param {number} lineIndex - Current line index (0-based)
 * @returns {boolean} True if inside code block
 */
function isInsideCodeBlock(lines, lineIndex) {
  let inBlock = false;
  for (let i = 0; i < lineIndex; i++) {
    const line = lines[i];
    // Match opening or closing fence
    if (line.match(/^```/)) {
      inBlock = !inBlock;
    }
  }
  return inBlock;
}

/**
 * Strip markdown link URLs from line (keep link text)
 * This prevents false positives from URLs like (https://qase.io)
 * @param {string} line - Line to process
 * @returns {string} Line with URLs removed
 */
function stripMarkdownUrls(line) {
  // Replace [text](url) with [text] (keep text, remove URL)
  return line.replace(/\[([^\]]+)\]\([^)]+\)/g, '[$1]');
}

/**
 * Validates a single file for terminology issues
 * @param {string} filePath - Path to the markdown file
 * @param {Object} terminology - Terminology configuration
 * @returns {Object} Object with errors and warnings arrays
 */
function validateFile(filePath, terminology) {
  const findings = {
    errors: [],
    warnings: [],
  };

  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');

    lines.forEach((line, index) => {
      const lineNumber = index + 1;

      // Skip code blocks (code examples can have lowercase 'qase', etc.)
      if (isInsideCodeBlock(lines, index)) {
        return;
      }

      // Strip markdown URLs to avoid false positives from domain names
      const proseText = stripMarkdownUrls(line);

      // Check deprecated terms (ERRORS)
      for (const [term, info] of Object.entries(terminology.deprecated)) {
        // Case-insensitive word boundary match
        const pattern = new RegExp(`\\b${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
        if (pattern.test(proseText)) {
          findings.errors.push({
            file: filePath,
            line: lineNumber,
            type: 'deprecated',
            term: term,
            replacement: info.replacement,
            reason: info.reason,
          });
        }
      }

      // Check canonical term variants (WARNINGS)
      for (const [term, info] of Object.entries(terminology.canonical)) {
        if (!info.pattern) continue;

        // Skip if marked as code-only context
        if (info.context === 'code') continue;

        const pattern = new RegExp(info.pattern, 'g');
        const matches = proseText.match(pattern);

        if (matches) {
          // Check if matches are NOT the correct form
          matches.forEach(match => {
            // Trim word boundaries and check exact match
            const cleanMatch = match.trim();
            if (cleanMatch !== info.correct && cleanMatch.toLowerCase() === info.correct.toLowerCase()) {
              findings.warnings.push({
                file: filePath,
                line: lineNumber,
                type: 'variant',
                term: cleanMatch,
                correct: info.correct,
                notes: info.notes,
              });
            }
          });
        }
      }

      // Check ambiguous terms (WARNINGS)
      for (const [term, info] of Object.entries(terminology.ambiguous)) {
        // Word boundary match
        const pattern = new RegExp(`\\b${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
        if (pattern.test(proseText)) {
          findings.warnings.push({
            file: filePath,
            line: lineNumber,
            type: 'ambiguous',
            term: term,
            guidance: info.guidance,
          });
        }
      }
    });
  } catch (error) {
    console.error(`${colors.red}Error reading file ${filePath}: ${error.message}${colors.reset}`);
  }

  return findings;
}

/**
 * Report findings to console
 * @param {Array} allFindings - Array of all findings from all files
 * @returns {boolean} True if errors found
 */
function reportFindings(allFindings) {
  const allErrors = allFindings.flatMap(f => f.errors);
  const allWarnings = allFindings.flatMap(f => f.warnings);

  // Report errors
  if (allErrors.length > 0) {
    console.log('');
    console.log(`${colors.red}ERRORS (deprecated terms):${colors.reset}`);
    allErrors.forEach(finding => {
      console.log(`${colors.red}${finding.file}:${finding.line}: "${finding.term}" should be "${finding.replacement}"${colors.reset}`);
      console.log(`  ${colors.yellow}Reason: ${finding.reason}${colors.reset}`);
    });
  }

  // Report warnings
  if (allWarnings.length > 0) {
    console.log('');
    console.log(`${colors.yellow}WARNINGS (inconsistent usage):${colors.reset}`);
    allWarnings.forEach(finding => {
      if (finding.type === 'variant') {
        console.log(`${colors.yellow}${finding.file}:${finding.line}: "${finding.term}" should be "${finding.correct}"${colors.reset}`);
        if (finding.notes) {
          console.log(`  ${finding.notes}`);
        }
      } else if (finding.type === 'ambiguous') {
        console.log(`${colors.yellow}${finding.file}:${finding.line}: Ambiguous term "${finding.term}"${colors.reset}`);
        console.log(`  ${finding.guidance}`);
      }
    });
  }

  // Summary
  console.log('');
  if (allErrors.length === 0 && allWarnings.length === 0) {
    console.log(`${colors.green}✓ No terminology issues found${colors.reset}`);
  } else {
    const uniqueErrorFiles = new Set(allErrors.map(f => f.file));
    const uniqueWarningFiles = new Set(allWarnings.map(f => f.file));

    if (allErrors.length > 0) {
      console.log(`${colors.red}Found ${allErrors.length} error${allErrors.length !== 1 ? 's' : ''} in ${uniqueErrorFiles.size} file${uniqueErrorFiles.size !== 1 ? 's' : ''}${colors.reset}`);
    }
    if (allWarnings.length > 0) {
      console.log(`${colors.yellow}Found ${allWarnings.length} warning${allWarnings.length !== 1 ? 's' : ''} in ${uniqueWarningFiles.size} file${uniqueWarningFiles.size !== 1 ? 's' : ''}${colors.reset}`);
    }
  }

  return allErrors.length > 0;
}

/**
 * Main execution function
 */
function main() {
  const args = process.argv.slice(2);

  // Show help if requested or no arguments
  if (args.length === 0 || args[0] === '--help' || args[0] === '-h') {
    console.log('Usage: node validate-terminology.js <file|directory>');
    console.log('');
    console.log('Detects terminology inconsistencies in markdown files.');
    console.log('');
    console.log('Examples:');
    console.log('  node validate-terminology.js qase-jest/README.md');
    console.log('  node validate-terminology.js qase-jest/');
    console.log('  node validate-terminology.js qase-*/');
    console.log('');
    process.exit(args.length === 0 ? 2 : 0);
  }

  const targetPath = args[0];

  // Check if target exists
  if (!fs.existsSync(targetPath)) {
    console.error(`${colors.red}Error: Path not found: ${targetPath}${colors.reset}`);
    process.exit(2);
  }

  // Load terminology dictionary
  const terminology = loadTerminology();
  console.log('Loaded terminology dictionary');

  const stats = fs.statSync(targetPath);
  let markdownFiles = [];

  if (stats.isDirectory()) {
    console.log(`Scanning directory: ${targetPath}`);
    markdownFiles = findMarkdownFiles(targetPath, ['node_modules', '.git']);
  } else if (stats.isFile()) {
    console.log(`Validating file: ${targetPath}`);
    markdownFiles = [targetPath];
  } else {
    console.error(`${colors.red}Error: Path is neither file nor directory: ${targetPath}${colors.reset}`);
    process.exit(2);
  }

  console.log(`Found ${markdownFiles.length} markdown file${markdownFiles.length !== 1 ? 's' : ''}`);

  // Validate all files
  const allFindings = markdownFiles.map(file => validateFile(file, terminology));

  // Report findings and determine exit code
  const hasErrors = reportFindings(allFindings);

  process.exit(hasErrors ? 1 : 0);
}

// Export functions for testing
module.exports = {
  validateFile,
  reportFindings,
  loadTerminology,
};

// Run main if executed directly
if (require.main === module) {
  main();
}
