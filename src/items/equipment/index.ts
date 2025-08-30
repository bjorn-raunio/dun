// Export all equipment-related types and interfaces
export * from './validation';

// Export the combat calculator
export { CombatCalculator } from './combat';

// Export the core equipment system
export { EquipmentSystem } from './system';

// Export the equipment manager for creatures
export { EquipmentManager } from './manager';

// Re-export commonly used types for backward compatibility
export type { EquipmentSlot, EquipmentSlots, EquipmentValidation } from './validation';
