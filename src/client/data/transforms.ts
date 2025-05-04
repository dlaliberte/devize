/**
 * Apply data transformations
 * @param data The input data
 * @param transforms The transformations to apply
 * @returns The transformed data
 */
export function applyTransforms(data: any[], transforms: any[]): any[] {
  let result = [...data];

  for (const transform of transforms) {
    switch (transform.type) {
      case 'filter':
        result = applyFilter(result, transform);
        break;
      case 'aggregate':
        result = applyAggregate(result, transform);
        break;
      case 'sort':
        result = applySort(result, transform);
        break;
      default:
        console.warn(`Unknown transform type: ${transform.type}`);
    }
  }

  return result;
}

function applyFilter(data: any[], transform: any): any[] {
  // Simple implementation for now
  if (transform.field && transform.value) {
    return data.filter(item => item[transform.field] === transform.value);
  }
  return data;
}

function applyAggregate(data: any[], _transform: any): any[] {
  // Placeholder for aggregation
  return data;
}

function applySort(data: any[], transform: any): any[] {
  if (transform.field) {
    return [...data].sort((a, b) => {
      const aValue = a[transform.field];
      const bValue = b[transform.field];

      if (transform.order === 'desc') {
        return bValue > aValue ? 1 : -1;
      }
      return aValue > bValue ? 1 : -1;
    });
  }
  return data;
}
