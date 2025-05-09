/**
   * Band Scale Component Tests
   *
   * Purpose: Tests the band scale component functionality
   * Author: [Author Name]
   * Creation Date: [Date]
   * Last Modified: [Date]
   */

import { describe, test, expect, beforeEach } from 'vitest';
import { registry, hasType } from '../../core/registry';
import { buildViz } from '../../core/builder';
import { registerDefineType } from '../../core/define';
import { Scale } from './scale';

// Import the band scale module
import { bandScaleDefinition, createBandScale } from './bandScale';

describe('Band Scale', () => {
    // Reset registry before each test
    beforeEach(() => {
      // Reset the registry for clean tests
      (registry as any).types = new Map();

      // Register the required types
      registerDefineType();

      // Register the band scale type directly
      buildViz(bandScaleDefinition);
    });

    test('should register the bandScale type', () => {
      expect(hasType('bandScale')).toBe(true);
    });

    test('should create a band scale with the provided domain and range', () => {
      const scale = buildViz({
        type: 'bandScale',
        domain: ['A', 'B', 'C', 'D'],
        range: [0, 300],
        padding: 0.1
      }) as Scale;

      expect(scale).toBeDefined();
      expect(scale.domain).toEqual(['A', 'B', 'C', 'D']);
      expect(scale.range).toEqual([0, 300]);
      expect(scale.scale).toBeTypeOf('function');
      expect(scale.bandwidth).toBeTypeOf('function');

      // Test scale function (returns start position of each band)
      const posA = scale.scale('A');
      const posB = scale.scale('B');
      const posC = scale.scale('C');
      const posD = scale.scale('D');

      expect(posA).toBeGreaterThanOrEqual(0);
      expect(posB).toBeGreaterThan(posA);
      expect(posC).toBeGreaterThan(posB);
      expect(posD).toBeGreaterThan(posC);
      expect(posD + scale.bandwidth()).toBeLessThanOrEqual(300);

      // Test bandwidth
      const bandwidth = scale.bandwidth();    expect(bandwidth).toBeGreaterThan(0);

    // Test step size (distance between band starts)
    const step = posB - posA;
    expect(step).toBeGreaterThan(bandwidth); // Step should be larger than bandwidth due to padding

    // Test that all steps are equal
    expect(posC - posB).toBeCloseTo(step);
    expect(posD - posC).toBeCloseTo(step);
  });

  test('should handle custom padding settings', () => {
    const scale1 = buildViz({
      type: 'bandScale',
      domain: ['A', 'B', 'C'],
      range: [0, 300],
      padding: 0.2
    }) as Scale;

    const scale2 = buildViz({
      type: 'bandScale',
      domain: ['A', 'B', 'C'],
      range: [0, 300],
      paddingInner: 0.3,
      paddingOuter: 0.1
    }) as Scale;

    // Scale1 has equal inner and outer padding
    const bandwidth1 = scale1.bandwidth();

    // Scale2 has different inner and outer padding
    const bandwidth2 = scale2.bandwidth();

    // With more inner padding, bandwidth should be smaller
    expect(bandwidth2).toBeLessThan(bandwidth1);
  });

  test('should handle alignment', () => {
    const leftAligned = buildViz({
      type: 'bandScale',
      domain: ['A', 'B', 'C'],
      range: [0, 300],
      padding: 0.1,
      align: 0 // Left-aligned
    }) as Scale;

    const centerAligned = buildViz({
      type: 'bandScale',
      domain: ['A', 'B', 'C'],
      range: [0, 300],
      padding: 0.1,
      align: 0.5 // Center-aligned (default)
    }) as Scale;

    const rightAligned = buildViz({
      type: 'bandScale',
      domain: ['A', 'B', 'C'],
      range: [0, 300],
      padding: 0.1,
      align: 1 // Right-aligned
    }) as Scale;

    // Left-aligned should start at the beginning of the range
    expect(leftAligned.scale('A')).toBeCloseTo(0);

    // Right-aligned should end at the end of the range
    const rightBandwidth = rightAligned.bandwidth();
    expect(rightAligned.scale('C') + rightBandwidth).toBeCloseTo(300);

    // Center-aligned should be in between
    expect(centerAligned.scale('A')).toBeGreaterThan(leftAligned.scale('A'));
    expect(centerAligned.scale('C')).toBeLessThan(rightAligned.scale('C'));
  });

  test('should handle empty domain', () => {
    const scale = buildViz({
      type: 'bandScale',
      domain: [],
      range: [0, 300],
      padding: 0.1
    }) as Scale;

    expect(scale.bandwidth()).toBe(0);
  });

  test('should handle unknown values', () => {
    const scale = buildViz({
      type: 'bandScale',
      domain: ['A', 'B', 'C'],
      range: [0, 300],
      padding: 0.1
    }) as Scale;

    // Unknown values should return NaN
    expect(isNaN(scale.scale('D'))).toBe(true);
  });
});
