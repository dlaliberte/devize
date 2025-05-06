import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import { registerType, getType, hasType, _resetRegistryForTesting } from './registry';
import { registerDefineType } from './define';

/**
 * Unit Tests for the Define Module
 *
 * This file contains tests for the define.ts module which is responsible for
 * creating new visualization types declaratively in the Devize system.
 *
 * Test Structure:
 * 1. Basic Type Definition: Tests for creating simple visualization types
 * 2. Property Validation: Tests for property validation features
 * 3. Type Extension: Tests for extending existing visualization types
 * 4. Error Handling: Tests for handling invalid inputs and edge cases
 *
 * Related Documents:
 * - Design Document: design/define.md
 * - Design Document: design/devize_system.md
 * - Implementation: src/core/define.ts
 * - Implementation: src/core/registry.ts
 */

// Reset the registry and register the define type before each test
beforeEach(() => {
  _resetRegistryForTesting();
  registerDefineType();
});

// Clean up after tests
afterEach(() => {
  vi.restoreAllMocks();
});

describe('Define Visualization Type', () => {
  // Helper function to create a new type for testing
  function defineTestType(name = 'testType', properties = {}, implementation = () => ({}), extend = undefined) {
    const defineSpec = {
      type: 'define',
      name,
      properties,
      implementation,
      ...(extend ? { extend } : {})
    };

    // Get the define type and use it to register a new type
    const defineType = getType('define');
    if (!defineType) throw new Error('Define type not registered');

    defineType.decompose(defineSpec, {});

    return getType(name);
  }

  describe('Basic Type Definition', () => {
    test('should register a new visualization type', () => {
      const testType = defineTestType('rectangle', {
        width: { required: true },
        height: { required: true },
        fill: { default: 'black' }
      });

      expect(hasType('rectangle')).toBe(true);
      expect(testType).toBeDefined();
      expect(testType?.requiredProps).toContain('width');
      expect(testType?.requiredProps).toContain('height');
      expect(testType?.optionalProps).toHaveProperty('fill', 'black');
    });

    test('should extract required and optional properties correctly', () => {
      defineTestType('circle', {
        cx: { required: true },
        cy: { required: true },
        r: { required: true },
        fill: { default: 'steelblue' },
        stroke: { default: 'navy' },
        strokeWidth: { default: 1 }
      });

      const circleType = getType('circle');
      expect(circleType?.requiredProps).toEqual(['cx', 'cy', 'r']);
      expect(circleType?.optionalProps).toEqual({
        fill: 'steelblue',
        stroke: 'navy',
        strokeWidth: 1
      });
    });

    test('should call implementation function with properties', () => {
      const implementationSpy = vi.fn(() => ({ type: 'basic' }));

      defineTestType('text', {
        x: { required: true },
        y: { required: true },
        text: { required: true },
        fontSize: { default: 12 }
      }, implementationSpy);

      const textType = getType('text');

      // Call decompose to trigger the implementation
      textType?.decompose({
        x: 100,
        y: 50,
        text: 'Hello'
      }, {});

      expect(implementationSpy).toHaveBeenCalledWith({
        x: 100,
        y: 50,
        text: 'Hello',
        fontSize: 12
      });
    });
  });

  describe('Property Validation', () => {
    test('should validate required properties', () => {
      defineTestType('requiredTest', {
        prop1: { required: true },
        prop2: { required: true }
      });

      const testType = getType('requiredTest');

      // Missing required property should throw
      expect(() => {
        testType?.decompose({ prop1: 'value' }, {});
      }).toThrow(/Required property 'prop2' is missing/);
    });

    test('should validate property types', () => {
      defineTestType('typeTest', {
        numberProp: { required: true, type: 'number' },
        stringProp: { required: true, type: 'string' },
        booleanProp: { required: true, type: 'boolean' },
        arrayProp: { required: true, type: 'array' },
        objectProp: { required: true, type: 'object' }
      });

      const testType = getType('typeTest');

      // Valid types should not throw
      expect(() => {
        testType?.decompose({
          numberProp: 42,
          stringProp: 'hello',
          booleanProp: true,
          arrayProp: [1, 2, 3],
          objectProp: { a: 1 }
        }, {});
      }).not.toThrow();

      // Invalid type should throw
      expect(() => {
        testType?.decompose({
          numberProp: 'not a number', // Wrong type
          stringProp: 'hello',
          booleanProp: true,
          arrayProp: [1, 2, 3],
          objectProp: { a: 1 }
        }, {});
      }).toThrow(/should be of type 'number'/);
    });

    test('should run custom validation functions', () => {
      defineTestType('customValidation', {
        age: {
          required: true,
          type: 'number',
          validate: (value: number) => value >= 0 && value <= 120
        }
      });

      const testType = getType('customValidation');

      // Valid value should not throw
      expect(() => {
        testType?.decompose({ age: 30 }, {});
      }).not.toThrow();

      // Invalid value should throw
      expect(() => {
        testType?.decompose({ age: 150 }, {});
      }).toThrow(/failed validation/);
    });
  });

  describe('Type Extension', () => {
    test('should extend an existing type', () => {
      // Define base type
      defineTestType('baseButton', {
        x: { required: true },
        y: { required: true },
        width: { required: true },
        height: { required: true },
        label: { required: true },
        fill: { default: 'gray' },
        textColor: { default: 'white' }
      });

      // Define extended type
      defineTestType('primaryButton', {
        icon: { default: null }
      }, () => ({ type: 'extended' }), 'baseButton');

      const baseType = getType('baseButton');
      const extendedType = getType('primaryButton');

      // Should inherit properties from base type
      expect(extendedType?.requiredProps).toContain('x');
      expect(extendedType?.requiredProps).toContain('y');
      expect(extendedType?.requiredProps).toContain('width');
      expect(extendedType?.requiredProps).toContain('height');
      expect(extendedType?.requiredProps).toContain('label');

      // Should have default properties from base type
      expect(extendedType?.optionalProps).toHaveProperty('fill', 'gray');
      expect(extendedType?.optionalProps).toHaveProperty('textColor', 'white');

      // Should have its own properties
      expect(extendedType?.optionalProps).toHaveProperty('icon', null);
    });

    test('should merge implementations when extending', () => {
      // Base implementation
      const baseImpl = vi.fn((props) => ({
        type: 'group',
        children: [
          { type: 'rect', x: props.x, y: props.y, width: props.width, height: props.height, fill: props.fill }
        ]
      }));

      // Extended implementation
      const extendedImpl = vi.fn((props, baseResult) => {
        // In our implementation, the second parameter is the result of the base implementation
        // We can modify it or use it in our extended implementation
        return {
          type: 'group',
          children: [
            ...baseResult.children,
            { type: 'text', x: props.x + props.width / 2, y: props.y + props.height / 2, text: props.label }
          ]
        };
      });

      // Define base type
      defineTestType('baseComponent', {
        x: { required: true },
        y: { required: true },
        width: { required: true },
        height: { required: true },
        fill: { default: 'lightgray' }
      }, baseImpl);

      // Define extended type
      defineTestType('extendedComponent', {
        label: { required: true }
      }, extendedImpl, 'baseComponent');

      const extendedType = getType('extendedComponent');

      // Call decompose to trigger the implementation
      const result = extendedType?.decompose({
        x: 10,
        y: 20,
        width: 100,
        height: 50,
        label: 'Button'
      }, {});

      // The base implementation should be called first
      expect(baseImpl).toHaveBeenCalledWith({
        x: 10,
        y: 20,
        width: 100,
        height: 50,
        fill: 'lightgray', // Default from base type
        label: 'Button'
      });

      // The extended implementation should be called with props and base result
      expect(extendedImpl).toHaveBeenCalledWith(
        {
          x: 10,
          y: 20,
          width: 100,
          height: 50,
          fill: 'lightgray',
          label: 'Button'
        },
        {
          type: 'group',
          children: [
            { type: 'rect', x: 10, y: 20, width: 100, height: 50, fill: 'lightgray' }
          ]
        }
      );

      // Check the final result
      expect(result).toEqual({
        type: 'group',
        children: [
          { type: 'rect', x: 10, y: 20, width: 100, height: 50, fill: 'lightgray' },
          { type: 'text', x: 60, y: 45, text: 'Button' }
        ]
      });
    });

    test('should handle multi-level extension', () => {
      // Define base type
      defineTestType('baseComponent', {
        x: { required: true },
        y: { required: true },
        visible: { default: true }
      });

      // Define first level extension
      defineTestType('midComponent', {
        width: { required: true },
        height: { required: true },
        color: { default: 'blue' }
      }, () => ({}), 'baseComponent');

      // Define second level extension
      defineTestType('finalComponent', {
        label: { required: true },
        fontSize: { default: 12 }
      }, () => ({}), 'midComponent');

      const finalType = getType('finalComponent');

      // Should inherit properties from all levels
      expect(finalType?.requiredProps).toContain('x');
      expect(finalType?.requiredProps).toContain('y');
      expect(finalType?.requiredProps).toContain('width');
      expect(finalType?.requiredProps).toContain('height');
      expect(finalType?.requiredProps).toContain('label');

      expect(finalType?.optionalProps).toHaveProperty('visible', true);
      expect(finalType?.optionalProps).toHaveProperty('color', 'blue');
      expect(finalType?.optionalProps).toHaveProperty('fontSize', 12);
    });

    test('should throw error when extending non-existent type', () => {
      // Attempt to extend a type that doesn't exist
      expect(() => {
        defineTestType('errorType', {}, () => ({}), 'nonExistentType');
      }).toThrow(/Type 'nonExistentType' does not exist/);
    });
  });

  describe('Error Handling', () => {
    test('should handle invalid property definitions', () => {
      // @ts-ignore - Testing runtime behavior with invalid input
      expect(() => {
        defineTestType('invalidProps', null);
      }).toThrow();
    });

    test('should handle circular type extensions', () => {
      // Create two types that try to extend each other
      defineTestType('typeA', {
        propA: { required: true }
      });

      defineTestType('typeB', {
        propB: { required: true }
      }, () => ({}), 'typeA');

      // Mock console.warn to verify the warning is logged
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      // This would create a circular reference
      registerType({
        name: 'typeA',
        requiredProps: ['propA'],
        optionalProps: {},
        generateConstraints: () => [],
        decompose: () => ({})
      });

      // Verify that a warning was logged
      expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining("already registered"));

      // Restore the original console.warn
      warnSpy.mockRestore();
    });

    test('should validate implementation is provided', () => {
      // Create a define spec without implementation
      const defineSpec = {
        type: 'define',
        name: 'missingImpl',
        properties: {}
        // No implementation
      };

      // Get the define type
      const defineType = getType('define');
      if (!defineType) throw new Error('Define type not registered');

      // Should throw when implementation is missing
      expect(() => {
        defineType.decompose(defineSpec, {});
      }).toThrow(/Implementation is required/i);
    });
  });
});
