import { VizSpec } from '../core/types';

/**
 * Extract data from various sources
 * @param spec The visualization specification
 * @returns The extracted data
 */
export declare function extractData(spec: VizSpec): Promise<any[]>;
/**
 * Register a named dataset
 * @param name The name of the dataset
 * @param data The data to register
 */
export declare function registerData(name: string, data: any[]): void;
/**
 * Get a named dataset
 * @param name The name of the dataset
 * @returns The dataset or undefined if not found
 */
export declare function getData(name: string): any[] | undefined;
/**
 * Load data from a URL with a specified format
 * @param url The URL to load data from
 * @param format The format of the data (json, csv, etc.)
 * @returns The loaded data
 */
export declare function loadData(url: string, format?: string): Promise<any[]>;
