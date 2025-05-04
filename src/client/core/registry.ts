import { VisualizationType } from './types';

// Registry to store visualization types
const typeRegistry: Map<string, VisualizationType> = new Map();

/**
 * Register a visualization type
 * @param type The visualization type to register
 */
export function registerType(type: VisualizationType): void {
  if (typeRegistry.has(type.name)) {
    console.warn(`Visualization type '${type.name}' is already registered. Overwriting.`);
  }
  typeRegistry.set(type.name, type);
}

/**
 * Check if a visualization type is registered
 * @param name The name of the visualization type
 * @returns Whether the type is registered
 */
export function hasType(name: string): boolean {
  return typeRegistry.has(name);
}

/**
 * Get a visualization type by name
 * @param name The name of the visualization type
 * @returns The visualization type or undefined if not found
 */
export function getType(name: string): VisualizationType | undefined {
  return typeRegistry.get(name);
}

/**
 * Get all registered visualization types
 * @returns All registered visualization types
 */
export function getAllTypes(): VisualizationType[] {
  return Array.from(typeRegistry.values());
}
