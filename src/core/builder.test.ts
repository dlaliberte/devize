import { describe, test, expect, beforeEach, vi, afterEach } from 'vitest';
import { buildViz } from './builder';
import { registerType, getType, hasType, registry } from './registry';
import { TypeDefinition, VisualizationSpec } from './types';

/**
 * Unit Tests for the Builder Module
 *
 * This file contains tests for the builder.ts module which is responsible for
 * creating visualization objects from specifications in the Devize system.
 *
 * Test Structure:
 * 1. Basic Creation: Tests for creating simple visualization objects
 * 2. Default Values: Tests for applying default values to specifications
 * 3. Validation: Tests for validating required properties
 * 4. Error Handling: Tests for handling invalid inputs
 */

// Reset the registry before each test
beforeEach(() => {
  // This is a bit of a hack for testing - in a real implementation
  // we would have a way to reset the registry for tests
  (registry as any).types = new Map();
});

// Clean up after tests
afterEach(() => {
  vi.restoreAllMocks();
});

describe('Visualization Builder', () => {
  // Helper function to register a test visualization type
  function registerTestType(name: string, requiredProps: string[] = [], optionalProps: Record<string, any> = {}) {
    const mockImplementation = vi.fn((spec) => {
      return {
        ...spec,
        renderSVG: vi.fn(),
        renderToCanvas: vi.fn()
      };
    });

    const properties: Record<string, any> = {};

    // Add required properties
    for (const prop of requiredProps) {
      properties[prop] = { required: true };
    }

    // Add optional properties with defaults
    for (const [prop, defaultValue] of Object.entries(optionalProps)) {
      properties[prop] = { default: defaultValue };
    }

    registerType({
      name,
      properties,
      implementation: mockImplementation
    });

    return mockImplementation;
  }

  describe('Basic Creation', () => {
    test('should return already processed objects unchanged', () => {
      // Create a processed object with rendering functions
      const processedObject = {
        spec: {
          type: 'rectangle',
          width: 100,
          height: 50
        },
        render: () => {},
        renderToSvg: () => document.createElementNS('http://www.w3.org/2000/svg', 'g'),
        renderToCanvas: () => {},
        update: () => processedObject,
        getProperty: () => {}
      };

      // buildViz should return it unchanged
      const result = buildViz(processedObject);
      expect(result).toBe(processedObject);
    });

    test('should process a visualization specification', () => {
      // Register a test visualization type
      const mockImplementation = registerTestType('rectangle', ['width', 'height']);

      // Create a visualization
      const spec = {
        type: 'rectangle',
        width: 100,
        height: 50
      };

      const result = buildViz(spec);

      // Result should have rendering functions
      expect(result.render).toBeDefined();
      expect(result.renderToSvg).toBeDefined();
      expect(result.renderToCanvas).toBeDefined();
      expect(result.spec.type).toBe('rectangle');
      expect(result.spec).toEqual(spec);
    });
  });

  describe('Default Values', () => {
    test('should apply default values for optional properties', () => {
      // Register a test visualization type with optional properties
      registerTestType(
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

      const result = buildViz(spec);

      // Should include default values in the spec
      expect(result.spec.fill).toBe('steelblue');
      expect(result.spec.stroke).toBe('navy');
      expect(result.spec.strokeWidth).toBe(1);
    });

    test('should not override provided values with defaults', () => {
      // Register a test visualization type with optional properties
      registerTestType(
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

      const result = buildViz(spec);

      // Should keep custom values
      expect(result.spec.fill).toBe('red');
      expect(result.spec.stroke).toBe('blue');
      expect(result.spec.strokeWidth).toBe(1); // Only this default should be applied
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
      }).toThrow(/Required property/);
    });

    test('should call custom validation function if available', () => {
      // Create a custom validation function
      const mockValidate = vi.fn((spec) => {
        if (spec.width <= 0 || spec.height <= 0) {
          throw new Error('Width and height must be positive');
        }
      });

      // Register a type with custom validation
      const properties = {
        width: { required: true },
        height: { required: true }
      };

      const mockImplementation = vi.fn((spec) => {
        return spec;
      });

      registerType({
        name: 'customRect',
        properties,
        implementation: mockImplementation,
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

  describe('Define Type Handling', () => {
    test('should register a new type when processing a define spec', () => {
      // First register the define type
      registerType({
        name: 'define',
        properties: {
          name: { required: true },
          properties: { required: true },
          implementation: { required: true }
        },
        implementation: (props) => {
          // Extract properties
          const { name, properties, implementation } = props;

          // Create the type definition
          const typeDefinition: TypeDefinition = {
            name,
            properties,
            implementation
          };

          // Register the type
          registerType(typeDefinition);

          // Return an empty group
          return { type: 'group', children: [] };
        }
      });

      // Define a new type
      buildViz({
        type: 'define',
        name: 'testCircle',
        properties: {
          cx: { required: true },
          cy: { required: true },
          r: { default: 10 }
        },
        implementation: (props: any) => ({
          type: 'circle',
          cx: props.cx,
          cy: props.cy,
          r: props.r
        })
      });

      // Check if the new type was registered
      expect(hasType('testCircle')).toBe(true);

      // Check the properties of the new type
      const testCircleType = getType('testCircle');
      expect(testCircleType).toBeDefined();
      expect(testCircleType?.properties.cx.required).toBe(true);
      expect(testCircleType?.properties.r.default).toBe(10);
    });
  });

  describe('Recursive Building', () => {
    test('should handle nested visualizations', () => {
      // Register necessary types
      registerTestType('group', [], { children: [] });
      registerTestType('rectangle', ['width', 'height'], { fill: 'black' });
      registerTestType('circle', ['cx', 'cy', 'r'], { fill: 'red' });

      // Create a group with nested visualizations
      const spec: VisualizationSpec = {
        type: 'group',
        children: [
          {
            type: 'rectangle',
            width: 100,
            height: 50,
            fill: 'blue'
          },
          {
            type: 'circle',
            cx: 150,
            cy: 75,
            r: 25
          }
        ]
      };

      // This is mostly a smoke test to ensure it doesn't throw
      const result = buildViz(spec);
      expect(result).toBeDefined();
      expect(result.spec.type).toBe('group');
    });
  });
});
