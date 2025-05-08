import { describe, test, expect, vi, beforeEach } from 'vitest';
import { registry, hasType, getType } from '../core/registry';
import { circleTypeDefinition, registerCirclePrimitive } from './circle';
import { buildViz } from '../core/builder';

// Create a mock document object for SVG creation
global.document = {
  createElementNS: vi.fn((namespace, tagName) => ({
    tagName: tagName.toUpperCase(),
    setAttribute: vi.fn(),
    appendChild: vi.fn()
  }))
} as any;

describe('Circle Primitive', () => {
  // Reset registry before each test
  beforeEach(() => {
    // Reset the registry for clean tests
    (registry as any).types = new Map();

    // Register the circle primitive
    registerCirclePrimitive();
  });

  test('should register the circle type', () => {
    expect(hasType('circle')).toBe(true);

    const circleType = getType('circle');
    expect(circleType).toBeDefined();
    expect(circleType?.properties.cx.required).toBe(true);
    expect(circleType?.properties.cy.required).toBe(true);
    expect(circleType?.properties.r.required).toBe(true);
    expect(circleType?.properties.fill.default).toBe('none');
    expect(circleType?.properties.stroke.default).toBe('black');
    expect(circleType?.properties.strokeWidth.default).toBe(1);
  });

  test('should validate radius is positive', () => {
    // Should throw for non-positive radius
    expect(() => {
      buildViz({
        type: "circle",
        cx: 100,
        cy: 100,
        r: 0
      });
    }).toThrow('Circle radius must be positive');

    expect(() => {
      buildViz({
        type: "circle",
        cx: 100,
        cy: 100,
        r: -10
      });
    }).toThrow('Circle radius must be positive');

    // Should not throw for positive radius
    expect(() => {
      buildViz({
        type: "circle",
        cx: 100,
        cy: 100,
        r: 50
      });
    }).not.toThrow();
  });

  test('should create a renderable object with correct attributes', () => {
    const result = buildViz({
      type: "circle",
      cx: 100,
      cy: 150,
      r: 50,
      fill: 'red',
      stroke: 'blue',
      strokeWidth: 2
    });

    expect(result).toBeDefined();
    expect(result.type).toBe('circle');

    // Access the internal implementation result
    const impl = result.renderToSvg(document.createElementNS('', 'g'));
    expect(impl).toBeDefined();
  });

  test('should provide SVG rendering function', () => {
    const result = buildViz({
      type: "circle",
      cx: 100,
      cy: 150,
      r: 50
    });

    // Create a mock container
    const container = document.createElementNS('', 'g');
    const svgElement = result.renderToSvg(container);

    // Verify the SVG element was created correctly
    expect(svgElement).toBeDefined();
  });

  test('should provide Canvas rendering function', () => {
    // Create a more complete mock canvas context
    const ctx = {
      beginPath: vi.fn(),
      arc: vi.fn(),
      fill: vi.fn(),
      stroke: vi.fn(),
      save: vi.fn(),
      restore: vi.fn(),
      fillStyle: '',
      strokeStyle: '',
      lineWidth: 0
    };

    // Get the implementation function
    const impl = circleTypeDefinition.implementation({
      cx: 100,
      cy: 150,
      r: 50,
      fill: 'green',
      stroke: 'black',
      strokeWidth: 2
    });

    // Call the Canvas rendering function directly
    impl.renderCanvas(ctx);

    // Verify the canvas operations were performed correctly
    expect(ctx.beginPath).toHaveBeenCalled();
    expect(ctx.arc).toHaveBeenCalledWith(100, 150, 50, 0, Math.PI * 2);
  });

  test('should apply default values for optional properties', () => {
    const result = buildViz({
      type: "circle",
      cx: 100,
      cy: 150,
      r: 50
      // No optional properties specified
    });

    // Should have default values
    expect(result.spec.fill).toBe('none');
    expect(result.spec.stroke).toBe('black');
    expect(result.spec.strokeWidth).toBe(1);
  });

  test('should match the exported type definition', () => {
    // Verify that the exported type definition matches what's registered
    expect(circleTypeDefinition.type).toBe('define');
    expect(circleTypeDefinition.name).toBe('circle');
    expect(circleTypeDefinition.properties).toBeDefined();
    expect(circleTypeDefinition.implementation).toBeDefined();

    // Compare with the registered type
    const registeredType = getType('circle');
    expect(registeredType?.properties).toEqual(circleTypeDefinition.properties);
  });
});
