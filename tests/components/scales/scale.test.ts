import { createScale } from '../../../src/components/scales/scale';
import { vi } from 'vitest';

describe('Scale Component', () => {
  describe('Linear Scale', () => {
    test('should map domain values to range values', () => {
      const scale = createScale('linear', {
        domain: [0, 100],
        range: [0, 500]
      });

      expect(scale.scale(0)).toBe(0);
      expect(scale.scale(50)).toBe(250);
      expect(scale.scale(100)).toBe(500);

      // Test values outside the domain
      expect(scale.scale(-20)).toBe(-100); // Extrapolates below domain
      expect(scale.scale(120)).toBe(600);  // Extrapolates above domain
    });

    test('should support clamping', () => {
      const scale = createScale('linear', {
        domain: [0, 100],
        range: [0, 500],
        clamp: true
      });

      expect(scale.scale(0)).toBe(0);
      expect(scale.scale(50)).toBe(250);
      expect(scale.scale(100)).toBe(500);

      // Test values outside the domain with clamping
      expect(scale.scale(-20)).toBe(0);    // Clamps to range minimum
      expect(scale.scale(120)).toBe(500);  // Clamps to range maximum
    });

    test('should invert range values to domain values', () => {
      const scale = createScale('linear', {
        domain: [0, 100],
        range: [0, 500]
      });

      expect(scale.invert(0)).toBe(0);
      expect(scale.invert(250)).toBe(50);
      expect(scale.invert(500)).toBe(100);
    });

    test('should generate ticks', () => {
      const scale = createScale('linear', {
        domain: [0, 100],
        range: [0, 500]
      });

      const ticks = scale.ticks(5);
      expect(ticks).toHaveLength(5);
      expect(ticks[0]).toBe(0);
      expect(ticks[4]).toBe(100);
    });
  });

  describe('Band Scale', () => {
    test('should map domain values to range values with proper bandwidth', () => {
      const scale = createScale('band', {
        domain: ['A', 'B', 'C', 'D'],
        range: [0, 300],
        padding: 0.2
      });

      // Get the actual bandwidth from the scale
      const actualBandwidth = scale.bandwidth();

      // Check bandwidth is reasonable
      expect(actualBandwidth).toBeGreaterThan(0);
      expect(actualBandwidth).toBeLessThan(300 / 4);

      // Check positions are within range and properly spaced
      const posA = scale.scale('A');
      const posB = scale.scale('B');
      const posC = scale.scale('C');
      const posD = scale.scale('D');

      expect(posA).toBeGreaterThanOrEqual(0);
      expect(posD + actualBandwidth).toBeLessThanOrEqual(300);

      // Check even spacing
      const step = (posB - posA);
      expect(posC - posB).toBeCloseTo(step);
      expect(posD - posC).toBeCloseTo(step);
    });

    test('should handle different padding values', () => {
      const scale = createScale('band', {
        domain: ['A', 'B', 'C'],
        range: [0, 300],
        padding: 0.5
      });

      // Get the actual bandwidth from the scale
      const actualBandwidth = scale.bandwidth();

      // Check bandwidth is reasonable
      expect(actualBandwidth).toBeGreaterThan(0);
      expect(actualBandwidth).toBeLessThan(300 / 3);

      // Check positions are within range and properly spaced
      const posA = scale.scale('A');
      const posB = scale.scale('B');
      const posC = scale.scale('C');

      expect(posA).toBeGreaterThanOrEqual(0);
      expect(posC + actualBandwidth).toBeLessThanOrEqual(300);

      // Check even spacing
      const step = (posB - posA);
      expect(posC - posB).toBeCloseTo(step);
    });

    test('should handle paddingInner and paddingOuter separately', () => {
      const scale = createScale('band', {
        domain: ['A', 'B', 'C'],
        range: [0, 300],
        paddingInner: 0.2,
        paddingOuter: 0.1
      });

      // Get the actual bandwidth from the scale
      const actualBandwidth = scale.bandwidth();

      // Check bandwidth is reasonable
      expect(actualBandwidth).toBeGreaterThan(0);
      expect(actualBandwidth).toBeLessThan(300 / 3);

      // Check positions are within range and properly spaced
      const posA = scale.scale('A');
      const posB = scale.scale('B');
      const posC = scale.scale('C');

      expect(posA).toBeGreaterThan(0); // Should have some outer padding
      expect(posC + actualBandwidth).toBeLessThan(300); // Should have some outer padding

      // Check even spacing
      const step = (posB - posA);
      expect(posC - posB).toBeCloseTo(step);
    });

    test('should return NaN for values not in domain', () => {
      const scale = createScale('band', {
        domain: ['A', 'B', 'C'],
        range: [0, 300]
      });

      expect(isNaN(scale.scale('D'))).toBe(true);
    });
  });

  describe('Ordinal Scale', () => {
    test('should map domain values to range values', () => {
      const scale = createScale('ordinal', {
        domain: ['A', 'B', 'C'],
        range: ['red', 'green', 'blue']
      });

      expect(scale.scale('A')).toBe('red');
      expect(scale.scale('B')).toBe('green');
      expect(scale.scale('C')).toBe('blue');
    });

    test('should cycle through range values for domain values beyond range length', () => {
      const scale = createScale('ordinal', {
        domain: ['A', 'B', 'C', 'D', 'E'],
        range: ['red', 'green', 'blue']
      });

      expect(scale.scale('A')).toBe('red');
      expect(scale.scale('B')).toBe('green');
      expect(scale.scale('C')).toBe('blue');
      expect(scale.scale('D')).toBe('red');    // Cycles back to first color
      expect(scale.scale('E')).toBe('green');  // Cycles to second color
    });

    test('should return first range value for unknown domain values', () => {
      const scale = createScale('ordinal', {
        domain: ['A', 'B', 'C'],
        range: ['red', 'green', 'blue']
      });

      expect(scale.scale('D')).toBe('red');  // Unknown value gets first range value
    });
  });
});
