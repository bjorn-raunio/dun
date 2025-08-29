import { BaseValidationResult } from '../utils/types';

export interface ValidationResult extends BaseValidationResult {}
export interface ValidationResultWithData<T = any> extends ValidationResult { data?: T; }

/**
 * Chain multiple validation results together
 * Returns the first failure, or success if all pass
 */
export function chainValidations(...validations: ValidationResult[]): ValidationResult {
  for (const validation of validations) {
    if (!validation.isValid) {
      return validation;
    }
  }
  return { isValid: true };
}

/**
 * Create a successful validation result
 */
export function createSuccessResult<T = any>(data?: T): ValidationResultWithData<T> {
  return { isValid: true, data };
}

/**
 * Create a failed validation result
 */
export function createFailureResult(reason: string): ValidationResult {
  return { isValid: false, reason };
}

/**
 * Validate a condition
 */
export function validateCondition(condition: boolean, name: string, conditionDescription: string): ValidationResult {
  if (!condition) {
    return {
      isValid: false,
      reason: `Condition failed for ${name}: ${conditionDescription}`
    };
  }
  return { isValid: true };
}

/**
 * Validate that a value is not null or undefined
 */
export function validateNotNull(value: any, name: string, field: string): ValidationResult {
  if (value == null) {
    return {
      isValid: false,
      reason: `Value is null or undefined for ${name}.${field}`
    };
  }
  return { isValid: true };
}

/**
 * Validate that an array is not empty
 */
export function validateArrayNotEmpty(array: any[], name: string, field: string): ValidationResult {
  if (!array || array.length === 0) {
    return {
      isValid: false,
      reason: `Array is empty for ${name}.${field}`
    };
  }
  return { isValid: true };
}

/**
 * Validate that an array has no duplicate values
 */
export function validateArrayNoDuplicates(array: any[], name: string, field: string): ValidationResult {
  const uniqueValues = new Set(array);
  if (uniqueValues.size !== array.length) {
    return {
      isValid: false,
      reason: `Array has duplicate values for ${name}.${field}`
    };
  }
  return { isValid: true };
}

/**
 * Validate that a value is within a range
 */
export function validateRange(value: number, min: number, max: number, name: string, field: string): ValidationResult {
  if (value < min || value > max) {
    return {
      isValid: false,
      reason: `Value out of range for ${name}.${field}: ${value} (should be ${min}-${max})`
    };
  }
  return { isValid: true };
}

/**
 * Validate that a value is non-negative
 */
export function validateNonNegative(value: number, name: string, field: string): ValidationResult {
  if (value < 0) {
    return {
      isValid: false,
      reason: `Value is negative for ${name}.${field}: ${value}`
    };
  }
  return { isValid: true };
}

/**
 * Validate that a value does not exceed a maximum
 */
export function validateNotExceeding(value: number, max: number, name: string, field: string): ValidationResult {
  if (value > max) {
    return {
      isValid: false,
      reason: `Value exceeds maximum for ${name}.${field}: ${value} > ${max}`
    };
  }
  return { isValid: true };
}
