import { DataTransform } from '../core/types';

/**
 * Apply a filter transformation to data
 * @param data The data to filter
 * @param transform The filter transformation
 * @returns The filtered data
 */
export declare function applyFilter(data: any[], transform: DataTransform): any[];
/**
 * Apply a sort transformation to data
 * @param data The data to sort
 * @param transform The sort transformation
 * @returns The sorted data
 */
export declare function applySort(data: any[], transform: DataTransform): any[];
/**
 * Apply an aggregate transformation to data
 * @param data The data to aggregate
 * @param transform The aggregate transformation
 * @returns The aggregated data
 */
export declare function applyAggregate(data: any[], transform: DataTransform): any[];
/**
 * Apply a formula transformation to data
 * @param data The data to transform
 * @param transform The formula transformation
 * @returns The transformed data
 */
export declare function applyFormula(data: any[], transform: DataTransform): any[];
/**
 * Apply a bin transformation to data
 * @param data The data to bin
 * @param transform The bin transformation
 * @returns The binned data
 */
export declare function applyBin(data: any[], transform: DataTransform): any[];
/**
 * Apply a lookup transformation to data
 * @param data The data to transform
 * @param transform The lookup transformation
 * @returns The transformed data
 */
export declare function applyLookup(data: any[], transform: DataTransform): any[];
/**
 * Apply a stack transformation to data
 * @param data The data to transform
 * @param transform The stack transformation
 * @returns The transformed data
 */
export declare function applyStack(data: any[], transform: DataTransform): any[];
/**
 * Apply a window transformation to data
 * @param data The data to transform
 * @param transform The window transformation
 * @returns The transformed data
 */
export declare function applyWindow(data: any[], transform: DataTransform): any[];
/**
 * Apply a transformation to data
 * @param data The data to transform
 * @param transform The transformation to apply
 * @returns The transformed data
 */
export declare function applyTransform(data: any[], transform: DataTransform): any[];
/**
 * Apply multiple transformations to data
 * @param data The data to transform
 * @param transforms The transformations to apply
 * @returns The transformed data
 */
export declare function applyTransforms(data: any[], transforms: DataTransform[]): any[];
