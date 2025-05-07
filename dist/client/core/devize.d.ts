import { VizSpec, VizInstance } from './types';

/**
 * Create a visualization from a spec
 * @param spec The visualization specification
 * @param container The container element
 * @returns The visualization instance
 */
export declare function buildViz(spec: VizSpec, container: HTMLElement): Promise<VizInstance>;
/**
 * Update a visualization
 * @param vizInstance The visualization instance to update
 * @param newSpec The new specification
 * @returns The updated visualization instance
 */
export declare function updateViz(vizInstance: VizInstance, newSpec: VizSpec): Promise<VizInstance>;
export declare function render3DViz(spec: VizSpec, container: HTMLElement): VizInstance;
