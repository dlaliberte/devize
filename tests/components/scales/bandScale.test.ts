import { buildViz } from '../../../src/core/devize';
import '../../../src/components/scales/bandScale';

describe('Band Scale Component', () => {
  test('should map domain values to range values with proper bandwidth', () => {
    const result = buildViz({
      type: 'bandScale',
      domain: ['A', 'B', 'C', 'D'],
      range: [0, 300],
      padding: 0.2,
      as: 'testScale'
    });

    expect(result).toBeDefined();
    expect(result.data).toBeDefined();

    const scale = result.data.testScale;
    expect(scale).toBeDefined();
    expect(scale.scale).toBeInstanceOf(Function);
    expect(scale.bandwidth).toBeInstanceOf(Function);

    const bandwidth = scale.bandwidth();
    const posA = scale.scale('A');
    const posB = scale.scale('B');
    const posC = scale.scale('C');
    const posD = scale.scale('D');

    // Check that bands have equal width
    expect(bandwidth).toBeGreaterThan(0);

    // Check that bands are evenly spaced
    const step = posB - posA;
    expect(posC - posB).toBeCloseTo(step);
    expect(posD - posC).toBeCloseTo(step);

    // Check that the total width is correct
    // With padding 0.2, the total width should be:
    // 4 bands + 3 inner paddings of 0.2*bandwidth + 2 outer paddings of 0.2*bandwidth
    // = 4*bandwidth + 3*0.2*bandwidth + 2*0.2*bandwidth
    // = 4*bandwidth + 0.2*bandwidth*(3+2)
    // = 4*bandwidth + bandwidth
    // = 5*bandwidth
    // So bandwidth should be 300/5 = 60
    expect(bandwidth).toBeCloseTo(300/5);

    // Check that the first band starts at the correct position
    // First band should start at: 0 + outerPadding = 0 + 0.2*bandwidth = 0.2*60 = 12
    expect(posA).toBeCloseTo(0.2 * bandwidth);

    // Check that the last band ends at the correct position
    // Last band should end at: posD + bandwidth = 300 - outerPadding = 300 - 0.2*bandwidth = 300 - 0.2*60 = 288
    expect(posD + bandwidth).toBeCloseTo(300 - 0.2 * bandwidth);
  });

  test('should handle different padding values', () => {
    const result = buildViz({
      type: 'bandScale',
      domain: ['A', 'B', 'C'],
      range: [0, 300],
      padding: 0.5,
      as: 'testScale'
    });

    const scale = result.data.testScale;
    const bandwidth = scale.bandwidth();
    const posA = scale.scale('A');
    const posB = scale.scale('B');
    const posC = scale.scale('C');

    // Check that bands have equal width
    expect(bandwidth).toBeGreaterThan(0);

    // Check that bands are evenly spaced
    const step = posB - posA;
    expect(posC - posB).toBeCloseTo(step);

    // With padding 0.5, the total width should be:
    // 3 bands + 2 inner paddings of 0.5*bandwidth + 2 outer paddings of 0.5*bandwidth
    // = 3*bandwidth + 2*0.5*bandwidth + 2*0.5*bandwidth
    // = 3*bandwidth + 0.5*bandwidth*4
    // = 3*bandwidth + 2*bandwidth
    // = 5*bandwidth
    // So bandwidth should be 300/5 = 60
    expect(bandwidth).toBeCloseTo(300/5);

    // First band should start at: 0 + outerPadding = 0 + 0.5*bandwidth = 0.5*60 = 30
    expect(posA).toBeCloseTo(0.5 * bandwidth);

    // Last band should end at: posC + bandwidth = 300 - outerPadding = 300 - 0.5*bandwidth = 300 - 0.5*60 = 270
    expect(posC + bandwidth).toBeCloseTo(300 - 0.5 * bandwidth);
  });

  test('should handle paddingInner and paddingOuter separately', () => {
    const result = buildViz({
      type: 'bandScale',
      domain: ['A', 'B', 'C'],
      range: [0, 300],
      paddingInner: 0.2,
      paddingOuter: 0.1,
      as: 'testScale'
    });

    const scale = result.data.testScale;
    const bandwidth = scale.bandwidth();
    const posA = scale.scale('A');
    const posB = scale.scale('B');
    const posC = scale.scale('C');

    // Check that bands have equal width
    expect(bandwidth).toBeGreaterThan(0);

    // Check that bands are evenly spaced
    const step = posB - posA;
    expect(posC - posB).toBeCloseTo(step);

    // With paddingInner 0.2 and paddingOuter 0.1, the total width should be:
    // 3 bands + 2 inner paddings of 0.2*bandwidth + 2 outer paddings of 0.1*bandwidth
    // = 3*bandwidth + 2*0.2*bandwidth + 2*0.1*bandwidth
    // = 3*bandwidth + 0.4*bandwidth + 0.2*bandwidth
    // = 3*bandwidth + 0.6*bandwidth
    // = 3.6*bandwidth
    // So bandwidth should be 300/3.6 = 83.33...
    expect(bandwidth).toBeCloseTo(300/3.6);

    // First band should start at: 0 + outerPadding = 0 + 0.1*bandwidth = 0.1*83.33 = 8.33
    expect(posA).toBeCloseTo(0.1 * bandwidth);

    // Last band should end at: posC + bandwidth = 300 - outerPadding = 300 - 0.1*bandwidth = 300 - 0.1*83.33 = 291.67
    expect(posC + bandwidth).toBeCloseTo(300 - 0.1 * bandwidth);
  });

  test('should handle empty domain', () => {
    const result = buildViz({
      type: 'bandScale',
      domain: [],
      range: [0, 300],
      padding: 0.2,
      as: 'testScale'
    });

    const scale = result.data.testScale;

    // With empty domain, bandwidth should be 0
    expect(scale.bandwidth()).toBe(0);

    // Scale function function return NaN for any input
    expect(isNaN(scale.scale('anything'))).toBe(true);
  });

  test('should handle single value domain', () => {
    const result = buildViz({
      type: 'bandScale',
      domain: ['A'],
      range: [0, 300],
      padding: 0.2,
      as: 'testScale'
    });

    const scale = result.data.testScale;
    const bandwidth = scale.bandwidth();
    const posA = scale.scale('A');

    // With a single value, bandwidth should be:
    // 300 / /1 + 2*0.2) = 300 / 1.4 = 214.29
    expect(bandwidth).toBeCloseTo(300 / 1.4);

    // Position should be at outerPadding
    expect(posA).toBeCloseTo(0.2 * bandwidth);

    // End position should be at range end minus outerPadding
    expect(posA + bandwidth).toBeCloseTo(300 - 0.2 * bandwidth);
  });

  test('should return NaN for values not in domain', () => {
    const result = buildViz({
      type: 'bandScale',
      domain: ['A', 'B', 'C'],
      range: [0, 300],
      padding: 0.2,
      as: 'testScale'
    });

    const scale = result.spec.testScale;

    // Scale function should return NaN for values not in domain
    expect(isNaN(scale.scale('D'))).toBe(true);
    expect(isNaN(scale.scale(42))).toBe(true);
    expect(isNaN(scale.scale(null))).toBe(true);
  });

  test('should provide ticks method that returns domain values', () => {
    const result = buildViz({
      type: 'bandScale',
      domain: ['A', 'B', 'C'],
      range: [0, 300],
      padding: 0.2,
      as: 'testScale'
    });

    const scale = result.spec.testScale;

    // Ticks should return all domain values
    expect(scale.ticks()).toEqual(['A', 'B', 'C']);
  });
});
