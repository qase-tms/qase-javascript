import { TestStatusEnum } from '../models/test-execution';

/**
 * Applies status mapping configuration to a test status
 * @param status - Original test status
 * @param statusMapping - Status mapping configuration
 * @returns Mapped test status or original if no mapping found
 */
export function applyStatusMapping(
  status: TestStatusEnum, 
  statusMapping?: Record<string, string>
): TestStatusEnum {
  if (!statusMapping) {
    return status;
  }

  const mappedStatus = statusMapping[status];
  if (!mappedStatus) {
    return status;
  }

  // Validate that the mapped status is a valid TestStatusEnum value
  const validStatuses = Object.values(TestStatusEnum);
  if (!validStatuses.includes(mappedStatus as TestStatusEnum)) {
    console.warn(`Invalid status mapping: "${status}" -> "${mappedStatus}". Valid statuses are: ${validStatuses.join(', ')}`);
    return status;
  }

  return mappedStatus as TestStatusEnum;
}

/**
 * Validates status mapping configuration
 * @param statusMapping - Status mapping configuration to validate
 * @returns Array of validation errors (empty if valid)
 */
export function validateStatusMapping(statusMapping: Record<string, string>): string[] {
  const errors: string[] = [];
  const validStatuses = Object.values(TestStatusEnum);

  for (const [fromStatus, toStatus] of Object.entries(statusMapping)) {
    if (!validStatuses.includes(fromStatus as TestStatusEnum)) {
      errors.push(`Invalid source status "${fromStatus}". Valid statuses are: ${validStatuses.join(', ')}`);
    }
    
    if (!validStatuses.includes(toStatus as TestStatusEnum)) {
      errors.push(`Invalid target status "${toStatus}". Valid statuses are: ${validStatuses.join(', ')}`);
    }
  }

  return errors;
}
