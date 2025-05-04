import { VizSpec } from '../core/types';

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
  } else if (spec.data.type === 'csv') {
    // CSV source
    return parseCSV(spec.data.url || spec.data.content);
  } else if (spec.data.type === 'json') {
    // JSON source
    return parseJSON(spec.data.url || spec.data.content);
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
