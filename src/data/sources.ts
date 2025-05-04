import { VizSpec, DataSource } from '../core/types';

// Data registry to store named datasets
const dataRegistry: Map<string, any[]> = new Map();

/**
 * Extract data from various sources
 * @param spec The visualization specification
 * @returns The extracted data
 */
export async function extractData(spec: VizSpec): Promise<any[]> {
  if (!spec.data) {
    return [];
  }

  if (typeof spec.data === 'string') {
    // URL source
    return fetchData(spec.data);
  } else if (Array.isArray(spec.data)) {
    // Data is already an array
    return spec.data;
  } else if (typeof spec.data === 'object') {
    const dataSource = spec.data as DataSource;

    if (dataSource.type === 'csv') {
      // CSV source
      return parseCSV(dataSource.url || dataSource.content?.toString() || '');
    } else if (dataSource.type === 'json') {
      // JSON source
      return parseJSON(dataSource.url || dataSource.content || '');
    } else if (dataSource.type === 'reference') {
      // Reference to a named dataset
      if (typeof dataSource.name === 'string') {
        return getData(dataSource.name) || [];
      }
      return [];
    } else if (dataSource.type === 'remote') {
      // Remote data with format specification
      if (typeof dataSource.url === 'string') {
        return await loadData(dataSource.url, dataSource.format || 'json');
      }
      return [];
    }
  }

  return [];
}

async function fetchData(url: string): Promise<any[]> {
  try {
    const response = await fetch(url);
    const contentType = response.headers.get('content-type');

    if (contentType?.includes('application/json')) {
      return await response.json();
    } else if (contentType?.includes('text/csv')) {
      const text = await response.text();
      return parseCSV(text);
    } else {
      return [];
    }
  } catch (error) {
    console.error('Error fetching data:', error);
    return [];
  }
}

function parseCSV(source: string): any[] {
  // Simple CSV parser for now
  if (!source) return [];

  const lines = source.split('\n');
  if (lines.length < 2) return [];

  const headers = lines[0].split(',').map(h => h.trim());
  const result = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const values = line.split(',').map(v => v.trim());
    const item: Record<string, any> = {};

    headers.forEach((header, index) => {
      const value = values[index];
      // Try to convert to number if possible
      item[header] = isNaN(Number(value)) ? value : Number(value);
    });

    result.push(item);
  }

  return result;
}

function parseJSON(source: string | object): any[] {
  if (typeof source === 'string') {
    try {
      return JSON.parse(source);
    } catch (error) {
      console.error('Error parsing JSON:', error);
      return [];
    }
  } else if (Array.isArray(source)) {
    return source;
  } else if (typeof source === 'object' && source !== null) {
    // Handle object with data property
    return (source as any).data || [];
  }

  return [];
}

/**
 * Register a named dataset
 * @param name The name of the dataset
 * @param data The data to register
 */
export function registerData(name: string, data: any[]): void {
  dataRegistry.set(name, data);
}

/**
 * Get a named dataset
 * @param name The name of the dataset
 * @returns The dataset or undefined if not found
 */
export function getData(name: string): any[] | undefined {
  return dataRegistry.get(name);
}

/**
 * Load data from a URL with a specified format
 * @param url The URL to load data from
 * @param format The format of the data (json, csv, etc.)
 * @returns The loaded data
 */
export async function loadData(url: string, format: string = 'json'): Promise<any[]> {
  try {
    const response = await fetch(url);

    if (format === 'json') {
      return await response.json();
    } else if (format === 'csv') {
      const text = await response.text();
      return parseCSV(text);
    } else {
      console.warn(`Unsupported format: ${format}`);
      return [];
    }
  } catch (error) {
    console.error('Error loading data:', error);
    return [];
  }
}

// Register some example data
const timeSeriesData: any[] = [
  { date: '2023-01-01', value: 10 },
  { date: '2023-01-02', value: 15 },
  { date: '2023-01-03', value: 13 },
  { date: '2023-01-04', value: 17 },
  { date: '2023-01-05', value: 20 },
  { date: '2023-01-06', value: 22 },
  { date: '2023-01-07', value: 25 }
];

registerData('timeSeriesData', timeSeriesData);
