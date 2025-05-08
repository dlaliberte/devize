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

// Export convenience functions
export const registerType = (type: TypeDefinition): void => registry.registerType(type);
export const hasType = (name: string): boolean => registry.hasType(name);
export const getType = (name: string): TypeDefinition | undefined => registry.getType(name);
export const getAllTypes = (): Record<string, TypeDefinition> => registry.getAllTypes();
