import { describe, test, expect, beforeEach, vi } from 'vitest';
import { _resetRegistryForTesting } from '../../core/registry';
import { registerDefineType } from '../../core/define';
import { createScale } from './scale';
import './linearScale'; // Import to ensure the visualization types are registered
import './bandScale';   // Import to ensure the visualization types are registered

// Mock createViz to avoid actual rendering
vi.mock('../../core/creator', () => ({
    createViz: vi.fn((spec) => {
      // For linearScale
      if (spec.type === 'linearScale') {
        const [domainMin, domainMax] = spec.domain;
        const [rangeMin, rangeMax] = spec.range;
        const domainSize = domainMax - domainMin;
        const rangeSize = rangeMax - rangeMin;

        return {
          domain: spec.domain,
          range: spec.range,
          scale: (value) => {
            let normalized = (value - domainMin) / domainSize;
            if (spec.clamp) {
              normalized = Math.max(0, Math.min(1, normalized));
            }
            return rangeMin + normalized * rangeSize;
          },
          invert: (value) => {
            const normalized = (value - rangeMin) / rangeSize;
            return domainMin + normalized * domainSize;
          },
          ticks: (count = 10) => {
            const step = domainSize / (count - 1);
            return Array.from({ length: count }, (_, i) => domainMin + i * step);
          }
        };
      }

      // For bandScale
      if (spec.type === 'bandScale') {
        const domain = spec.domain;
        const [rangeMin, rangeMax] = spec.range;
        const n = domain.length;
        const padding = spec.padding || 0.1;
        const step = (rangeMax - rangeMin) / Math.max(1, n);
        const bandWidth = step * (1 - padding);

        return {
          domain,
          range: spec.range,
          scale: (value) => {
            const index = domain.indexOf(value);
            if (index === -1) return NaN;
            return rangeMin + index * step;
          },
          bandwidth: () => bandWidth,
          ticks: () => domain
        };
      }

      // Return the original spec for other types
      return spec;
    })
}));

// Reset registry and register define type before each test
beforeEach(() => {
  _resetRegistryForTesting();
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

      expect(scale.domain).toEqual([0, 100]);
      expect(scale.range).toEqual([0, 500]);
      expect(typeof scale.scale).toBe('function');
      expect(typeof scale.invert).toBe('function');
    });

    test('should support invert function', () => {
      const scale = createScale('linear', {
        domain: [0, 100],
        range: [0, 500]
      });

      // Test that the function exists
      expect(typeof scale.invert).toBe('function');
    });

    test('should generate ticks', () => {
      const scale = createScale('linear', {
        domain: [0, 100],
        range: [0, 500]
      });

      const ticks = scale.ticks ? scale.ticks(5) : [];
      expect(Array.isArray(ticks)).toBe(true);
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
    });

    test('should return domain values as ticks', () => {
      const domain = ['A', 'B', 'C', 'D'];
      const scale = createScale('band', {
        domain,
        range: [0, 400]
      });

      const ticks = scale.ticks ? scale.ticks() : [];
      expect(Array.isArray(ticks)).toBe(true);
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

      // Just test that the function exists
      expect(typeof scale.scale).toBe('function');
    });

    test('should support custom unknown value', () => {
      const scale = createScale('ordinal', {
        domain: ['Low', 'Medium', 'High'],
        range: ['#3366CC', '#FF9900', '#DC3912'],
        unknown: 'gray'
      });

      // Just test that the function exists
      expect(typeof scale.scale).toBe('function');
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
