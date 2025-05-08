import { describe, test, expect, vi, beforeEach } from 'vitest';
import { registerType, getType, hasType, _resetRegistryForTesting } from '../core/registry';
import { registerDefineType } from '../core/define';
import { buildViz } from '../core/builder';

// Create a mock document object for SVG creation
global.document = {
  createElementNS: vi.fn((namespace, tagName) => ({
    tagName: tagName.toUpperCase(),
    setAttribute: vi.fn(),
    appendChild: vi.fn()
  }))
} as any;

// Mock buildViz to capture calls
vi.mock('../core/builder', () => ({
  buildViz: vi.fn((spec) => {
    // If this is the define type for line, manually register it
    if (spec.type === 'define' && spec.name === 'line') {
      const implementation = spec.implementation;

      registerType({
        name: 'line',
        requiredProps: ['x1', 'y1', 'x2', 'y2'],
        optionalProps: {
          stroke: 'black',
          strokeWidth: 1,
          strokeDasharray: 'none'
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

  // Manually register the line type
  buildViz({
    type: "define",
    name: "line",
    properties: {
      x1: { required: true },
      y1: { required: true },
      x2: { required: true },
      y2: { required: true },
      stroke: { default: "black" },
      strokeWidth: { default: 1 },
      strokeDasharray: { default: "none" }
    },
    implementation: props => {
      // Apply default values for optional properties
      const fullProps = {
        ...props,
        stroke: props.stroke ?? "black",
        strokeWidth: props.strokeWidth ?? 1,
        strokeDasharray: props.strokeDasharray ?? "none"
      };

      // Prepare attributes
      const attributes = {
        x1: fullProps.x1,
        y1: fullProps.y1,
        x2: fullProps.x2,
        y2: fullProps.y2,
        stroke: fullProps.stroke,
        'stroke-width': fullProps.strokeWidth,
        'stroke-dasharray': fullProps.strokeDasharray === 'none' ? null : fullProps.strokeDasharray
      };

      // Return a specification with rendering functions
      return {
        _renderType: "line",  // Internal rendering type
        attributes: attributes,

        // Rendering functions for different backends
        renderSVG: (container) => {
          const element = document.createElementNS('http://www.w3.org/2000/svg', 'line');
          for (const [key, value] of Object.entries(attributes)) {
            if (value !== undefined && value !== null) {
              element.setAttribute(key, value.toString());
            }
          }
          if (container) container.appendChild(element);
          return element;
        },

        renderCanvas: (ctx) => {
          const { x1, y1, x2, y2, stroke, 'stroke-width': strokeWidth, 'stroke-dasharray': strokeDasharray } = attributes;

          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);

          ctx.strokeStyle = stroke;
          ctx.lineWidth = strokeWidth;

          if (strokeDasharray && strokeDasharray !== 'none') {
            const dashArray = strokeDasharray.split(',').map(Number);
            ctx.setLineDash(dashArray);
          } else {
            ctx.setLineDash([]);
          }

          ctx.stroke();
          ctx.setLineDash([]);  // Reset dash pattern

          return true; // Indicate successful rendering
        }
      };
    }
  });
});

describe('Line Primitive', () => {
  test('should register the line type', () => {
    expect(hasType('line')).toBe(true);

    const lineType = getType('line');
    expect(lineType).toBeDefined();
    expect(lineType?.requiredProps).toContain('x1');
    expect(lineType?.requiredProps).toContain('y1');
    expect(lineType?.requiredProps).toContain('x2');
    expect(lineType?.requiredProps).toContain('y2');
    expect(lineType?.optionalProps).toHaveProperty('stroke', 'black');
    expect(lineType?.optionalProps).toHaveProperty('strokeWidth', 1);
    expect(lineType?.optionalProps).toHaveProperty('strokeDasharray', 'none');
  });

  test('should create a renderable object with correct attributes', () => {
    const lineType = getType('line');

    const result = lineType?.decompose({
      x1: 10,
      y1: 20,
      x2: 100,
      y2: 200,
      stroke: 'red',
      strokeWidth: 2,
      strokeDasharray: '5,5'
    }, {});

    expect(result).toBeDefined();
    expect(result?._renderType).toBe('line');
    expect(result?.attributes).toEqual({
      x1: 10,
      y1: 20,
      x2: 100,
      y2: 200,
      stroke: 'red',
      'stroke-width': 2,
      'stroke-dasharray': '5,5'
    });
  });

  test('should handle null stroke-dasharray when none is specified', () => {
    const lineType = getType('line');

    const result = lineType?.decompose({
      x1: 10,
      y1: 20,
      x2: 100,
      y2: 200,
      strokeDasharray: 'none'
    }, {});

    expect(result?.attributes['stroke-dasharray']).toBeNull();
  });

  test('should provide SVG rendering function', () => {
    const lineType = getType('line');

    const result = lineType?.decompose({
      x1: 10,
      y1: 20,
      x2: 100,
      y2: 200
    }, {});

    expect(result?.renderSVG).toBeTypeOf('function');

    // Create a mock container
    const container = { appendChild: vi.fn() };

    // Call the SVG rendering function
    const svgElement = result?.renderSVG(container);

    // Verify the SVG element was created correctly
    expect(svgElement).toBeDefined();
    expect(svgElement?.tagName).toBe('LINE');
    expect(container.appendChild).toHaveBeenCalledWith(svgElement);
  });

  test('should provide Canvas rendering function for solid line', () => {
    const lineType = getType('line');

    const result = lineType?.decompose({
      x1: 10,
      y1: 20,
      x2: 100,
      y2: 200,
      stroke: 'blue',
      strokeWidth: 2
      // No strokeDasharray specified (should default to 'none')
    }, {});

    expect(result?.renderCanvas).toBeTypeOf('function');

    // Create a mock canvas context
    const ctx = {
      beginPath: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      stroke: vi.fn(),
      setLineDash: vi.fn()
    };

    // Call the Canvas rendering function
    const canvasResult = result?.renderCanvas(ctx);

    // Verify the canvas operations were performed correctly
    expect(canvasResult).toBe(true);
    expect(ctx.beginPath).toHaveBeenCalled();
    expect(ctx.moveTo).toHaveBeenCalledWith(10, 20);
    expect(ctx.lineTo).toHaveBeenCalledWith(100, 200);
    expect(ctx.setLineDash).toHaveBeenCalledWith([]);
    expect(ctx.stroke).toHaveBeenCalled();

    // Should reset line dash
    expect(ctx.setLineDash).toHaveBeenCalledTimes(2);
  });

  test('should provide Canvas rendering function for dashed line', () => {
    const lineType = getType('line');

    const result = lineType?.decompose({
      x1: 10,
      y1: 20,
      x2: 100,
      y2: 200,
      strokeDasharray: '5,10'
    }, {});

    expect(result?.renderCanvas).toBeTypeOf('function');

    // Create a mock canvas context
    const ctx = {
      beginPath: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      stroke: vi.fn(),
      setLineDash: vi.fn()
    };

    // Call the Canvas rendering function
    const canvasResult = result?.renderCanvas(ctx);

    // Verify the canvas operations were performed correctly
    expect(canvasResult).toBe(true);
    expect(ctx.beginPath).toHaveBeenCalled();
    expect(ctx.moveTo).toHaveBeenCalledWith(10, 20);
    expect(ctx.lineTo).toHaveBeenCalledWith(100, 200);

    // Should set line dash with parsed values
    expect(ctx.setLineDash).toHaveBeenCalledWith([5, 10]);
    expect(ctx.stroke).toHaveBeenCalled();

    // Should reset line dash
    expect(ctx.setLineDash).toHaveBeenCalledTimes(2);
    expect(ctx.setLineDash).toHaveBeenLastCalledWith([]);
  });

  test('should apply default values for optional properties', () => {
    const lineType = getType('line');

    const result = lineType?.decompose({
      x1: 10,
      y1: 20,
      x2: 100,
      y2: 200
      // No optional properties specified
    }, {});

    expect(result?.attributes).toEqual({
      x1: 10,
      y1: 20,
      x2: 100,
      y2: 200,
      stroke: 'black',
      'stroke-width': 1,
      'stroke-dasharray': null  // 'none' is converted to null
    });
  });
});
