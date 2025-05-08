import { describe, test, expect, beforeEach, vi, afterEach, it } from 'vitest';
import { buildViz } from './builder';
import { registerType, getType, hasType, registry } from './registry';
import { TypeDefinition, VisualizationSpec, RenderableVisualization } from './types';


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

// Create a simple test primitive for testing
function registerTestPrimitive() {
  const testPrimitiveDefinition: TypeDefinition = {
    name: 'testPrimitive',
    properties: {
      width: { required: true },
      height: { required: true },
      fill: { default: 'black' }
    },
    implementation: (spec) => {
      // Create a renderable visualization
      const renderable: RenderableVisualization = {
        renderableType: 'testPrimitive',

        render: (container: HTMLElement) => {
          const element = document.createElement('div');
          element.style.width = `${spec.width}px`;
          element.style.height = `${spec.height}px`;
          element.style.backgroundColor = spec.fill;
          container.appendChild(element);

          return {
            element,
            update: (newSpec: VisualizationSpec) => {
              const updatedViz = renderable.update(newSpec);
              return updatedViz.render(container);
            },
            cleanup: () => {
              if (element.parentNode) {
                element.parentNode.removeChild(element);
              }
            }
          };
        },

        renderToSvg: (svg: SVGElement) => {
          const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
          rect.setAttribute('width', spec.width);
          rect.setAttribute('height', spec.height);
          rect.setAttribute('fill', spec.fill);
          svg.appendChild(rect);
          return rect;
        },

        renderToCanvas: (ctx: CanvasRenderingContext2D) => {
          ctx.fillStyle = spec.fill;
          ctx.fillRect(0, 0, spec.width, spec.height);
        },

        update: (newSpec: VisualizationSpec) => {
          return buildViz({ ...spec, ...newSpec });
        },

        getProperty: (name: string) => {
          return spec[name];
        }
      };

      return renderable;
    }
  };

  registerType(testPrimitiveDefinition);
}



// Create a test primitive with custom validation
function registerValidatedPrimitive() {
  const validatedPrimitiveDefinition: TypeDefinition = {
    name: 'validatedPrimitive',
    properties: {
      width: { required: true },
      height: { required: true },
      fill: { default: 'black' }
    },
    // Add a custom validation function
    validate: (spec) => {
      if (spec.width <= 0 || spec.height <= 0) {
        throw new Error('Width and height must be positive');
      }
      if (spec.width > 1000 || spec.height > 1000) {
        throw new Error('Width and height must be less than or equal to 1000');
      }
    },
    implementation: (spec) => {
      // Create a renderable visualization
      const renderable: RenderableVisualization = {
        renderableType: 'validatedPrimitive',

        render: (container: HTMLElement) => {
          const element = document.createElement('div');
          element.style.width = `${spec.width}px`;
          element.style.height = `${spec.height}px`;
          element.style.backgroundColor = spec.fill;
          container.appendChild(element);

          return {
            element,
            update: (newSpec: VisualizationSpec) => {
              const updatedViz = renderable.update(newSpec);
              return updatedViz.render(container);
            },
            cleanup: () => {
              if (element.parentNode) {
                element.parentNode.removeChild(element);
              }
            }
          };
        },

        renderToSvg: (svg: SVGElement) => {
          const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
          rect.setAttribute('width', spec.width);
          rect.setAttribute('height', spec.height);
          rect.setAttribute('fill', spec.fill);
          svg.appendChild(rect);
          return rect;
        },

        renderToCanvas: (ctx: CanvasRenderingContext2D) => {
          ctx.fillStyle = spec.fill;
          ctx.fillRect(0, 0, spec.width, spec.height);
        },

        update: (newSpec: VisualizationSpec) => {
          return buildViz({ ...spec, ...newSpec });
        },

        getProperty: (name: string) => {
          return spec[name];
        }
      };

      return renderable;
    }
  };

  registerType(validatedPrimitiveDefinition);
}



// Register a simple group primitive for testing
function registerGroupPrimitive() {
  const groupDefinition: TypeDefinition = {
    name: 'testGroup',
    properties: {
      children: { default: [] }
    },
    implementation: (spec) => {
      // Process children - this is the key part for testing recursive building
      const children = Array.isArray(spec.children)
        ? spec.children.map(child => {
            if (typeof child === 'object' && child !== null) {
              return buildViz(child);
            }
            return child;
          })
        : [];

      // Create a renderable visualization with minimal implementation
      const renderable: RenderableVisualization = {
        renderableType: 'group',

        render: (container: HTMLElement) => {
          const element = document.createElement('div');
          container.appendChild(element);
          return {
            element,
            update: () => ({ element: null }),
            cleanup: () => {}
          };
        },

        renderToSvg: (svg: SVGElement) => {
          return document.createElementNS('http://www.w3.org/2000/svg', 'g');
        },

        renderToCanvas: (ctx: CanvasRenderingContext2D) => {
          // Minimal implementation
        },

        update: (newSpec: VisualizationSpec) => {
          return buildViz({ ...spec, ...newSpec });
        },

        getProperty: (name: string) => {
          if (name === 'children') {
            return children;
          }
          return spec[name];
        }
      };

      return renderable;
    }
  };

  registerType(groupDefinition);
}

// Reset the registry before each test
beforeEach(() => {
  // This is a bit of a hack for testing - in a real implementation
  // we would have a way to reset the registry for tests
  (registry as any).types = new Map();

  // Register our test primitives
  registerTestPrimitive();
  registerValidatedPrimitive();
  registerGroupPrimitive(); // Add our simplified group primitive
});

// Clean up after tests
afterEach(() => {
  vi.restoreAllMocks();
});

describe('Visualization Builder', () => {
  describe('Basic Creation', () => {
    it('should return already processed objects unchanged', () => {
      // Create a visualization using our test primitive
      const spec = {
        type: 'testPrimitive',
        width: 100,
        height: 50,
        fill: 'blue'
      };

      // Build the visualization
      const processedObject = buildViz(spec);

      // Verify it has the expected structure
      // This processed object is not a testPrimitive, but renderable form of testPrimitive.
      expect(processedObject.renderableType).toBe('testPrimitive');
      expect(processedObject.render).toBeDefined();
      expect(processedObject.renderToSvg).toBeDefined();
      expect(processedObject.renderToCanvas).toBeDefined();
      expect(processedObject.update).toBeDefined();
      expect(processedObject.getProperty).toBeDefined();

      // Now pass the processed object back to buildViz
      const result = buildViz(processedObject);

      // It should return the same object unchanged
      expect(result).toBe(processedObject);
    });

    it('should process a visualization specification', () => {
      // Create a visualization using our test primitive
      const spec = {
        type: 'testPrimitive',
        width: 100,
        height: 50,
        fill: 'blue'
      };

      // Build the visualization
      const result = buildViz(spec);

      // Result should have rendering functions
      expect(result.render).toBeDefined();
      expect(result.renderToSvg).toBeDefined();
      expect(result.renderToCanvas).toBeDefined();
      expect(result.renderableType).toBe('testPrimitive');

      // Check properties using getProperty
      expect(result.getProperty('type')).toBe('testPrimitive');
      expect(result.getProperty('width')).toBe(100);
      expect(result.getProperty('height')).toBe(50);
      expect(result.getProperty('fill')).toBe('blue');
    });
  });

  describe('Default Values', () => {
    it('should apply default values for optional properties', () => {
      // Create a visualization with only required properties
      const spec = {
        type: 'testPrimitive',
        width: 100,
        height: 50
        // 'fill' is omitted, should use default value
      };

      const result = buildViz(spec);

      // Should include default values in the properties
      expect(result.getProperty('fill')).toBe('black'); // Default value from testPrimitive
    });

    it('should not override provided values with defaults', () => {
      // Create a visualization with custom values for optional properties
      const spec = {
        type: 'testPrimitive',
        width: 100,
        height: 50,
        fill: 'red' // Custom value, should not be overridden by default
      };

      const result = buildViz(spec);

      // Should keep custom values
      expect(result.getProperty('fill')).toBe('red');
    });
  });

  describe('Validation', () => {
    it('should validate required properties', () => {
      // Should throw when missing required properties
      expect(() => {
        buildViz({
          type: 'testPrimitive',
          // Missing width and height, which are required
          fill: 'blue'
        });
      }).toThrow(/Required property/);
    });

    it('should call custom validation function if available', () => {
      // Valid spec should not throw
      const validResult = buildViz({
        type: 'validatedPrimitive',
        width: 100,
        height: 50
      });
      expect(validResult).toBeDefined();

      // Invalid spec - negative dimensions
      expect(() => {
        buildViz({
          type: 'validatedPrimitive',
          width: -10,
          height: 50
        });
      }).toThrow(/Width and height must be positive/);

      // Invalid spec - dimensions too large
      expect(() => {
        buildViz({
          type: 'validatedPrimitive',
          width: 100,
          height: 1500
        });
      }).toThrow(/Width and height must be less than or equal to 1000/);
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
    it('should register a new type when processing a define spec', () => {
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

          // Return a renderable visualization -
          const renderable: RenderableVisualization = {
            renderableType: 'define',
            render: () => ({ element: document.createElement('div'), update: () => ({ element: null }), cleanup: () => {} }),
            renderToSvg: () => document.createElementNS('http://www.w3.org/2000/svg', 'g'),
            renderToCanvas: () => {},
            update: () => renderable,
            getProperty: (name) => props[name]
          };

          return renderable;
        }
      });

      // Define a new type
      const result = buildViz({
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

      // Verify the result is a renderable visualization
      expect(result).toBeDefined();
      expect(result.renderableType).toBe('define');

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
    it('should handle nested visualizations', () => {
      // Create a group with nested visualizations
      const spec = {
        type: 'testGroup',
        children: [
          {
            type: 'testPrimitive',
            width: 100,
            height: 50,
            fill: 'blue'
          },
          {
            type: 'testGroup',
            children: [
              {
                type: 'testPrimitive',
                width: 200,
                height: 100,
                fill: 'red'
              }
            ]
          }
        ]
      };

      // Build the visualization
      const result = buildViz(spec);

      // Verify the top-level group
      expect(result).toBeDefined();
      expect(result.renderableType).toBe('testGroup');

      // Check that children were processed
      const children = result.getProperty('children');
      expect(Array.isArray(children)).toBe(true);
      expect(children.length).toBe(2);

      // Check first child (testPrimitive)
      const firstChild = children[0];
      expect(firstChild.renderableType).toBe('testPrimitive');
      expect(firstChild.getProperty('width')).toBe(100);
      expect(firstChild.getProperty('height')).toBe(50);
      expect(firstChild.getProperty('fill')).toBe('blue');

      // Check second child (nested group)
      const secondChild = children[1];
      expect(secondChild.renderableType).toBe('testGroup');

      // Check nested group's children
      const nestedChildren = secondChild.getProperty('children');
      expect(Array.isArray(nestedChildren)).toBe(true);
      expect(nestedChildren.length).toBe(1);

      // Check nested primitive
      const nestedPrimitive = nestedChildren[0];
      expect(nestedPrimitive.renderableType).toBe('testPrimitive');
      expect(nestedPrimitive.getProperty('width')).toBe(200);
      expect(nestedPrimitive.getProperty('height')).toBe(100);
      expect(nestedPrimitive.getProperty('fill')).toBe('red');
    });

  });
});
