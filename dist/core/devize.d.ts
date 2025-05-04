import { VizSpec, VizInstance } from './types';

/**
 * Create a visualization from a spec
 * @param spec The visualization specification
 * @param container The container element
 * @returns The visualization instance
 */
export declare function createViz(spec: VizSpec, container: HTMLElement): VizInstance;
/**
 * Update a visualization
 * @param vizInstance The visualization instance to update
 * @param newSpec The new specification
 * @returns The updated visualization instance
 */
export declare function updateViz(vizInstance: VizInstance, newSpec: VizSpec): VizInstance;
/**
 * Helper function to ensure an SVG element exists
 * @param container The container element
 * @returns The SVG element
 */
export declare function ensureSvg(container: HTMLElement): SVGElement;
