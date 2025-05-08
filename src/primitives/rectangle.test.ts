/**
 * Rectangle Primitive Tests
 *
 * Purpose: Tests the rectangle primitive visualization
 * Author: [Author Name]
 * Creation Date: [Date]
 * Last Modified: [Date]
 */

import { describe, test, expect, vi, beforeEach } from 'vitest';
import { registry, hasType, getType } from '../core/registry';
import { rectangleTypeDefinition, registerRectanglePrimitive } from './rectangle';
import { buildViz } from '../core/builder';

// Create a mock document object for SVG creation
global.document = {
  createElementNS: vi.fn((namespace, tagName) => ({
    tagName: tagName.toUpperCase(),
    setAttribute: vi.fn(),
    appendChild: vi.fn()
  }))
} as any;

describe('Rectangle Primitive', () => {
  // Reset registry before each test
  beforeEach(() => {
    // Reset the registry for clean tests
    (registry as any).types = new Map();

    // Register the rectangle primitive
    registerRectanglePrimitive();
  });

  test('should register the rectangle type', () => {
    expect(hasType('rectangle')).toBe(true);

    const rectType = getType('rectangle');
    expect(rectType).toBeDefined();
    expect(rectType?.properties.width.required).toBe(true);
    expect(rectType?.properties.height.required).toBe(true);
    expect(rectType?.properties.x.default).toBe(0);
    expect(rectType?.properties.y.default).toBe(0);
    expect(rectType?.properties.fill.default).toBe('none');
    expect(rectType?.properties.stroke.default).toBe('black');
    expect(rectType?.properties.strokeWidth.default).toBe(1);
    expect(rectType?.properties.cornerRadius.default).toBe(0);
  });

  test('should validate width and height are positive', () => {
    // Should throw for non-positive width
    expect(() => {
      buildViz({
        type: "rectangle",
        width: 0,
        height: 100
      });
    }).toThrow('Rectangle width and height must be positive');

    // Should throw for non-positive height
    expect(() => {
      buildViz({
        type: "rectangle",
        width: 100,
        height: -10
      });
    }).toThrow('Rectangle width and height must be positive');

    // Should not throw for positive dimensions
    expect(() => {
      buildViz({
        type: "rectangle",
        width: 100,
        height: 50
      });
    }).not.toThrow();
  });

  test('should create a renderable object with correct attributes', () => {
    const result = buildViz({
      type: "rectangle",
      x: 10,
      y: 20,
      width: 100,
      height: 50,
      fill: 'red',
      stroke: 'blue',
      strokeWidth: 2,
      cornerRadius: 5
    });

    expect(result).toBeDefined();
    expect(result.type).toBe('rectangle');

    // Access the internal implementation result
    const impl = result.renderToSvg(document.createElementNS('', 'g'));
    expect(impl).toBeDefined();
  });

  test('should provide SVG rendering function', () => {
    const result = buildViz({
      type: "rectangle",
      width: 100,
      height: 50
    });

    // Create a mock container
    const container = document.createElementNS('', 'g');
    const svgElement = result.renderToSvg(container);

    // Verify the SVG element was created correctly
    expect(svgElement).toBeDefined();
  });

  test('should provide Canvas rendering function for regular rectangle', () => {
    // Create a more complete mock canvas context
    const ctx = {
      beginPath: vi.fn(),
      rect: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      arcTo: vi.fn(),
      fill: vi.fn(),
      stroke: vi.fn(),
      fillStyle: '',
      strokeStyle: '',
      lineWidth: 0
    };

    // Get the implementation function
    const impl = rectangleTypeDefinition.implementation({
      x: 10,
      y: 20,
      width: 100,
      height: 50,
      fill: 'green',
      stroke: 'black',
      strokeWidth: 2
      // No corner radius specified (should default to 0)
    });

    // Call the Canvas rendering function directly
    impl.renderCanvas(ctx);

    // Verify the canvas operations were performed correctly
    expect(ctx.beginPath).toHaveBeenCalled();
    expect(ctx.rect).toHaveBeenCalledWith(10, 20, 100, 50);
    expect(ctx.fill).toHaveBeenCalled();
    expect(ctx.stroke).toHaveBeenCalled();

    // Should not use rounded rectangle methods
    expect(ctx.moveTo).not.toHaveBeenCalled();
    expect(ctx.arcTo).not.toHaveBeenCalled();
  });

  test('should provide Canvas rendering function for rounded rectangle', () => {
    // Create a more complete mock canvas context
    const ctx = {
      beginPath: vi.fn(),
      rect: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      arcTo: vi.fn(),
      fill: vi.fn(),
      stroke: vi.fn(),
      fillStyle: '',
      strokeStyle: '',
      lineWidth: 0
    };

    // Get the implementation function
    const impl = rectangleTypeDefinition.implementation({
      x: 10,
      y: 20,
      width: 100,
      height: 50,
      cornerRadius: 10,
      fill: 'orange'
    });

    // Call the Canvas rendering function directly
    impl.renderCanvas(ctx);

    // Verify the canvas operations were performed correctly
    expect(ctx.beginPath).toHaveBeenCalled();

    // Should use rounded rectangle methods
    expect(ctx.moveTo).toHaveBeenCalled();
    expect(ctx.lineTo).toHaveBeenCalled();
    expect(ctx.arcTo).toHaveBeenCalled();

    // Should not use regular rectangle method
    expect(ctx.rect).not.toHaveBeenCalled();

    expect(ctx.fill).toHaveBeenCalled();
    expect(ctx.stroke).toHaveBeenCalled();
  });

  test('should apply default values for optional properties', () => {
    const result = buildViz({
      type: "rectangle",
      width: 100,
      height: 50
      // No optional properties specified
    });

    // Should have default values
    expect(result.spec.x).toBe(0);
    expect(result.spec.y).toBe(0);
    expect(result.spec.fill).toBe('none');
    expect(result.spec.stroke).toBe('black');
    expect(result.spec.strokeWidth).toBe(1);
    expect(result.spec.cornerRadius).toBe(0);
  });

  test('should match the exported type definition', () => {
    // Verify that the exported type definition matches what's registered
    expect(rectangleTypeDefinition.type).toBe('define');
    expect(rectangleTypeDefinition.name).toBe('rectangle');
    expect(rectangleTypeDefinition.properties).toBeDefined();
    expect(rectangleTypeDefinition.implementation).toBeDefined();

    // Compare with the registered type
    const registeredType = getType('rectangle');
    expect(registeredType?.properties).toEqual(rectangleTypeDefinition.properties);
  });
});

/**
 * References:
 * - Related File: src/primitives/rectangle.ts
 * - Related File: src/core/define.ts
 * - Related File: src/core/registry.ts
 * - Related File: src/core/builder.ts
 * - Related File: src/core/devize.ts
 * - Related File: src/renderers/svgUtils.ts
 * - Related File: src/primitives/circle.ts
 * - Design Document: design/define.md
 * - Design Document: design/primitives.md
 * - Design Document: design/rendering.md
 * - User Documentation: docs/primitives/shapes.md
 */
