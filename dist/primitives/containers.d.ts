import { VizSpec, VizInstance } from '../core/types';

/**
 * Create a group
 * @param spec The group specification
 * @param container The container element
 * @returns The group instance
 */
export declare function createGroup(spec: VizSpec, container: HTMLElement): VizInstance;
/**
 * Create a data map
 * @param spec The data map specification
 * @param container The container element
 * @returns The data map instance
 */
export declare function createDataMap(spec: VizSpec, container: HTMLElement): VizInstance;
