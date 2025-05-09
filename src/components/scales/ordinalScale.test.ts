/**
 * Ordinal Scale Component Tests
 *
 * Purpose: Tests the ordinal scale component functionality
 * Author: [Author Name]
 * Creation Date: [Date]
 * Last Modified: [Date]
 */

import { describe, test, expect, beforeEach } from 'vitest';
import { registry, hasType } from '../../core/registry';
import { buildViz } from '../../core/builder';
import { registerDefineType } from '../../core/define';
import { Scale } from './scale-interface';

// Import the ordinal scale module
import { ordinalScaleDefinition, createOrdinalScale } from './ordinalScale';

describe('Ordinal Scale', () => {
  // Reset registry before each test
  beforeEach(() => {
    // Reset the registry for clean tests
    (registry as any).types = new Map();

    // Register the required types
    registerDefineType();

    // Register the ordinal scale type directly
    buildViz(ordinalScaleDefinition);
  });

  test('should register the ordinalScale type', () => {
    expect(hasType('ordinalScale')).toBe(true);
  });

  test('should create an ordinal scale with the provided domain and range', () => {
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

  test('should provide ticks function that returns domain values', () => {
    const scale = buildViz({
      type: 'ordinalScale',
      domain: ['A', 'B', 'C'],
      range: ['red', 'green', 'blue']
    }) as Scale;

    expect(scale.ticks).toBeTypeOf('function');
    expect(scale.ticks()).toEqual(['A', 'B', 'C']);
  });

  test('should handle empty domain and range', () => {
    const scale = buildViz({
      type: 'ordinalScale',
      domain: [],
      range: []
    }) as Scale;

    expect(scale.scale('anything')).toBeUndefined();
  });

  test('should provide a convenience function for creating ordinal scales', () => {
    const scale = createOrdinalScale(
      ['A', 'B', 'C'],
      ['red', 'green', 'blue'],
      'gray'
    );

    expect(scale).toBeDefined();
    expect(scale.domain).toEqual(['A', 'B', 'C']);
    expect(scale.range).toEqual(['red', 'green', 'blue']);
    expect(scale.scale('A')).toBe('red');
    expect(scale.scale('D')).toBe('gray'); // Unknown value
  });
});
