import { VizSpec, VizInstance } from '../core/types';

/**
 * Create a rectangle
 * @param spec The rectangle specification
 * @param container The container element
 * @returns The rectangle instance
 */
export declare function createRectangle(spec: VizSpec, container: HTMLElement): VizInstance;
/**
 * Create a circle
 * @param spec The circle specification
 * @param container The container element
 * @returns The circle instance
 */
export declare function createCircle(spec: VizSpec, container: HTMLElement): VizInstance;
/**
 * Create a line
 * @param spec The line specification
 * @param container The container element
 * @returns The line instance
 */
export declare function createLine(spec: VizSpec, container: HTMLElement): VizInstance;
/**
 * Create a text element
 * @param spec The text specification
 * @param container The container element
 * @returns The text instance
 */
export declare function createText(spec: VizSpec, container: HTMLElement): VizInstance;
/**
 * Create a path
 * @param spec The path specification
 * @param container The container element
 * @returns The path instance
 */
export declare function createPath(spec: VizSpec, container: HTMLElement): VizInstance;
