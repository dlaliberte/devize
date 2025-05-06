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

  // Manually register the rectangle type
  registerType({
    name: "rectangle",
    requiredProps: ["width", "height"],
    optionalProps: {
      x: 0,
      y: 0,
      fill: "none",
      stroke: "black",
      strokeWidth: 1,
      cornerRadius: 0
    },
    generateConstraints: () => [],
    decompose: (props, solvedConstraints) => {
      // Validation
      if (props.width <= 0 || props.height <= 0) {
        throw new Error('Rectangle width and height must be positive');
      }

      // Apply default values for optional properties
      const fullProps = {
        ...props,
        x: props.x ?? 0,
        y: props.y ?? 0,
        fill: props.fill ?? "none",
        stroke: props.stroke ?? "black",
        strokeWidth: props.strokeWidth ?? 1,
        cornerRadius: props.cornerRadius ?? 0
      };

      // Prepare attributes
      const attributes = {
        x: fullProps.x,
        y: fullProps.y,
        width: fullProps.width,
        height: fullProps.height,
        fill: fullProps.fill,
        stroke: fullProps.stroke,
        'stroke-width': fullProps.strokeWidth,
        rx: fullProps.cornerRadius,
        ry: fullProps.cornerRadius
      };

      // Return a specification with rendering functions
      return {
        _renderType: "rect",  // Internal rendering type
        attributes: attributes,

        // Rendering functions for different backends
        renderSVG: (container) => {
          const element = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
          for (const [key, value] of Object.entries(attributes)) {
            if (value !== undefined && value !== null) {
              element.setAttribute(key, value.toString());
            }
          }
          if (container) container.appendChild(element);
          return element;
        },

        renderCanvas: (ctx) => {
          const { x, y, width, height, fill, stroke, 'stroke-width': strokeWidth, rx: cornerRadius } = attributes;

          ctx.beginPath();

          if (cornerRadius > 0) {
            // Draw rounded rectangle
            ctx.moveTo(x + cornerRadius, y);
            ctx.lineTo(x + width - cornerRadius, y);
            ctx.arcTo(x + width, y, x + width, y + cornerRadius, cornerRadius);
            ctx.lineTo(x + width, y + height - cornerRadius);
            ctx.arcTo(x + width, y + height, x + width - cornerRadius, y + height, cornerRadius);
            ctx.lineTo(x + cornerRadius, y + height);
            ctx.arcTo(x, y + height, x, y + height - cornerRadius, cornerRadius);
            ctx.lineTo(x, y + cornerRadius);
            ctx.arcTo(x, y, x + cornerRadius, y, cornerRadius);
          } else {
            // Draw regular rectangle
            ctx.rect(x, y, width, height);
          }

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

describe('Rectangle Primitive', () => {
  test('should register the rectangle type', () => {
    expect(hasType('rectangle')).toBe(true);

    const rectType = getType('rectangle');
    expect(rectType).toBeDefined();
    expect(rectType?.requiredProps).toContain('width');
    expect(rectType?.requiredProps).toContain('height');
    expect(rectType?.optionalProps).toHaveProperty('x', 0);
    expect(rectType?.optionalProps).toHaveProperty('y', 0);
    expect(rectType?.optionalProps).toHaveProperty('fill', 'none');
    expect(rectType?.optionalProps).toHaveProperty('stroke', 'black');
    expect(rectType?.optionalProps).toHaveProperty('strokeWidth', 1);
    expect(rectType?.optionalProps).toHaveProperty('cornerRadius', 0);
  });

  test('should validate width and height are positive', () => {
    const rectType = getType('rectangle');

    // Should throw for non-positive width
    expect(() => {
      rectType?.decompose({
        width: 0,
        height: 100
      }, {});
    }).toThrow('Rectangle width and height must be positive');

    // Should throw for non-positive height
    expect(() => {
      rectType?.decompose({
        width: 100,
        height: -10
      }, {});
    }).toThrow('Rectangle width and height must be positive');

    // Should not throw for positive dimensions
    expect(() => {
      rectType?.decompose({
        width: 100,
        height: 50
      }, {});
    }).not.toThrow();
  });

  test('should create a renderable object with correct attributes', () => {
    const rectType = getType('rectangle');

    const result = rectType?.decompose({
      x: 10,
      y: 20,
      width: 100,
      height: 50,
      fill: 'red',
      stroke: 'blue',
      strokeWidth: 2,
      cornerRadius: 5
    }, {});

    expect(result).toBeDefined();
    expect(result?._renderType).toBe('rect');
    expect(result?.attributes).toEqual({
      x: 10,
      y: 20,
      width: 100,
      height: 50,
      fill: 'red',
      stroke: 'blue',
      'stroke-width': 2,
      rx: 5,
      ry: 5
    });
  });

  test('should provide SVG rendering function', () => {
    const rectType = getType('rectangle');

    const result = rectType?.decompose({
      width: 100,
      height: 50
    }, {});

    expect(result?.renderSVG).toBeTypeOf('function');

    // Create a mock container
    const container = { appendChild: vi.fn() };

    // Call the SVG rendering function
    const svgElement = result?.renderSVG(container);

    // Verify the SVG element was created correctly
    expect(svgElement).toBeDefined();
    expect(svgElement?.tagName).toBe('RECT');
    expect(container.appendChild).toHaveBeenCalledWith(svgElement);
  });

  test('should provide Canvas rendering function for regular rectangle', () => {
    const rectType = getType('rectangle');

    const result = rectType?.decompose({
      x: 10,
      y: 20,
      width: 100,
      height: 50,
      fill: 'green',
      stroke: 'black',
      strokeWidth: 2
      // No corner radius specified (should default to 0)
    }, {});

    expect(result?.renderCanvas).toBeTypeOf('function');

    // Create a mock canvas context
    const ctx = {
      beginPath: vi.fn(),
      rect: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      arcTo: vi.fn(),
      fill: vi.fn(),
      stroke: vi.fn()
    };

    // Call the Canvas rendering function
    const canvasResult = result?.renderCanvas(ctx);

    // Verify the canvas operations were performed correctly
    expect(canvasResult).toBe(true);
    expect(ctx.beginPath).toHaveBeenCalled();
    expect(ctx.rect).toHaveBeenCalledWith(10, 20, 100, 50);
    expect(ctx.fill).toHaveBeenCalled();
    expect(ctx.stroke).toHaveBeenCalled();

    // Should not use rounded rectangle methods
    expect(ctx.moveTo).not.toHaveBeenCalled();
    expect(ctx.arcTo).not.toHaveBeenCalled();
  });

  test('should provide Canvas rendering function for rounded rectangle', () => {
    const rectType = getType('rectangle');

    const result = rectType?.decompose({
      x: 10,
      y: 20,
      width: 100,
      height: 50,
      cornerRadius: 10,
      fill: 'orange'
    }, {});

    expect(result?.renderCanvas).toBeTypeOf('function');

    // Create a mock canvas context
    const ctx = {
      beginPath: vi.fn(),
      rect: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      arcTo: vi.fn(),
      fill: vi.fn(),
      stroke: vi.fn()
    };

    // Call the Canvas rendering function
    const canvasResult = result?.renderCanvas(ctx);

    // Verify the canvas operations were performed correctly
    expect(canvasResult).toBe(true);
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
    const rectType = getType('rectangle');

    const result = rectType?.decompose({
      width: 100,
      height: 50
      // No optional properties specified
    }, {});

    expect(result?.attributes).toEqual({
      x: 0,
      y: 0,
      width: 100,
      height: 50,
      fill: 'none',
      stroke: 'black',
      'stroke-width': 1,
      rx: 0,
      ry: 0
    });
  });
});
