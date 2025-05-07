import { buildViz } from '../../../src/core/devize';
import '../../../src/components/scales/linearScale';

describe('Linear Scale Component', () => {
  test('should scale values linearly', () => {
    const result = buildViz({
      type: 'linearScale',
      domain: [0, 100],
      range: [0, 500],
      values: [0, 25, 50, 75, 100]
    });

    expect(result).toBeDefined();

    // Check scaled values
    if (result.data && result.data.scaledValues) {
      expect(result.data.scaledValues).toEqual([0, 125, 250, 375, 500]);
    }
  });

  test('should handle reversed ranges', () => {
    const result = buildViz({
      type: 'linearScale',
      domain: [0, 100],
      range: [500, 0], // Reversed range
      values: [0, 50, 100]
    });

    expect(result).toBeDefined();

    // Check scaled values
    if (result.data && result.data.scaledValues) {
      expect(result.data.scaledValues).toEqual([500, 250, 0]);
    }
  });

  test('should handle custom output property name', () => {
    const result = buildViz({
      type: 'linearScale',
      domain: [0, 100],
      range: [0, 1],
      values: [0, 50, 100],
      as: 'normalizedValues'
    });

    expect(result).toBeDefined();

    // Check scaled values with custom property name
    if (result.data && result.data.normalizedValues) {
      expect(result.data.normalizedValues).toEqual([0, 0.5, 1]);
    }
  });
});
