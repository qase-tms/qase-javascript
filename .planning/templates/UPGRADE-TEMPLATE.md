# Upgrade Guide: {{FRAMEWORK_NAME}} Reporter

This guide covers migration steps between major versions of the Qase {{FRAMEWORK_NAME}} Reporter.

---

## Version History

| Version | Release Date | Node.js Support | Key Changes |
|---------|--------------|-----------------|-------------|
| {{CURRENT_VERSION}} | {{CURRENT_DATE}} | >= 14 | {{CURRENT_CHANGES}} |
| {{PREVIOUS_VERSION}} | {{PREVIOUS_DATE}} | >= 12 | {{PREVIOUS_CHANGES}} |

---

## Upgrading to {{CURRENT_VERSION}}

### Breaking Changes

{{BREAKING_CHANGES_LIST}}

### Migration Steps

#### 1. Update Package

```sh
npm install --save-dev {{PACKAGE_NAME}}@{{CURRENT_VERSION}}
```

#### 2. Update Configuration

{{CONFIG_MIGRATION_STEPS}}

#### 3. Update Test Annotations

{{ANNOTATION_MIGRATION_STEPS}}

#### 4. Update Imports

{{IMPORT_MIGRATION_STEPS}}

---

## Configuration Changes

### Renamed Options

| Old Option | New Option |
|------------|------------|
{{RENAMED_OPTIONS_TABLE}}

### Removed Options

| Option | Migration Path |
|--------|----------------|
{{REMOVED_OPTIONS_TABLE}}

### New Options

| Option | Description | Default |
|--------|-------------|---------|
{{NEW_OPTIONS_TABLE}}

---

## API Changes

### Renamed Methods

| Old Method | New Method |
|------------|------------|
{{RENAMED_METHODS_TABLE}}

### Removed Methods

| Method | Migration Path |
|--------|----------------|
{{REMOVED_METHODS_TABLE}}

### New Methods

| Method | Description |
|--------|-------------|
{{NEW_METHODS_TABLE}}

---

## Import Changes

### {{FRAMEWORK_NAME}}-Specific Changes

{{IMPORT_CHANGES}}

**Before (v{{PREVIOUS_VERSION}}):**
```javascript
{{IMPORT_BEFORE_EXAMPLE}}
```

**After (v{{CURRENT_VERSION}}):**
```javascript
{{IMPORT_AFTER_EXAMPLE}}
```

---

## Before/After Examples

### Example 1: {{EXAMPLE_1_TITLE}}

**Before (v{{PREVIOUS_VERSION}}):**

{{EXAMPLE_1_BEFORE}}

**After (v{{CURRENT_VERSION}}):**

{{EXAMPLE_1_AFTER}}

### Example 2: {{EXAMPLE_2_TITLE}}

**Before (v{{PREVIOUS_VERSION}}):**

{{EXAMPLE_2_BEFORE}}

**After (v{{CURRENT_VERSION}}):**

{{EXAMPLE_2_AFTER}}

---

## Compatibility Notes

### Node.js Version Support

- {{CURRENT_VERSION}}: Node.js >= 14
- {{PREVIOUS_VERSION}}: Node.js >= 12

### {{FRAMEWORK_NAME}} Version Support

- {{CURRENT_VERSION}}: {{FRAMEWORK_NAME}} >= {{FRAMEWORK_MIN_VERSION}}
- {{PREVIOUS_VERSION}}: {{FRAMEWORK_NAME}} >= {{FRAMEWORK_PREV_MIN_VERSION}}

---

## Troubleshooting

### Common Migration Issues

#### Issue: {{COMMON_ISSUE_1}}

**Solution:** {{SOLUTION_1}}

#### Issue: {{COMMON_ISSUE_2}}

**Solution:** {{SOLUTION_2}}

---

## Getting Help

If you encounter issues during migration:

1. Check the [GitHub Issues](https://github.com/qase-tms/qase-javascript/issues)
2. Review the [CHANGELOG](../../CHANGELOG.md)
3. Open a new issue with:
   - Previous version
   - Target version
   - Error messages
   - Configuration file (without sensitive data)

---

## See Also

- [Usage Guide](usage.md)
- [Configuration Reference](../../qase-javascript-commons/README.md)
- [CHANGELOG](../../CHANGELOG.md)
