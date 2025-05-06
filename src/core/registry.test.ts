import { describe, test, expect, beforeEach, vi, afterEach } from 'vitest';
import { registerType, getType, hasType, getAllTypes, removeType } from './registry';
import { _resetRegistryForTesting } from './registry';
import { VisualizationType } from './types';

/**
 * Unit Tests for the Type Registry Module
 *
 * This file contains tests for the registry.ts module which is responsible for
 * managing visualization type definitions in the Devize system.
 *
 * Test Structure:
 * 1. Setup and Teardown: Reset registry state between tests
 * 2. Basic Registry Operations: Tests for core registry functions
 * 3. Integration with define.ts: Tests simulating how define.ts uses the registry
 * 4. Error Handling: Tests for handling invalid inputs
 *
 * Related Documents:
 * - Design Document: design/define.md
 * - Design Document: design/devize_system.md
 * - Implementation: src/core/registry.ts
 * - Implementation: src/core/define.ts
 */

// Add this function to registry.ts for testing purposes
// export function _resetRegistryForTesting(): void {
//   Object.keys(typeRegistry).forEach(key => {
//     delete typeRegistry[key];
//   });
// }

// Reset the registry before each test
beforeEach(() => {
  // Since the registry uses a module-level variable, we need to reset it
  _resetRegistryForTesting();
});

// Clean up after tests
afterEach(() => {
  vi.restoreAllMocks();
});

describe('Type Registry', () => {
  // Sample visualization type for testing
  const sampleType: VisualizationType = {
    name: 'testType',
    requiredProps: ['prop1', 'prop2'],
    optionalProps: { prop3: 'default3', prop4: 10 },
    decompose: vi.fn((spec) => ({ type: 'basic', ...spec }))
  };

  describe('registerType', () => {
    test('should register a new visualization type', () => {
      registerType(sampleType);
      expect(hasType('testType')).toBe(true);
      expect(getType('testType')).toBe(sampleType);
    });

    test('should overwrite existing type with warning', () => {
      // Spy on console.warn
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      registerType(sampleType);

      const updatedType: VisualizationType = {
        ...sampleType,
        requiredProps: ['updatedProp']
      };

      registerType(updatedType);

      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining("'testType' is already registered")
      );
      expect(getType('testType')).toBe(updatedType);
    });

    test('should log registration information', () => {
      // Spy on console.log
      const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      registerType(sampleType);

      expect(logSpy).toHaveBeenCalledWith(
        expect.stringContaining(`Registering visualization type: ${sampleType.name}`)
      );
      expect(logSpy).toHaveBeenCalledWith(
        expect.stringContaining(`Current registry contains:`)
      );
    });
  });

  describe('getType', () => {
    test('should return the registered type', () => {
      registerType(sampleType);
      const retrievedType = getType('testType');
      expect(retrievedType).toBe(sampleType);
    });

    test('should return undefined for non-existent type', () => {
      const retrievedType = getType('nonExistentType');
      expect(retrievedType).toBeUndefined();
    });
  });

  describe('hasType', () => {
    test('should return true for registered type', () => {
      registerType(sampleType);
      expect(hasType('testType')).toBe(true);
    });

    test('should return false for non-existent type', () => {
      expect(hasType('nonExistentType')).toBe(false);
    });
  });

  describe('getAllTypes', () => {
    test('should return all registered types', () => {
      const type1: VisualizationType = {
        ...sampleType,
        name: 'type1'
      };

      const type2: VisualizationType = {
        ...sampleType,
        name: 'type2'
      };

      registerType(type1);
      registerType(type2);

      const allTypes = getAllTypes();
      expect(allTypes).toHaveLength(2);
      expect(allTypes).toContain(type1);
      expect(allTypes).toContain(type2);
    });

    test('should return empty array when no types are registered', () => {
      const allTypes = getAllTypes();
      expect(allTypes).toHaveLength(0);
    });
  });

  describe('removeType', () => {
    test('should remove a registered type', () => {
      registerType(sampleType);
      expect(hasType('testType')).toBe(true);

      const result = removeType('testType');

      expect(result).toBe(true);
      expect(hasType('testType')).toBe(false);
    });

    test('should return false when removing non-existent type', () => {
      const result = removeType('nonExistentType');
      expect(result).toBe(false);
    });
  });

  describe('Integration with define.ts', () => {
    test('should support registering types defined by define visualization', () => {
      // This simulates what define.ts would do
      const circleType: VisualizationType = {
        name: 'circle',
        requiredProps: ['cx', 'cy', 'r'],
        optionalProps: {
          fill: 'black',
          stroke: 'none',
          strokeWidth: 1
        },
        decompose: vi.fn((spec) => ({
          type: 'primitive',
          shape: 'circle',
          ...spec
        }))
      };

      registerType(circleType);

      expect(hasType('circle')).toBe(true);
      const retrievedType = getType('circle');
      expect(retrievedType?.requiredProps).toEqual(['cx', 'cy', 'r']);
      expect(retrievedType?.optionalProps).toEqual({
        fill: 'black',
        stroke: 'none',
        strokeWidth: 1
      });
    });

    test('should support type extension as described in design docs', () => {
      // Register base type
      const baseType: VisualizationType = {
        name: 'baseChart',
        requiredProps: ['data'],
        optionalProps: {
          width: 400,
          height: 300,
          margin: { top: 20, right: 20, bottom: 30, left: 40 }
        },
        decompose: vi.fn((spec) => ({
          type: 'group',
          children: [
            { type: 'rect', width: spec.width, height: spec.height, fill: 'white' }
          ]
        }))
      };

      registerType(baseType);

      // Register extended type (simulating what define.ts would do with extend)
      const extendedType: VisualizationType = {
        name: 'barChart',
        requiredProps: ['data', 'x', 'y'], // Added x, y to required props
        optionalProps: {
          ...baseType.optionalProps,
          barColor: 'steelblue' // Added new prop
        },
        decompose: vi.fn((spec) => {
          // In real code, this would call baseType.decompose and extend the result
          return {
            type: 'group',
            children: [
              { type: 'rect', width: spec.width, height: spec.height, fill: 'white' },
              { type: 'text', text: 'Bar Chart', x: 10, y: 20 }
            ]
          };
        })
      };

      registerType(extendedType);

      expect(hasType('barChart')).toBe(true);
      const retrievedType = getType('barChart');
      expect(retrievedType?.requiredProps).toContain('data');
      expect(retrievedType?.requiredProps).toContain('x');
      expect(retrievedType?.requiredProps).toContain('y');
      expect(retrievedType?.optionalProps).toHaveProperty('barColor', 'steelblue');
      expect(retrievedType?.optionalProps).toHaveProperty('width', 400);
    });
  });

  describe('Error handling', () => {
    test('should handle registration of invalid types gracefully', () => {
      // @ts-ignore - Testing runtime behavior with invalid input
      const result = registerType(null);

      // Should not throw, but the type shouldn't be registered
      expect(result).toBeUndefined();
      expect(getAllTypes()).toHaveLength(0);
    });

    test('should handle registration of types with missing required fields', () => {
      // @ts-ignore - Testing runtime behavior with invalid input
      const invalidType = { name: 'invalidType' };

      // Should log an error but not crash
      const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      // @ts-ignore - Testing runtime behavior with invalid input
      registerType(invalidType);

      expect(errorSpy).toHaveBeenCalled();
      expect(hasType('invalidType')).toBe(false);
    });
  });
});
