/**
 * Scale Component Tests
 *
 * Purpose: Tests the scale components functionality
 * Author: [Author Name]
 * Creation Date: [Date]
 * Last Modified: [Date]
 */

import { describe, test, expect, beforeEach } from 'vitest';
import { registry, hasType } from '../../core/registry';
import { buildViz } from '../../core/builder';
import { registerDefineType } from '../../core/define';
import { createScale, Scale } from './scale';

// Import scale types to ensure they're registered
import './linearScale';
import './bandScale';
import './ordinalScale';

describe('Scale Components', () => {
  // Reset registry before each test
  beforeEach(() => {
    // Reset the registry for clean tests
    (registry as any).types = new Map();

    // Register the required types
    registerDefineType();
  });

  describe('Linear Scale', () => {
    test('should register the linearScale type', () => {
      // Import to ensure registration
      import('./linearScale');

      expect(hasType('linearScale')).toBe(true);
    });

    test('should create a linear scale with the provided domain and range', () => {
      // Import to ensure registration
      import('./linearScale');

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
      // Import to ensure registration
      import('./linearScale');

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
      // Import to ensure registration
      import('./linearScale');

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
  });

  describe('Band Scale', () => {
    test('should register the bandScale type', () => {
      // Import to ensure registration
      import('./bandScale');

      expect(hasType('bandScale')).toBe(true);
    });

    test('should create a band scale with the provided domain and range', () => {
      // Import to ensure registration
      import('./bandScale');

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
      const bandwidth = scale.bandwidth();
      expect(bandwidth).toBeGreaterThan(0);

      // Test step size (distance between band starts)
      const step = posB - posA;
      expect(step).toBeGreaterThan(bandwidth); // Step should be larger than bandwidth due to padding

      // Test that all steps are equal
      expect(posC - posB).toBeCloseTo(step);
      expect(posD - posC).toBeCloseTo(step);
    });

    test('should handle custom padding settings', () => {
      // Import to ensure registration
      import('./bandScale');

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
  });

  describe('Ordinal Scale', () => {
    test('should register the ordinalScale type', () => {
      // Import to ensure registration
      import('./ordinalScale');

      expect(hasType('ordinalScale')).toBe(true);
    });

    test('should create an ordinal scale with the provided domain and range', () => {
      // Import to ensure registration
      import('./ordinalScale');

      const scale = buildViz({
        type: 'ordinalScale',
        domain: ['A', 'B', 'C'],
        range: ['red', 'green', 'blue']
      }) as Scale;

      expect(scale).toBeDefined();
      expect(scale.domain).toEqual(['A', 'B', 'C']);
      expect(scale.range).toEqual(['red', 'green', 'blue']);
      expect(scale.scale).toBeTypeOf('function');

      // Test scale function
      expect(scale.scale('A')).toBe('red');
      expect(scale.scale('B')).toBe('green');
      expect(scale.scale('C')).toBe('blue');

      // Test unknown value handling (defaults to first range value)
      expect(scale.scale('D')).toBe('red');
    });

    test('should handle custom unknown value', () => {
      // Import to ensure registration
      import('./ordinalScale');

      const scale = buildViz({
        type: 'ordinalScale',
        domain: ['A', 'B', 'C'],
        range: ['red', 'green', 'blue'],
        unknown: 'gray'
      }) as Scale;

      // Test unknown value handling
      expect(scale.scale('D')).toBe('gray');
    });

    test('should cycle through range values if domain is longer', () => {
      // Import to ensure registration
      import('./ordinalScale');

      const scale = buildViz({
        type: 'ordinalScale',
        domain: ['A', 'B', 'C', 'D', 'E'],
        range: ['red', 'green', 'blue']
      }) as Scale;

      // Test cycling behavior
      expect(scale.scale('A')).toBe('red');
      expect(scale.scale('B')).toBe('green');
      expect(scale.scale('C')).toBe('blue');
      expect(scale.scale('D')).toBe('red');    // Cycles back to first color
      expect(scale.scale('E')).toBe('green');  // Continues cycling
    });
  });

  describe('Scale Factory', () => {
    test('should create a linear scale', () => {
      const scale = createScale('linear', {
        domain: [0, 100],
        range: [0, 500]
      });

      expect(scale).toBeDefined();
      expect(scale.domain).toEqual([0, 100]);
      expect(scale.range).toEqual([0, 500]);
      expect(scale.scale(50)).toBe(250);
    });

    test('should create a band scale', () => {
      const scale = createScale('band', {
        domain: ['A', 'B', 'C'],
        range: [0, 300]
      });

      expect(scale).toBeDefined();
      expect(scale.domain).toEqual(['A', 'B', 'C']);
      expect(scale.range).toEqual([0, 300]);
      expect(scale.bandwidth()).toBeGreaterThan(0);
    });

    test('should create an ordinal scale', () => {
      const scale = createScale('ordinal', {
        domain: ['A', 'B', 'C'],
        range: ['red', 'green', 'blue']
      });

      expect(scale).toBeDefined();
      expect(scale.domain).toEqual(['A', 'B', 'C']);
      expect(scale.range).toEqual(['red', 'green', 'blue']);
      expect(scale.scale('B')).toBe('green');
    });

    test('should throw for unknown scale type', () => {
      expect(() => {
        createScale('unknown', {
          domain: [0, 100],
          range: [0, 500]
        });
      }).toThrow(/Unknown scale type/);
    });
  });

  describe('Unified Scale Component', () => {
    test('should create a scale of the specified type', () => {
      const linearScale = buildViz({
        type: 'scale',
        type: 'linear',
        domain: [0, 100],
        range: [0, 500]
      });

      const bandScale = buildViz({
        type: 'scale',
        type: 'band',
        domain: ['A', 'B', 'C'],
        range: [0, 300]
      });

      const ordinalScale = buildViz({
        type: 'scale',
        type: 'ordinal',
        domain: ['A', 'B', 'C'],
        range: ['red', 'green', 'blue']
      });

      // Check that each scale has the appropriate methods
      expect(linearScale.scale).toBeTypeOf('function');
      expect(linearScale.invert).toBeTypeOf('function');

      expect(bandScale.scale).toBeTypeOf('function');
      expect(bandScale.bandwidth).toBeTypeOf('function');

      expect(ordinalScale.scale).toBeTypeOf('function');
      expect(ordinalScale.scale('B')).toBe('green');
    });
  });
});
