import { TypeDefinition, Registry } from './types';

/**
 * Registry for visualization types
 */
export class TypeRegistry implements Registry {
  private types: Map<string, TypeDefinition> = new Map();

  // Normal registration through define
  registerType(type: TypeDefinition): void {
    this.types.set(type.name, type);
  }

  // Direct registration for bootstrapping
  registerTypeDirectly(spec: any): void {
    const type: TypeDefinition = {
      name: spec.name,
      properties: spec.properties,
      implementation: spec.implementation,
      extend: spec.extend
    };
    this.types.set(type.name, type);
  }

  hasType(name: string): boolean {
    return this.types.has(name);
  }

  getType(name: string): TypeDefinition | undefined {
    return this.types.get(name);
  }

  getAllTypes(): Record<string, TypeDefinition> {
    const result: Record<string, TypeDefinition> = {};
    this.types.forEach((value, key) => {
      result[key] = value;
    });
    return result;
  }
}

// Singleton instance
export const registry = new TypeRegistry();

// Export for convenience
export const registerType = registry.registerType.bind(registry);
export const hasType = registry.hasType.bind(registry);
export const getType = registry.getType.bind(registry);
export const getAllTypes = registry.getAllTypes.bind(registry);
