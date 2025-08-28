// --- Shared Result Types ---

/**
 * Base result interface for operations that can succeed or fail
 */
export interface BaseResult {
  success: boolean;
  message?: string;
}

/**
 * Base validation result interface
 */
export interface BaseValidationResult {
  isValid: boolean;
  reason?: string;
}

/**
 * Base operation result with optional data
 */
export interface OperationResult<T = void> extends BaseResult {
  data?: T;
}

/**
 * Base validation result with optional data
 */
export interface ValidationResult<T = void> extends BaseValidationResult {
  data?: T;
}
