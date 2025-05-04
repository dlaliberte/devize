import { VizSpec, VizInstance } from '../core/types';

/**
 * Register the barChart visualization type
 */
export declare function registerBarChartType(): void;
/**
 * Create a bar chart
 * @param spec The bar chart specification
 * @param container The container element
 * @returns The bar chart instance
 */
export declare function createBarChart(spec: VizSpec, container: HTMLElement): VizInstance;
