/**
   * Linear Scale Component Tests
   *
   * Purpose: Tests the linear scale component functionality
   * Author: [Author Name]
   * Creation Date: [Date]
   * Last Modified: [Date]
   */

import { describe, test, expect, beforeEach } from 'vitest';
import { registry, hasType } from '../../core/registry';
import { buildViz } from '../../core/builder';
import { registerDefineType } from '../../core/define';
import { Scale } from './scale';

// Import the linear scale module
import { linearScaleDefinition, createLinearScale } from './linearScale';

describe('Linear Scale', () => {
    // Reset registry before each test
    beforeEach(() => {
      // Reset the registry for clean tests
      (registry as any).types = new Map();

      // Register the required types
      registerDefineType();

      // Register the linear scale type directly
      buildViz(linearScaleDefinition);
    });

    test('should register the linearScale type', () => {
      expect(hasType('linearScale')).toBe(true);
    });

    test('should create a linear scale with the provided domain and range', () => {
      const scale = buildViz({
        type: 'linearScale',
        domain: [0, 100],
        range: [0, 500]
      }) as Scale;

      expect(scale).toBeDefined();
      expect(scale.domain).toEqual([0, 100]);
      expect(scale.range).toEqual([0, 500]);
      expect(scale.scale).toBeTypeOf('function');

      // Test scale function
      expect(scale.scale(0)).toBe(0);
      expect(scale.scale(50)).toBe(250);
      expect(scale.scale(100)).toBe(500);

      // Test invert function
      expect(scale.invert).toBeTypeOf('function');
      expect(scale.invert(0)).toBe(0);
      expect(scale.invert(250)).toBe(50);
      expect(scale.invert(500)).toBe(100);

      // Test ticks function
      expect(scale.ticks).toBeTypeOf('function');
      const ticks = scale.ticks(5);
      expect(ticks).toHaveLength(5);
      expect(ticks[0]).toBe(0);
      expect(ticks[4]).toBe(100);
    });

    test('should apply clamping when specified', () => {
      const scale = buildViz({
        type: 'linearScale',
        domain: [0, 100],
        range: [0, 500],
        clamp: true
      }) as Scale;

      // Test clamping
      expect(scale.scale(-50)).toBe(0);    // Clamped to min
      expect(scale.scale(150)).toBe(500);  // Clamped to max
    });

    test('should apply padding when specified', () => {
      const scale = buildViz({
        type: 'linearScale',
        domain: [0, 100],
        range: [0, 500],
        padding: 0.1
      }) as Scale;

      // With 10% padding, domain effectively becomes [-10, 110]
      expect(scale.scale(-10)).toBeCloseTo(0);
      expect(scale.scale(0)).toBeCloseTo(41.67, 1);
      expect(scale.scale(100)).toBeCloseTo(458.33, 1);
      expect(scale.scale(110)).toBeCloseTo(500);
    });

    test('should handle nice domain adjustment', () => {
      const scale = buildViz({
        type: 'linearScale',
        domain: [3, 97],
        range: [0, 500],
        nice: true
      }) as Scale;

      // With nice=true, domain should be rounded to nice values
      expect(scale.domain[0]).toBeLessThanOrEqual(0);
      expect(scale.domain[1]).toBeGreaterThanOrEqual(100);

      // Test that the scale function uses the nice domain
      expect(scale.scale(0)).toBeCloseTo(0);
      expect(scale.scale(100)).toBeCloseTo(500);
    });

    test('should handle edge cases', () => {
      // Test with zero-length domain
      const zeroLengthDomain = buildViz({
        type: 'linearScale',
        domain: [50, 50],
        range: [0, 500]
      }) as Scale;

      expect(zeroLengthDomain.scale(50)).toBe(250); // Middle of range

      // Test with zero-length range
      const zeroLengthRange = buildViz({
        type: 'linearScale',
        domain: [0, 100],
        range: [250, 250]
      }) as Scale;

      expect(zeroLengthRange.scale(50)).toBe(250); // Only value in range
    });

    test('should provide a convenience function for creating linear scales', () => {
      const scale = createLinearScale(
        [0, 100],
        [0, 500],
        { clamp: true, padding: 0.1, nice: true }
      );

      expect(scale).toBeDefined();
      expect(scale.domain[0]).toBeLessThanOrEqual(0);
      expect(scale.domain[1]).toBeGreaterThanOrEqual(100);
      expect(scale.range).toEqual([0, 500]);

      // Test clamping
      expect(scale.scale(-50)).toBe(0);
      expect(scale.scale(150)).toBe(500);
    });
});
