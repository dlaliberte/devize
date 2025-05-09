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
import { createScale } from './scale';
import { Scale } from './scale-interface';

// Import scale definitions directly
import { linearScaleDefinition } from './linearScale';
import { bandScaleDefinition } from './bandScale';
import { ordinalScaleDefinition } from './ordinalScale';

describe('Scale Components', () => {
  // Reset registry before each test
  beforeEach(() => {
    // Reset the registry for clean tests
    (registry as any).types = new Map();

    // Register the required types
    registerDefineType();

    // Register scale types directly
    buildViz(linearScaleDefinition);
    buildViz(bandScaleDefinition);
    buildViz(ordinalScaleDefinition);
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

  describe('Scale Options', () => {
    test('should pass options to linear scale', () => {
      const scale = createScale('linear', {
        domain: [0, 100],
        range: [0, 500],
        clamp: true,
        padding: 0.1,
        nice: true
      });

      // Test clamping
      expect(scale.scale(-50)).toBe(0);

      // Test that domain was adjusted for padding and nice
      expect(scale.domain[0]).toBeLessThanOrEqual(0);
      expect(scale.domain[1]).toBeGreaterThanOrEqual(100);
    });

    test('should pass options to band scale', () => {
      const scale = createScale('band', {
        domain: ['A', 'B', 'C'],
        range: [0, 300],
        padding: 0.2,
        paddingInner: 0.3,
        paddingOuter: 0.1,
        align: 0
      });

      // Test that options were applied
      expect(scale.scale('A')).toBeGreaterThanOrEqual(0);
      expect(scale.bandwidth()).toBeGreaterThan(0);
    });

    test('should pass options to ordinal scale', () => {
      const scale = createScale('ordinal', {
        domain: ['A', 'B', 'C'],
        range: ['red', 'green', 'blue'],
        unknown: 'gray'
      });

      // Test unknown value handling
      expect(scale.scale('D')).toBe('gray');
    });
  });

  describe('Scale Interface', () => {
    test('all scales should have domain, range, and scale properties', () => {
      const linearScale = createScale('linear', {
        domain: [0, 100],
        range: [0, 500]
      });

      const bandScale = createScale('band', {
        domain: ['A', 'B', 'C'],
        range: [0, 300]
      });

      const ordinalScale = createScale('ordinal', {
        domain: ['A', 'B', 'C'],
        range: ['red', 'green', 'blue']
      });

      // Check common properties
      expect(linearScale.domain).toBeDefined();
      expect(linearScale.range).toBeDefined();
      expect(linearScale.scale).toBeTypeOf('function');

      expect(bandScale.domain).toBeDefined();
      expect(bandScale.range).toBeDefined();
      expect(bandScale.scale).toBeTypeOf('function');

      expect(ordinalScale.domain).toBeDefined();
      expect(ordinalScale.range).toBeDefined();
      expect(ordinalScale.scale).toBeTypeOf('function');
    });

    test('linear scales should have invert function', () => {
      const linearScale = createScale('linear', {
        domain: [0, 100],
        range: [0, 500]
      });

      expect(linearScale.invert).toBeTypeOf('function');
      expect(linearScale.invert(250)).toBe(50);
    });

    test('band scales should have bandwidth function', () => {
      const bandScale = createScale('band', {
        domain: ['A', 'B', 'C'],
        range: [0, 300]
      });

      expect(bandScale.bandwidth).toBeTypeOf('function');
      expect(bandScale.bandwidth()).toBeGreaterThan(0);
    });

    test('all scales should have ticks function', () => {
      const linearScale = createScale('linear', {
        domain: [0, 100],
        range: [0, 500]
      });

      const bandScale = createScale('band', {
        domain: ['A', 'B', 'C'],
        range: [0, 300]
      });

      const ordinalScale = createScale('ordinal', {
        domain: ['A', 'B', 'C'],
        range: ['red', 'green', 'blue']
      });

      expect(linearScale.ticks).toBeTypeOf('function');
      expect(bandScale.ticks).toBeTypeOf('function');
      expect(ordinalScale.ticks).toBeTypeOf('function');

      expect(linearScale.ticks(5)).toHaveLength(5);
      expect(bandScale.ticks()).toEqual(['A', 'B', 'C']);
      expect(ordinalScale.ticks()).toEqual(['A', 'B', 'C']);
    });
  });
});
