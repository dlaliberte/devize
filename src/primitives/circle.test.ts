import { describe, test, expect, vi, beforeEach } from 'vitest';
import { registerType, getType, hasType, _resetRegistryForTesting } from '../core/registry';
import { registerDefineType } from '../core/define';

// Create a mock document object for SVG creation
global.document = {
  createElementNS: vi.fn((namespace, tagName) => ({
    tagName: tagName.toUpperCase(),
    setAttribute: vi.fn(),
    appendChild: vi.fn()
  }))
} as any;

// Reset registry and register define type before each test
beforeEach(() => {
  _resetRegistryForTesting();
  registerDefineType();

  // Manually register the circle type
  registerType({
    name: "circle",
    requiredProps: ["cx", "cy", "r"],
    optionalProps: {
      fill: "none",
      stroke: "black",
      strokeWidth: 1
    },
    generateConstraints: () => [],
    decompose: (props, solvedConstraints) => {
      // Validation
      if (props.r <= 0) {
        throw new Error('Circle radius must be positive');
      }

      // Apply default values for optional properties
      const fullProps = {
        ...props,
        fill: props.fill ?? "none",
        stroke: props.stroke ?? "black",
        strokeWidth: props.strokeWidth ?? 1
      };

      // Prepare attributes
      const attributes = {
        cx: fullProps.cx,
        cy: fullProps.cy,
        r: fullProps.r,
        fill: fullProps.fill,
        stroke: fullProps.stroke,
        'stroke-width': fullProps.strokeWidth
      };

      // Return a specification with rendering functions
      return {
        _renderType: "circle",  // Internal rendering type
        attributes: attributes,

        // Rendering functions for different backends
        renderSVG: (container) => {
          const element = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
          for (const [key, value] of Object.entries(attributes)) {
            if (value !== undefined && value !== null) {
              element.setAttribute(key, value.toString());
            }
          }
          if (container) container.appendChild(element);
          return element;
        },

        renderCanvas: (ctx) => {
          const { cx, cy, r, fill, stroke, 'stroke-width': strokeWidth } = attributes;

          ctx.beginPath();
          ctx.arc(cx, cy, r, 0, Math.PI * 2);

          if (fill !== 'none') {
            ctx.fillStyle = fill;
            ctx.fill();
          }

          if (stroke !== 'none') {
            ctx.strokeStyle = stroke;
            ctx.lineWidth = strokeWidth;
            ctx.stroke();
          }

          return true; // Indicate successful rendering
        }
      };
    }
  });
});

describe('Circle Primitive', () => {
  test('should register the circle type', () => {
    expect(hasType('circle')).toBe(true);

    const circleType = getType('circle');
    expect(circleType).toBeDefined();
    expect(circleType?.requiredProps).toContain('cx');
    expect(circleType?.requiredProps).toContain('cy');
    expect(circleType?.requiredProps).toContain('r');
    expect(circleType?.optionalProps).toHaveProperty('fill', 'none');
    expect(circleType?.optionalProps).toHaveProperty('stroke', 'black');
    expect(circleType?.optionalProps).toHaveProperty('strokeWidth', 1);
  });

  test('should validate radius is positive', () => {
    const circleType = getType('circle');

    // Should throw for non-positive radius
    expect(() => {
      circleType?.decompose({
        cx: 100,
        cy: 100,
        r: 0
      }, {});
    }).toThrow('Circle radius must be positive');

    expect(() => {
      circleType?.decompose({
        cx: 100,
        cy: 100,
        r: -10
      }, {});
    }).toThrow('Circle radius must be positive');

    // Should not throw for positive radius
    expect(() => {
      circleType?.decompose({
        cx: 100,
        cy: 100,
        r: 50
      }, {});
    }).not.toThrow();
  });

  test('should create a renderable object with correct attributes', () => {
    const circleType = getType('circle');

    const result = circleType?.decompose({
      cx: 100,
      cy: 150,
      r: 50,
      fill: 'red',
      stroke: 'blue',
      strokeWidth: 2
    }, {});

    expect(result).toBeDefined();
    expect(result?._renderType).toBe('circle');
    expect(result?.attributes).toEqual({
      cx: 100,
      cy: 150,
      r: 50,
      fill: 'red',
      stroke: 'blue',
      'stroke-width': 2
    });
  });

  test('should provide SVG rendering function', () => {
    const circleType = getType('circle');

    const result = circleType?.decompose({
      cx: 100,
      cy: 150,
      r: 50
    }, {});

    expect(result?.renderSVG).toBeTypeOf('function');

    // Create a mock container
    const container = { appendChild: vi.fn() };

    // Call the SVG rendering function
    const svgElement = result?.renderSVG(container);

    // Verify the SVG element was created correctly
    expect(svgElement).toBeDefined();
    expect(svgElement?.tagName).toBe('CIRCLE');
    expect(container.appendChild).toHaveBeenCalledWith(svgElement);
  });

  test('should provide Canvas rendering function', () => {
    const circleType = getType('circle');

    const result = circleType?.decompose({
      cx: 100,
      cy: 150,
      r: 50,
      fill: 'green',
      stroke: 'black',
      strokeWidth: 2
    }, {});

    expect(result?.renderCanvas).toBeTypeOf('function');

    // Create a mock canvas context
    const ctx = {
      beginPath: vi.fn(),
      arc: vi.fn(),
      fill: vi.fn(),
      stroke: vi.fn()
    };

    // Call the Canvas rendering function
    const canvasResult = result?.renderCanvas(ctx);

    // Verify the canvas operations were performed correctly
    expect(canvasResult).toBe(true);
    expect(ctx.beginPath).toHaveBeenCalled();
    expect(ctx.arc).toHaveBeenCalledWith(100, 150, 50, 0, Math.PI * 2);
    expect(ctx.fill).toHaveBeenCalled();
    expect(ctx.stroke).toHaveBeenCalled();
  });

  test('should apply default values for optional properties', () => {
    const circleType = getType('circle');

    const result = circleType?.decompose({
      cx: 100,
      cy: 150,
      r: 50
      // No optional properties specified
    }, {});

    expect(result?.attributes).toEqual({
      cx: 100,
      cy: 150,
      r: 50,
      fill: 'none',
      stroke: 'black',
      'stroke-width': 1
    });
  });
});
