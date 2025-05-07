import { describe, test, expect, beforeEach, vi, afterEach } from 'vitest';
import { buildViz } from './creator';
import { registerType, getType, _resetRegistryForTesting } from './registry';
import { VisualizationType } from './types';

/**
 * Unit Tests for the Creator Module
 *
 * This file contains tests for the creator.ts module which is responsible for
 * creating visualization objects from specifications in the Devize system.
 *
 * Test Structure:
 * 1. Basic Creation: Tests for creating simple visualization objects
 * 2. Default Values: Tests for applying default values to specifications
 * 3. Validation: Tests for validating required properties
 * 4. Error Handling: Tests for handling invalid inputs
 *
 * Related Documents:
 * - Design Document: design/creation.md
 * - Implementation: src/core/creator.ts
 * - Implementation: src/core/registry.ts
 */

// Reset the registry before each test
beforeEach(() => {
  _resetRegistryForTesting();
});

// Clean up after tests
afterEach(() => {
  vi.restoreAllMocks();
});

describe('Visualization Creator', () => {
  // Helper function to register a test visualization type
  function registerTestType(name: string, requiredProps: string[] = [], optionalProps: Record<string, any> = {}) {
    const mockDecompose = vi.fn((spec) => {
      return {
        ...spec,
        renderSVG: vi.fn(),
        renderCanvas: vi.fn()
      };
    });

    registerType({
      name,
      requiredProps,
      optionalProps,
      generateConstraints: () => [],
      decompose: mockDecompose
    });

    return mockDecompose;
  }

  describe('Basic Creation', () => {
    test('should return already processed objects unchanged', () => {
      // Create a processed object with rendering functions
      const processedObject = {
        type: 'rectangle',
        width: 100,
        height: 50,
        renderSVG: () => {},
        renderCanvas: () => {}
      };

      // buildViz should return it unchanged
      const result = buildViz(processedObject);
      expect(result).toBe(processedObject);
    });

    test('should process a visualization specification', () => {
      // Register a test visualization type
      const mockDecompose = registerTestType('rectangle', ['width', 'height']);

      // Create a visualization
      const spec = {
        type: 'rectangle',
        width: 100,
        height: 50
      };

      const result = buildViz(spec);

      // Should call the decompose function with the spec
      expect(mockDecompose).toHaveBeenCalledWith(spec);

      // Result should have rendering functions
      expect(result.renderSVG).toBeDefined();
      expect(result.renderCanvas).toBeDefined();
    });
  });

  describe('Default Values', () => {
    test('should apply default values for optional properties', () => {
      // Register a test visualization type with optional properties
      const mockDecompose = registerTestType(
        'circle',
        ['cx', 'cy', 'r'],
        { fill: 'steelblue', stroke: 'navy', strokeWidth: 1 }
      );

      // Create a visualization with only required properties
      const spec = {
        type: 'circle',
        cx: 100,
        cy: 100,
        r: 50
      };

      buildViz(spec);

      // Should call decompose with the spec including default values
      expect(mockDecompose).toHaveBeenCalledWith({
        type: 'circle',
        cx: 100,
        cy: 100,
        r: 50,
        fill: 'steelblue',
        stroke: 'navy',
        strokeWidth: 1
      });
    });

    test('should not override provided values with defaults', () => {
      // Register a test visualization type with optional properties
      const mockDecompose = registerTestType(
        'rectangle',
        ['width', 'height'],
        { fill: 'black', stroke: 'gray', strokeWidth: 1 }
      );

      // Create a visualization with custom values for optional properties
      const spec = {
        type: 'rectangle',
        width: 100,
        height: 50,
        fill: 'red',
        stroke: 'blue'
      };

      buildViz(spec);

      // Should call decompose with the spec including custom values
      expect(mockDecompose).toHaveBeenCalledWith({
        type: 'rectangle',
        width: 100,
        height: 50,
        fill: 'red',
        stroke: 'blue',
        strokeWidth: 1  // Only this default should be applied
      });
    });
  });

  describe('Validation', () => {
    test('should validate required properties', () => {
      // Register a test visualization type with required properties
      registerTestType('text', ['x', 'y', 'text']);

      // Should throw when missing required properties
      expect(() => {
        buildViz({
          type: 'text',
          x: 100
          // Missing y and text
        });
      }).toThrow(/Missing required property/);
    });

    test('should call custom validation function if available', () => {
      // Create a custom validation function
      const mockValidate = vi.fn((spec) => {
        if (spec.width <= 0 || spec.height <= 0) {
          throw new Error('Width and height must be positive');
        }
      });

      // Register a type with custom validation
      const mockDecompose = vi.fn((spec) => {
        return {
          ...spec,
          renderSVG: vi.fn(),
          renderCanvas: vi.fn()
        };
      });

      registerType({
        name: 'customRect',
        requiredProps: ['width', 'height'],
        optionalProps: {},
        generateConstraints: () => [],
        decompose: mockDecompose,
        validate: mockValidate
      });

      // Valid spec should not throw
      buildViz({
        type: 'customRect',
        width: 100,
        height: 50
      });
      expect(mockValidate).toHaveBeenCalled();

      // Invalid spec should throw
      expect(() => {
        buildViz({
          type: 'customRect',
          width: -10,
          height: 50
        });
      }).toThrow(/Width and height must be positive/);
    });
  });

  describe('Error Handling', () => {
    test('should throw for unknown visualization types', () => {
      expect(() => {
        buildViz({
          type: 'nonExistentType',
          width: 100,
          height: 50
        });
      }).toThrow(/Unknown visualization type/);
    });

    test('should handle null or undefined specifications', () => {
      expect(() => {
        // @ts-ignore - Testing runtime behavior with invalid input
        buildViz(null);
      }).toThrow();

      expect(() => {
        // @ts-ignore - Testing runtime behavior with invalid input
        buildViz(undefined);
      }).toThrow();
    });

    test('should handle specifications without a type', () => {
      expect(() => {
        // @ts-ignore - Testing runtime behavior with invalid input
        buildViz({
          width: 100,
          height: 50
        });
      }).toThrow();
    });
  });
});
