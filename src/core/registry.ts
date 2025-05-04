// Registry for visualization types
import { VisualizationType } from './types';

const typeRegistry: Record<string, VisualizationType> = {};

/**
 * Register a visualization type
 * @param type The visualization type to register
 */
export function registerType(type: VisualizationType): void {
  if (typeRegistry[type.name]) {
    console.warn(`Visualization type '${type.name}' is already registered. It will be overwritten.`);
  }
  typeRegistry[type.name] = type;
}

/**
 * Get a visualization type by name
 * @param name The name of the visualization type
 * @returns The visualization type or undefined if not found
 */
export function getType(name: string): VisualizationType | undefined {
  return typeRegistry[name];
}

/**
 * Check if a visualization type is registered
 * @param name The name of the visualization type
 * @returns True if the type is registered, false otherwise
 */
export function hasType(name: string): boolean {
  return !!typeRegistry[name];
}

/**
 * Get all registered visualization types
 * @returns An array of all registered visualization types
 */
export function getAllTypes(): VisualizationType[] {
  return Object.values(typeRegistry);
}

/**
 * Remove a visualization type from the registry
 * @param name The name of the visualization type to remove
 * @returns True if the type was removed, false if it wasn't registered
 */
export function removeType(name: string): boolean {
  if (!typeRegistry[name]) {
    return false;
  }
  delete typeRegistry[name];
  return true;
}
