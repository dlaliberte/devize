import { VizSpec, VizInstance } from '../core/types';

/**
 * Register the scatterPlot visualization type
 */
export declare function registerScatterPlotType(): void;
/**
 * Create a scatter plot
 * @param spec The scatter plot specification
 * @param container The container element
 * @returns The scatter plot instance
 */
export declare function createScatterPlot(spec: VizSpec, container: HTMLElement): VizInstance;
