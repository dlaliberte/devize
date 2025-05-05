import { createViz } from '../../../src/core/devize';
import '../../../src/components/data/dataExtract';

describe('dataExtract Component', () => {
  test('should extract values from data array', () => {
    const testData = [
      { id: 1, name: 'Item 1', value: 100 },
      { id: 2, name: 'Item 2', value: 200 },
      { id: 3, name: 'Item 3', value: 300 }
    ];

    const result = createViz({
      type: 'dataExtract',
      data: testData,
      field: 'value',
      as: 'extractedValues'
    });

    console.log('dataExtract result:', JSON.stringify(result, null, 2));

    expect(result).toBeDefined();
    expect(result.spec).toBeDefined();

    // The extracted values should be in the result.spec.extractedValues
    expect(result.spec.extractedValues).toEqual([100, 200, 300]);
  });

  test('should use default output property name', () => {
    const testData = [
      { id: 1, name: 'Item 1', value: 100 },
      { id: 2, name: 'Item 2', value: 200 }
    ];

    const result = createViz({
      type: 'dataExtract',
      data: testData,
      field: 'name'
    });

    expect(result).toBeDefined();
    expect(result.spec).toBeDefined();

    // The default property name is 'values'
    expect(result.spec.values).toEqual(['Item 1', 'Item 2']);
  });

  test('should handle empty data array', () => {
    const result = createViz({
      type: 'dataExtract',
      data: [],
      field: 'value'
    });

    expect(result).toBeDefined();
    expect(result.spec).toBeDefined();
    expect(result.spec.values).toEqual([]);
  });

  test('should handle non-array data', () => {
    const result = createViz({
      type: 'dataExtract',
      data: null,
      field: 'value'
    });

    expect(result).toBeDefined();
    expect(result.spec).toBeDefined();
    expect(result.spec.values).toEqual([]);
  });
});
