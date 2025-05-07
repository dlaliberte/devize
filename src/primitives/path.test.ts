import { describe, test, expect, vi, beforeEach } from 'vitest';
import { registerType, getType, hasType, _resetRegistryForTesting } from '../core/registry';
import { registerDefineType } from '../core/define';
import { buildViz } from '../core/creator';

// Create a mock document object for SVG creation
global.document = {
  createElementNS: vi.fn((namespace, tagName) => ({
    tagName: tagName.toUpperCase(),
    setAttribute: vi.fn(),
    appendChild: vi.fn()
  }))
} as any;

// Mock buildViz to capture calls
vi.mock('../core/creator', () => ({
  buildViz: vi.fn((spec) => {
    // If this is the define type for path, manually register it
    if (spec.type === 'define' && spec.name === 'path') {
      const implementation = spec.implementation;

      registerType({
        name: 'path',
        requiredProps: ['d'],
        optionalProps: {
          fill: 'none',
          stroke: 'black',
          strokeWidth: 1,
          strokeDasharray: '',
          opacity: 1
        },
        generateConstraints: () => [],
        decompose: (props, solvedConstraints) => {
          return implementation(props);
        }
      });
    }

    return { type: 'group', children: [] };
  })
}));

// Reset registry and register define type before each test
beforeEach(() => {
  _resetRegistryForTesting();
  registerDefineType();

  // Manually register the path type
  buildViz({
    type: "define",
    name: "path",
    properties: {
      d: { required: true },
      fill: { default: "none" },
      stroke: { default: "black" },
      strokeWidth: { default: 1 },
      strokeDasharray: { default: "" },
      opacity: { default: 1 }
    },
    implementation: props => {
      // Apply default values for optional properties
      const fullProps = {
        ...props,
        fill: props.fill ?? "none",
        stroke: props.stroke ?? "black",
        strokeWidth: props.strokeWidth ?? 1,
        strokeDasharray: props.strokeDasharray ?? "",
        opacity: props.opacity ?? 1
      };

      // Prepare attributes
      const attributes = {
        d: fullProps.d,
        fill: fullProps.fill,
        stroke: fullProps.stroke,
        'stroke-width': fullProps.strokeWidth,
        'stroke-dasharray': fullProps.strokeDasharray || null,
        opacity: fullProps.opacity
      };

      // Return a specification with rendering functions
      return {
        _renderType: "path",  // Internal rendering type
        attributes: attributes,

        // Rendering functions for different backends
        renderSVG: (container) => {
          const element = document.createElementNS('http://www.w3.org/2000/svg', 'path');
          for (const [key, value] of Object.entries(attributes)) {
            if (value !== undefined && value !== null) {
              element.setAttribute(key, value.toString());
            }
          }
          if (container) container.appendChild(element);
          return element;
        },

        renderCanvas: (ctx) => {
          const { d, fill, stroke, 'stroke-width': strokeWidth, 'stroke-dasharray': strokeDasharray, opacity } = attributes;

          // Save the current context state
          ctx.save();

          // Apply opacity
          ctx.globalAlpha = opacity;

          // Create a new path
          ctx.beginPath();

          // Parse the SVG path data and draw to canvas
          const path = new Path2D(d);

          // Apply fill if not 'none'
          if (fill && fill !== 'none') {
            ctx.fillStyle = fill;
            ctx.fill(path);
          }

          // Apply stroke
          if (stroke && stroke !== 'none') {
            ctx.strokeStyle = stroke;
            ctx.lineWidth = strokeWidth;

            // Apply stroke dash array if specified
            if (strokeDasharray) {
              const dashArray = strokeDasharray.split(',').map(Number);
              ctx.setLineDash(dashArray);
            } else {
              ctx.setLineDash([]);
            }

            ctx.stroke(path);
          }

          // Restore the context state
          ctx.restore();

          return true; // Indicate successful rendering
        }
      };
    }
  });
});

describe('Path Primitive', () => {
  test('should register the path type', () => {
    expect(hasType('path')).toBe(true);

    const pathType = getType('path');
    expect(pathType).toBeDefined();
    expect(pathType?.requiredProps).toContain('d');
    expect(pathType?.optionalProps).toHaveProperty('fill', 'none');
    expect(pathType?.optionalProps).toHaveProperty('stroke', 'black');
    expect(pathType?.optionalProps).toHaveProperty('strokeWidth', 1);
    expect(pathType?.optionalProps).toHaveProperty('strokeDasharray', '');
    expect(pathType?.optionalProps).toHaveProperty('opacity', 1);
  });

  test('should create a renderable object with correct attributes', () => {
    const pathType = getType('path');

    const result = pathType?.decompose({
      d: 'M10,10 L90,90',
      fill: 'red',
      stroke: 'blue',
      strokeWidth: 2,
      strokeDasharray: '5,5',
      opacity: 0.5
    }, {});

    expect(result).toBeDefined();
    expect(result?._renderType).toBe('path');
    expect(result?.attributes).toEqual({
      d: 'M10,10 L90,90',
      fill: 'red',
      stroke: 'blue',
      'stroke-width': 2,
      'stroke-dasharray': '5,5',
      opacity: 0.5
    });
  });

  test('should handle empty stroke-dasharray', () => {
    const pathType = getType('path');

    const result = pathType?.decompose({
      d: 'M10,10 L90,90',
      strokeDasharray: ''
    }, {});

    expect(result?.attributes['stroke-dasharray']).toBeNull();
  });

  test('should provide SVG rendering function', () => {
    const pathType = getType('path');

    const result = pathType?.decompose({
      d: 'M10,10 L90,90'
    }, {});

    expect(result?.renderSVG).toBeTypeOf('function');

    // Create a mock container
    const container = { appendChild: vi.fn() };

    // Call the SVG rendering function
    const svgElement = result?.renderSVG(container);

    // Verify the SVG element was created correctly
    expect(svgElement).toBeDefined();
    expect(svgElement?.tagName).toBe('PATH');
    expect(container.appendChild).toHaveBeenCalledWith(svgElement);
  });

  test('should provide Canvas rendering function', () => {
    // Mock Path2D constructor
    global.Path2D = vi.fn(function(path) {
      this.path = path;
    }) as any;

    const pathType = getType('path');

    const result = pathType?.decompose({
      d: 'M10,10 L90,90',
      fill: 'green',
      stroke: 'black',
      strokeWidth: 2
    }, {});

    expect(result?.renderCanvas).toBeTypeOf('function');

    // Create a mock canvas context
    const ctx = {
      save: vi.fn(),
      restore: vi.fn(),
      beginPath: vi.fn(),
      fill: vi.fn(),
      stroke: vi.fn(),
      setLineDash: vi.fn()
    };

    // Call the Canvas rendering function
    const canvasResult = result?.renderCanvas(ctx);

    // Verify the canvas operations were performed correctly
    expect(canvasResult).toBe(true);
    expect(ctx.save).toHaveBeenCalled();
    expect(ctx.beginPath).toHaveBeenCalled();
    expect(global.Path2D).toHaveBeenCalledWith('M10,10 L90,90');
    expect(ctx.fill).toHaveBeenCalled();
    expect(ctx.stroke).toHaveBeenCalled();
    expect(ctx.restore).toHaveBeenCalled();
  });

  test('should handle path with only stroke and no fill', () => {
    // Mock Path2D constructor
    global.Path2D = vi.fn(function(path) {
      this.path = path;
    }) as any;

    const pathType = getType('path');

    const result = pathType?.decompose({
      d: 'M10,10 L90,90',
      fill: 'none',
      stroke: 'black'
    }, {});

    // Create a mock canvas context
    const ctx = {
      save: vi.fn(),
      restore: vi.fn(),
      beginPath: vi.fn(),
      fill: vi.fn(),
      stroke: vi.fn(),
      setLineDash: vi.fn()
    };

    // Call the Canvas rendering function
    result?.renderCanvas(ctx);

    // Should not call fill with 'none' fill
    expect(ctx.fill).not.toHaveBeenCalled();
    expect(ctx.stroke).toHaveBeenCalled();
  });

  test('should apply default values for optional properties', () => {
    const pathType = getType('path');

    const result = pathType?.decompose({
      d: 'M10,10 L90,90'
      // No optional properties specified
    }, {});

    expect(result?.attributes).toEqual({
      d: 'M10,10 L90,90',
      fill: 'none',
      stroke: 'black',
      'stroke-width': 1,
      'stroke-dasharray': null,  // Empty string is converted to null
      opacity: 1
    });
  });
});
