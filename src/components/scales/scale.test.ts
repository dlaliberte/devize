/**
 * Scale Component Tests
 *
 * Purpose: Tests the scale components
 * Author: [Author Name]
 * Creation Date: [Date]
 * Last Modified: [Date]
 */

import { describe, test, expect, beforeEach, vi } from 'vitest';
import { registerDefineType } from '../../core/define';
import { createScale } from './scale';
import './linearScale'; // Import to ensure the visualization types are registered
import './bandScale';   // Import to ensure the visualization types are registered

// Reset registry and register define type before each test
beforeEach(() => {
  // We don't need to reset the registry anymore as the testing framework handles this
  // Just ensure the define type is registered
  registerDefineType();
});

describe('Scale Component', () => {
  describe('Linear Scale', () => {
    test('should create a linear scale with the correct properties', () => {
      const scale = createScale('linear', {
        domain: [0, 100],
        range: [0, 500],
        clamp: true
      });

      console.log('Linear scale:', scale);

      expect(scale).toBeDefined();
      expect(scale.domain).toEqual([0, 100]);
      expect(scale.range).toEqual([0, 500]);
      expect(typeof scale.scale).toBe('function');
      expect(typeof scale.invert).toBe('function');
    });

    test('should map values from domain to range', () => {
      const scale = createScale('linear', {
        domain: [0, 100],
        range: [0, 500]
      });

      expect(scale.scale(0)).toBeCloseTo(0);
      expect(scale.scale(50)).toBeCloseTo(250);
      expect(scale.scale(100)).toBeCloseTo(500);
    });

    test('should support invert function', () => {
      const scale = createScale('linear', {
        domain: [0, 100],
        range: [0, 500]
      });

      expect(typeof scale.invert).toBe('function');
      expect(scale.invert(250)).toBeCloseTo(50);
    });

    test('should generate ticks', () => {
      const scale = createScale('linear', {
        domain: [0, 100],
        range: [0, 500]
      });

      const ticks = scale.ticks ? scale.ticks(5) : [];
      expect(Array.isArray(ticks)).toBe(true);
      expect(ticks.length).toBe(5);
    });
  });

  describe('Band Scale', () => {
    test('should create a band scale with the correct properties', () => {
      const domain = ['A', 'B', 'C', 'D'];
      const scale = createScale('band', {
        domain,
        range: [0, 400],
        padding: 0.2
      });

      expect(scale.domain).toEqual(domain);
      expect(scale.range).toEqual([0, 400]);
      expect(typeof scale.scale).toBe('function');
    });

    test('should provide bandwidth', () => {
      const scale = createScale('band', {
        domain: ['A', 'B', 'C', 'D'],
        range: [0, 400],
        padding: 0.2
      });

      expect(typeof scale.bandwidth).toBe('function');
      expect(scale.bandwidth()).toBeGreaterThan(0);
    });

    test('should return domain values as ticks', () => {
      const domain = ['A', 'B', 'C', 'D'];
      const scale = createScale('band', {
        domain,
        range: [0, 400]
      });

      const ticks = scale.ticks ? scale.ticks() : [];
      expect(Array.isArray(ticks)).toBe(true);
      expect(ticks).toEqual(domain);
    });
  });

  describe('Ordinal Scale', () => {
    test('should create an ordinal scale with the correct properties', () => {
      const domain = ['Low', 'Medium', 'High'];
      const range = ['#3366CC', '#FF9900', '#DC3912'];
      const scale = createScale('ordinal', {
        domain,
        range
      });

      expect(scale.domain).toEqual(domain);
      expect(scale.range).toEqual(range);
      expect(typeof scale.scale).toBe('function');
    });

    test('should handle values not in the domain', () => {
      const scale = createScale('ordinal', {
        domain: ['Low', 'Medium', 'High'],
        range: ['#3366CC', '#FF9900', '#DC3912']
      });

      expect(scale.scale('Low')).toBe('#3366CC');
      expect(scale.scale('Unknown')).toBe('#3366CC'); // Default unknown value is first range item
    });

    test('should support custom unknown value', () => {
      const scale = createScale('ordinal', {
        domain: ['Low', 'Medium', 'High'],
        range: ['#3366CC', '#FF9900', '#DC3912'],
        unknown: 'gray'
      });

      expect(scale.scale('Low')).toBe('#3366CC');
      expect(scale.scale('Unknown')).toBe('gray');
    });
  });

  describe('Scale Factory', () => {
    test('should throw error for unknown scale type', () => {
      expect(() => {
        createScale('unknown' as any, {
          domain: [0, 100],
          range: [0, 500]
        });
      }).toThrow(/Unknown scale type/);
    });

    test('should create log scale (placeholder)', () => {
      const scale = createScale('log', {
        domain: [1, 1000],
        range: [0, 300]
      });

      expect(scale).toBeDefined();
      expect(typeof scale.scale).toBe('function');
    });

    test('should create time scale (placeholder)', () => {
      const scale = createScale('time', {
        domain: [0, 100],
        range: [0, 500]
      });

      expect(scale).toBeDefined();
      expect(typeof scale.scale).toBe('function');
    });
  });
});
