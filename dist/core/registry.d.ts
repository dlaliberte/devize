import { VisualizationType } from './types';

/**
 * Register a visualization type
 * @param type The visualization type to register
 */
export declare function registerType(type: VisualizationType): void;
/**
 * Get a visualization type by name
 * @param name The name of the visualization type
 * @returns The visualization type or undefined if not found
 */
export declare function getType(name: string): VisualizationType | undefined;
/**
 * Check if a visualization type is registered
 * @param name The name of the visualization type
 * @returns True if the type is registered, false otherwise
 */
export declare function hasType(name: string): boolean;
/**
 * Get all registered visualization types
 * @returns An array of all registered visualization types
 */
export declare function getAllTypes(): VisualizationType[];
/**
 * Remove a visualization type from the registry
 * @param name The name of the visualization type to remove
 * @returns True if the type was removed, false if it wasn't registered
 */
export declare function removeType(name: string): boolean;
