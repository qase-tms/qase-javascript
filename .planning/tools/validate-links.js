'use strict';

// Link Validation Script
// Detects broken internal links (file references and anchor fragments) in markdown files
//
// Usage:
//   node .planning/tools/validate-links.js <file|directory>
//
// Examples:
//   Validate entire package:
//   node .planning/tools/validate-links.js qase-jest/
//
//   Validate all reporters:
//   node .planning/tools/validate-links.js qase-*/
//
//   Validate single file:
//   node .planning/tools/validate-links.js qase-jest/README.md
//
// Exit codes:
//   0 - No broken links found
//   1 - Broken links found
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
 * Convert markdown heading to GitHub-compatible anchor slug
 * @param {string} heading - Heading text
 * @returns {string} Anchor slug
 */
function headingToSlug(heading) {
  return heading
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove non-alphanumeric except spaces and hyphens
    .replace(/\s+/g, '-')      // Replace spaces with hyphens
    .replace(/-+/g, '-')       // Collapse consecutive hyphens
    .replace(/^-|-$/g, '');    // Remove leading/trailing hyphens
}

/**
 * Extract headings from markdown content
 * @param {string} content - Markdown content
 * @returns {Array<string>} Array of heading slugs
 */
function extractHeadings(content) {
  const headings = [];
  const lines = content.split('\n');

  for (const line of lines) {
    // Match ATX-style headings (# Heading)
    const match = line.match(/^#{1,6}\s+(.+)$/);
    if (match) {
      const headingText = match[1].trim();
      const slug = headingToSlug(headingText);
      headings.push(slug);
    }
  }

  return headings;
}

/**
 * Extract links from markdown content
 * @param {string} content - Markdown content
 * @returns {Array<Object>} Array of link objects with text, url, and line number
 */
function extractLinks(content) {
  const links = [];
  const lines = content.split('\n');

  // Pattern: [text](url)
  const linkPattern = /\[([^\]]+)\]\(([^)]+)\)/g;

  lines.forEach((line, index) => {
    let match;
    while ((match = linkPattern.exec(line)) !== null) {
      links.push({
        text: match[1],
        url: match[2],
        line: index + 1,
      });
    }
  });

  return links;
}

/**
 * Validates links in a single file
 * @param {string} filePath - Path to the markdown file
 * @returns {Array} Array of broken link findings
 */
function validateFile(filePath) {
  const findings = [];

  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const links = extractLinks(content);
    const headings = extractHeadings(content);

    links.forEach(link => {
      const url = link.url;

      // Skip external links (http://, https://)
      if (url.startsWith('http://') || url.startsWith('https://')) {
        return;
      }

      // Skip mailto: links
      if (url.startsWith('mailto:')) {
        return;
      }

      // Handle anchor-only links (#section)
      if (url.startsWith('#')) {
        const anchor = url.substring(1);
        if (!headings.includes(anchor)) {
          findings.push({
            file: filePath,
            line: link.line,
            type: 'broken-anchor',
            link: url,
            text: link.text,
            message: `Anchor not found: #${anchor}`,
          });
        }
        return;
      }

      // Handle file links (possibly with anchors)
      let targetPath = url;
      let anchor = null;

      // Split file path and anchor
      if (url.includes('#')) {
        const parts = url.split('#');
        targetPath = parts[0];
        anchor = parts[1];
      }

      // Resolve relative path
      const fileDir = path.dirname(filePath);
      const resolvedPath = path.resolve(fileDir, targetPath);

      // Check if file exists
      if (!fs.existsSync(resolvedPath)) {
        findings.push({
          file: filePath,
          line: link.line,
          type: 'broken-file',
          link: url,
          text: link.text,
          message: `File not found: ${targetPath}`,
          resolvedPath: resolvedPath,
        });
        return;
      }

      // If anchor specified, check if it exists in target file
      if (anchor) {
        try {
          const targetContent = fs.readFileSync(resolvedPath, 'utf8');
          const targetHeadings = extractHeadings(targetContent);

          if (!targetHeadings.includes(anchor)) {
            findings.push({
              file: filePath,
              line: link.line,
              type: 'broken-anchor',
              link: url,
              text: link.text,
              message: `Anchor not found in ${targetPath}: #${anchor}`,
              resolvedPath: resolvedPath,
            });
          }
        } catch (error) {
          // Ignore read errors for non-markdown files (might be valid links to other file types)
          if (resolvedPath.endsWith('.md')) {
            findings.push({
              file: filePath,
              line: link.line,
              type: 'error',
              link: url,
              text: link.text,
              message: `Error reading target file: ${error.message}`,
            });
          }
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
 * @returns {boolean} True if broken links found
 */
function reportFindings(allFindings) {
  const brokenLinks = allFindings.flat();

  if (brokenLinks.length > 0) {
    console.log('');
    console.log(`${colors.red}BROKEN LINKS:${colors.reset}`);

    brokenLinks.forEach(finding => {
      console.log(`${colors.red}${finding.file}:${finding.line}: ${finding.message}${colors.reset}`);
      console.log(`  Link: [${finding.text}](${finding.link})`);
      if (finding.resolvedPath) {
        console.log(`  Resolved to: ${finding.resolvedPath}`);
      }
    });

    // Summary
    const uniqueFiles = new Set(brokenLinks.map(f => f.file));
    console.log('');
    console.log(`${colors.red}Found ${brokenLinks.length} broken link${brokenLinks.length !== 1 ? 's' : ''} in ${uniqueFiles.size} file${uniqueFiles.size !== 1 ? 's' : ''}${colors.reset}`);
  } else {
    console.log('');
    console.log(`${colors.green}✓ No broken links found${colors.reset}`);
  }

  return brokenLinks.length > 0;
}

/**
 * Main execution function
 */
function main() {
  const args = process.argv.slice(2);

  // Show help if requested or no arguments
  if (args.length === 0 || args[0] === '--help' || args[0] === '-h') {
    console.log('Usage: node validate-links.js <file|directory>');
    console.log('');
    console.log('Validates internal markdown links and anchor fragments.');
    console.log('');
    console.log('Examples:');
    console.log('  node validate-links.js qase-jest/README.md');
    console.log('  node validate-links.js qase-jest/');
    console.log('  node validate-links.js qase-*/');
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

  // Count total links
  let totalLinks = 0;
  markdownFiles.forEach(file => {
    const content = fs.readFileSync(file, 'utf8');
    const links = extractLinks(content);
    totalLinks += links.length;
  });

  console.log(`Checking ${totalLinks} link${totalLinks !== 1 ? 's' : ''}...`);

  // Validate all files
  const allFindings = markdownFiles.map(file => validateFile(file));

  // Report findings and determine exit code
  const hasBrokenLinks = reportFindings(allFindings);

  process.exit(hasBrokenLinks ? 1 : 0);
}

// Export functions for testing
module.exports = {
  validateFile,
  extractLinks,
  extractHeadings,
  headingToSlug,
  reportFindings,
};

// Run main if executed directly
if (require.main === module) {
  main();
}
