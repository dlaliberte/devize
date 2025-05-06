// Registry for visualization types
import { VisualizationType } from './types';

console.log('Registry module initializing');
const typeRegistry: Record<string, VisualizationType> = {};

/**
 * Register a visualization type
 * @param type The visualization type to register
 */
export function registerType(type: VisualizationType): void {
  if (!type || typeof type !== 'object') {
    console.error('Invalid visualization type provided to registerType');
    return;
  }

  if (!type.name || typeof type.name !== 'string') {
    console.error('Visualization type must have a valid name');
    return;
  }

  if (!type.decompose || typeof type.decompose !== 'function') {
    console.error(`Visualization type '${type.name}' must have a decompose function`);
    return;
  }

  console.log(`Registering visualization type: ${type.name}`);
  if (typeRegistry[type.name]) {
    console.warn(`Visualization type '${type.name}' is already registered. It will be overwritten.`);
  }
  typeRegistry[type.name] = type;
  console.log(`Current registry contains: ${Object.keys(typeRegistry).join(', ')}`);
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

/**
 * Reset the registry - for testing purposes only
 * @internal This function should only be used in tests
 */
export function _resetRegistryForTesting(): void {
  Object.keys(typeRegistry).forEach(key => {
    delete typeRegistry[key];
  });
}
