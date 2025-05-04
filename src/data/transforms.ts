// Data transformation functions
import { DataTransform } from '../core/types';

/**
 * Apply a filter transformation to data
 * @param data The data to filter
 * @param transform The filter transformation
 * @returns The filtered data
 */
export function applyFilter(data: any[], transform: DataTransform): any[] {
  if (!transform.test) return data;

  // Convert string test to function if needed
  let testFn: (d: any) => boolean;

  if (typeof transform.test === 'string') {
    // Use Function constructor to create a function from a string
    // eslint-disable-next-line no-new-func
    testFn = new Function('d', `return ${transform.test}`) as (d: any) => boolean;
  } else if (typeof transform.test === 'function') {
    testFn = transform.test as (d: any) => boolean;
  } else {
    return data;
  }

  return data.filter(d => testFn(d));
}

/**
 * Apply a sort transformation to data
 * @param data The data to sort
 * @param transform The sort transformation
 * @returns The sorted data
 */
export function applySort(data: any[], transform: DataTransform): any[] {
  if (!transform.field) return data;

  const field = transform.field as string;

  return [...data].sort((a, b) => {
    const aValue = a[field];
    const bValue = b[field];
    const direction = transform.order === 'descending' ? -1 : 1;
    return direction * (aValue - bValue);
  });
}

/**
 * Apply an aggregate transformation to data
 * @param data The data to aggregate
 * @param transform The aggregate transformation
 * @returns The aggregated data
 */
export function applyAggregate(data: any[], transform: DataTransform): any[] {
  if (!transform.groupBy || !transform.ops || !transform.fields) return data;

  const groupBy = transform.groupBy as string;
  const ops = Array.isArray(transform.ops) ? transform.ops : [transform.ops];
  const fields = Array.isArray(transform.fields) ? transform.fields : [transform.fields];

  // Group data by the groupBy field
  const groups: Record<string, any[]> = {};
  data.forEach(d => {
    const key = String(d[groupBy]); // Convert to string to use as object key
    if (!groups[key]) groups[key] = [];
    groups[key].push(d);
  });

  // Apply aggregation operations to each group
  return Object.entries(groups).map(([key, items]) => {
    const result: Record<string, any> = { [groupBy]: key };

    ops.forEach((op, i) => {
      const field = fields[i] as string;
      const values = items.map(d => d[field]);

      switch (op) {
        case 'sum':
          result[`sum_${field}`] = values.reduce((sum, v) => sum + v, 0);
          break;
        case 'avg':
          result[`avg_${field}`] = values.reduce((sum, v) => sum + v, 0) / values.length;
          break;
        case 'min':
          result[`min_${field}`] = Math.min(...values);
          break;
        case 'max':
          result[`max_${field}`] = Math.max(...values);
          break;
        case 'count':
          result[`count_${field}`] = values.length;
          break;
      }
    });

    return result;
  });
}

/**
 * Apply a formula transformation to data
 * @param data The data to transform
 * @param transform The formula transformation
 * @returns The transformed data
 */
export function applyFormula(data: any[], transform: DataTransform): any[] {
  if (!transform.expr || !transform.as) return data;

  let exprFn: (d: any) => any;

  if (typeof transform.expr === 'string') {
    // eslint-disable-next-line no-new-func
    exprFn = new Function('d', `return ${transform.expr}`) as (d: any) => any;
  } else if (typeof transform.expr === 'function') {
    exprFn = transform.expr as (d: any) => any;
  } else {
    return data;
  }

  return data.map(d => {
    const result = { ...d };
    result[transform.as as string] = exprFn(d);
    return result;
  });
}

/**
 * Apply a bin transformation to data
 * @param data The data to bin
 * @param transform The bin transformation
 * @returns The binned data
 */
export function applyBin(data: any[], transform: DataTransform): any[] {
  if (!transform.field || !transform.bins || !transform.as) return data;

  const field = transform.field as string;
  const bins = transform.bins;
  const asValue = transform.as;

  // Determine field names for the output
  let startField: string, endField: string, countField: string;

  if (Array.isArray(asValue)) {
    [startField, endField, countField] = asValue as string[];
  } else {
    startField = `${asValue}_start`;
    endField = `${asValue}_end`;
    countField = `${asValue}_count`;
  }

  // Find min and max values
  const values = data.map(d => d[field]);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min;
  const binWidth = range / bins;

  // Create bins
  const binCounts: Record<number, number> = {};
  for (let i = 0; i < bins; i++) {
    binCounts[i] = 0;
  }

  // Count items in each bin
  data.forEach(d => {
    const value = d[field];
    const binIndex = Math.min(Math.floor((value - min) / binWidth), bins - 1);
    binCounts[binIndex]++;
  });

  // Create result
  return Object.entries(binCounts).map(([binIndex, count]) => {
    const i = parseInt(binIndex);
    const start = min + i * binWidth;
    const end = min + (i + 1) * binWidth;

    // Create the result object with explicit property names
    const result: Record<string, any> = {};
    result[startField] = start;
    result[endField] = end;
    result[countField] = count;

    return result;
  });
}

/**
 * Apply a lookup transformation to data
 * @param data The data to transform
 * @param transform The lookup transformation
 * @returns The transformed data
 */
export function applyLookup(data: any[], transform: DataTransform): any[] {
  if (!transform.from || !transform.lookup || !transform.as) return data;

  const from = transform.from.values;
  const lookup = transform.lookup as string;
  const key = transform.from.key as string;
  const fields = Array.isArray(transform.as) ? transform.as : [transform.as];

  // Create a lookup map for faster access
  const lookupMap = new Map();
  from.forEach(item => {
    lookupMap.set(item[key], item);
  });

  // Apply the lookup to each data item
  return data.map(d => {
    const result = { ...d };
    const lookupValue = d[lookup];
    const lookupItem = lookupMap.get(lookupValue);

    if (lookupItem) {
      if (fields.length === 1 && fields[0] === '*') {
        // Copy all fields from the lookup item
        Object.entries(lookupItem).forEach(([k, v]) => {
          if (k !== key) {
            result[k] = v;
          }
        });
      } else {
        // Copy only the specified fields
        fields.forEach(field => {
          if (typeof field === 'string') {
            result[field] = lookupItem[field];
          } else if (typeof field === 'object' && field !== null) {
            // Handle field mapping with source and target
            // We need to use type assertion here because TypeScript doesn't know the shape
            const fieldObj = field as any;
            if ('source' in fieldObj && 'target' in fieldObj) {
              const source = fieldObj.source as string;
              const target = fieldObj.target as string;
              result[target] = lookupItem[source];
            }
          }
        });
      }
    }

    return result;
  });
}

/**
 * Apply a stack transformation to data
 * @param data The data to transform
 * @param transform The stack transformation
 * @returns The transformed data
 */
export function applyStack(data: any[], transform: DataTransform): any[] {
  if (!transform.groupBy || !transform.field || !transform.as) return data;

  const groupBy = transform.groupBy as string;
  const field = transform.field as string;

  // Determine field names for the output
  let startField: string, endField: string;

  if (Array.isArray(transform.as)) {
    [startField, endField] = transform.as as string[];
  } else {
    startField = `${transform.as}_start`;
    endField = `${transform.as}_end`;
  }

  const offset = transform.offset || 'zero';

  // Group data by the groupBy field
  const groups = new Map<string, any[]>();
  data.forEach(d => {
    const key = String(d[groupBy]);
    if (!groups.has(key)) {
      groups.set(key, []);
    }
    groups.get(key)!.push(d);
  });

  // Apply stacking to each group
  groups.forEach(items => {
    let sum = 0;
    items.forEach(item => {
      const value = item[field] || 0;

      if (offset === 'zero') {
        // Simple stacking from zero
        item[startField] = sum;
        sum += value;
        item[endField] = sum;
      } else if (offset === 'normalize') {
        // We'll need to calculate the total first
        const total = items.reduce((acc, d) => acc + (d[field] || 0), 0);
        if (total === 0) {
          item[startField] = 0;
          item[endField] = 0;
        } else {
          item[startField] = sum;
          sum += value / total;
          item[endField] = sum;
        }
      } else if (offset === 'center') {
        // Center the stacks
        const total = items.reduce((acc, d) => acc + (d[field] || 0), 0);
        const start = -total / 2;
        item[startField] = start + sum;
        sum += value;
        item[endField] = start + sum;
      }
    });
  });

  return data;
}

/**
 * Apply a window transformation to data
 * @param data The data to transform
 * @param transform The window transformation
 * @returns The transformed data
 */
export function applyWindow(data: any[], transform: DataTransform): any[] {
  if (!transform.ops || !transform.fields || !transform.as) return data;

  const ops = Array.isArray(transform.ops) ? transform.ops : [transform.ops];
  const fields = Array.isArray(transform.fields) ? transform.fields : [transform.fields];
  const as = Array.isArray(transform.as) ? transform.as : [transform.as];
  const frame = transform.frame || [null, 0];
  const groupBy = transform.groupBy;

  // Group data if groupBy is specified
  let groups: any[][] = [data];
  if (groupBy) {
    const groupMap = new Map<string, any[]>();
    data.forEach(d => {
      const key = Array.isArray(groupBy)
        ? groupBy.map(g => d[g]).join('|')
        : d[groupBy];

      if (!groupMap.has(key)) {
        groupMap.set(key, []);
      }
      groupMap.get(key)!.push(d);
    });
    groups = Array.from(groupMap.values());
  }

  // Apply window operations to each group
  groups.forEach(group => {
    ops.forEach((op, i) => {
      const field = fields[i];
      const outputField = as[i];

      group.forEach((d, idx) => {
        // Determine window bounds
        const start = frame[0] === null ? 0 : Math.max(0, idx + (frame[0] as number));
        const end = frame[1] === null ? group.length - 1 : Math.min(group.length - 1, idx + (frame[1] as number));

        // Get values in the window
        const windowValues = group.slice(start, end + 1).map(item => item[field]);

        // Apply the operation
        switch (op) {
          case 'sum':
            d[outputField] = windowValues.reduce((sum, v) => sum + v, 0);
            break;
          case 'avg':
            d[outputField] = windowValues.reduce((sum, v) => sum + v, 0) / windowValues.length;
            break;
          case 'min':
            d[outputField] = Math.min(...windowValues);
            break;
          case 'max':
            d[outputField] = Math.max(...windowValues);
            break;
          case 'count':
            d[outputField] = windowValues.length;
            break;
          case 'rank':
            // Sort values in descending order and find the position of the current value
            const sorted = [...windowValues].sort((a, b) => b - a);
            d[outputField] = sorted.indexOf(d[field]) + 1;
            break;
          case 'lead':
            d[outputField] = idx < group.length - 1 ? group[idx + 1][field] : null;
            break;
          case 'lag':
            d[outputField] = idx > 0 ? group[idx - 1][field] : null;
            break;
        }
      });
    });
  });

  return data;
}

/**
 * Apply a transformation to data
 * @param data The data to transform
 * @param transform The transformation to apply
 * @returns The transformed data
 */
export function applyTransform(data: any[], transform: DataTransform): any[] {
  if (!transform || !transform.type) return data;

  switch (transform.type) {
    case 'filter':
      return applyFilter(data, transform);
    case 'sort':
      return applySort(data, transform);
    case 'aggregate':
      return applyAggregate(data, transform);
    case 'formula':
      return applyFormula(data, transform);
    case 'bin':
      return applyBin(data, transform);
    case 'lookup':
      return applyLookup(data, transform);
    case 'stack':
      return applyStack(data, transform);
    default:
      console.warn(`Unknown transform type: ${transform.type}`);
      return data;
  }
}

/**
 * Apply multiple transformations to data
 * @param data The data to transform
 * @param transforms The transformations to apply
 * @returns The transformed data
 */
export function applyTransforms(data: any[], transforms: DataTransform[]): any[] {
  if (!transforms || !Array.isArray(transforms) || transforms.length === 0) {
    return data;
  }

  let result = [...data];
  for (const transform of transforms) {
    result = applyTransform(result, transform);
  }
  return result;
}
