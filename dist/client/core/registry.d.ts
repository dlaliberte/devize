import { VisualizationType } from './types';

/**
 * Register a visualization type
 * @param type The visualization type to register
 */
export declare function registerType(type: VisualizationType): void;
/**
 * Check if a visualization type is registered
 * @param name The name of the visualization type
 * @returns Whether the type is registered
 */
export declare function hasType(name: string): boolean;
/**
 * Get a visualization type by name
 * @param name The name of the visualization type
 * @returns The visualization type or undefined if not found
 */
export declare function getType(name: string): VisualizationType | undefined;
/**
 * Get all registered visualization types
 * @returns All registered visualization types
 */
export declare function getAllTypes(): VisualizationType[];
