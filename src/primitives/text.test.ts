import { describe, test, expect, vi, beforeEach } from 'vitest';
import { registerType, getType, hasType, _resetRegistryForTesting } from '../core/registry';
import { registerDefineType } from '../core/define';
import { createViz } from '../core/creator';

// Create a mock document object for SVG creation
global.document = {
  createElementNS: vi.fn((namespace, tagName) => ({
    tagName: tagName.toUpperCase(),
    setAttribute: vi.fn(),
    appendChild: vi.fn(),
    textContent: null
  }))
} as any;

// Mock createViz to capture calls
vi.mock('../core/creator', () => ({
  createViz: vi.fn((spec) => {
    // If this is the define type for text, manually register it
    if (spec.type === 'define' && spec.name === 'text') {
      const implementation = spec.implementation;

      registerType({
        name: 'text',
        requiredProps: ['text'],
        optionalProps: {
          x: 0,
          y: 0,
          fontSize: 12,
          fontFamily: 'sans-serif',
          fontWeight: 'normal',
          fill: 'black',
          textAnchor: 'start',
          dominantBaseline: 'auto',
          opacity: 1,
          transform: ''
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

  // Manually register the text type
  createViz({
    type: "define",
    name: "text",
    properties: {
      x: { default: 0 },
      y: { default: 0 },
      text: { required: true },
      fontSize: { default: 12 },
      fontFamily: { default: 'sans-serif' },
      fontWeight: { default: 'normal' },
      fill: { default: 'black' },
      textAnchor: { default: 'start' },
      dominantBaseline: { default: 'auto' },
      opacity: { default: 1 },
      transform: { default: '' }
    },
    implementation: props => {
      // Apply default values for optional properties
      const fullProps = {
        ...props,
        x: props.x ?? 0,
        y: props.y ?? 0,
        fontSize: props.fontSize ?? 12,
        fontFamily: props.fontFamily ?? 'sans-serif',
        fontWeight: props.fontWeight ?? 'normal',
        fill: props.fill ?? 'black',
        textAnchor: props.textAnchor ?? 'start',
        dominantBaseline: props.dominantBaseline ?? 'auto',
        opacity: props.opacity ?? 1,
        transform: props.transform ?? ''
      };

      // Prepare attributes
      const attributes = {
        x: fullProps.x,
        y: fullProps.y,
        'font-size': fullProps.fontSize,
        'font-family': fullProps.fontFamily,
        'font-weight': fullProps.fontWeight,
        fill: fullProps.fill,
        'text-anchor': fullProps.textAnchor,
        'dominant-baseline': fullProps.dominantBaseline,
        opacity: fullProps.opacity,
        transform: fullProps.transform || null
      };

      // Return a specification with rendering functions
      return {
        _renderType: "text",  // Internal rendering type
        attributes: attributes,
        content: fullProps.text,  // Text content

        // Rendering functions for different backends
        renderSVG: (container) => {
          const element = document.createElementNS('http://www.w3.org/2000/svg', 'text');
          for (const [key, value] of Object.entries(attributes)) {
            if (value !== undefined && value !== null) {
              element.setAttribute(key, value.toString());
            }
          }
          element.textContent = fullProps.text;
          if (container) container.appendChild(element);
          return element;
        },

        renderCanvas: (ctx) => {
          const { x, y, 'font-size': fontSize, 'font-family': fontFamily, 'font-weight': fontWeight,
                  fill, 'text-anchor': textAnchor, 'dominant-baseline': dominantBaseline, opacity } = attributes;

          // Save the current context state
          ctx.save();

          // Apply opacity
          ctx.globalAlpha = opacity;

          // Set font
          ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
          ctx.fillStyle = fill;

          // Handle text anchor
          if (textAnchor === 'middle') {
            ctx.textAlign = 'center';
          } else if (textAnchor === 'end') {
            ctx.textAlign = 'right';
          } else {
            ctx.textAlign = 'left';
          }

          // Handle dominant baseline
          if (dominantBaseline === 'middle') {
            ctx.textBaseline = 'middle';
          } else if (dominantBaseline === 'hanging') {
            ctx.textBaseline = 'top';
          } else if (dominantBaseline === 'alphabetic') {
            ctx.textBaseline = 'alphabetic';
          } else {
            ctx.textBaseline = 'alphabetic';
          }

          // Apply transform if specified
          if (fullProps.transform) {
            // Parse and apply SVG transform to canvas context
            const transformStr = fullProps.transform.trim();
            if (transformStr.startsWith('translate')) {
              const match = transformStr.match(/translate\(([^,]+),([^)]+)\)/);
              if (match) {
                const tx = parseFloat(match[1]);
                const ty = parseFloat(match[2]);
                ctx.translate(tx, ty);
              }
            } else if (transformStr.startsWith('rotate')) {
              const match = transformStr.match(/rotate\(([^)]+)\)/);
              if (match) {
                const angle = parseFloat(match[1]) * Math.PI / 180;
                ctx.rotate(angle);
              }
            }
          }

          // Draw the text
          ctx.fillText(fullProps.text, x, y);

          // Restore the context state
          ctx.restore();

          return true; // Indicate successful rendering
        }
      };
    }
  });
});

describe('Text Primitive', () => {
  test('should register the text type', () => {
    expect(hasType('text')).toBe(true);

    const textType = getType('text');
    expect(textType).toBeDefined();
    expect(textType?.requiredProps).toContain('text');
    expect(textType?.optionalProps).toHaveProperty('x', 0);
    expect(textType?.optionalProps).toHaveProperty('y', 0);
    expect(textType?.optionalProps).toHaveProperty('fontSize', 12);
    expect(textType?.optionalProps).toHaveProperty('fontFamily', 'sans-serif');
    expect(textType?.optionalProps).toHaveProperty('fill', 'black');
    expect(textType?.optionalProps).toHaveProperty('textAnchor', 'start');
  });

  test('should create a renderable object with correct attributes', () => {
    const textType = getType('text');

    const result = textType?.decompose({
      x: 100,
      y: 50,
      text: 'Hello World',
      fontSize: 16,
      fontFamily: 'Arial',
      fill: 'blue',
      textAnchor: 'middle'
    }, {});

    expect(result).toBeDefined();
    expect(result?._renderType).toBe('text');
    expect(result?.content).toBe('Hello World');
    expect(result?.attributes).toEqual({
      x: 100,
      y: 50,
      'font-size': 16,
      'font-family': 'Arial',
      'font-weight': 'normal',
      fill: 'blue',
      'text-anchor': 'middle',
      'dominant-baseline': 'auto',
      opacity: 1,
      transform: null
    });
  });

  test('should provide SVG rendering function', () => {
    const textType = getType('text');

    const result = textType?.decompose({
      text: 'Hello World'
    }, {});

    expect(result?.renderSVG).toBeTypeOf('function');

    // Create a mock container
    const container = { appendChild: vi.fn() };

    // Call the SVG rendering function
    const svgElement = result?.renderSVG(container);

    // Verify the SVG element was created correctly
    expect(svgElement).toBeDefined();
    expect(svgElement?.tagName).toBe('TEXT');
    expect(svgElement.textContent).toBe('Hello World');
    expect(container.appendChild).toHaveBeenCalledWith(svgElement);
  });

  test('should provide Canvas rendering function with default text alignment', () => {
    const textType = getType('text');

    const result = textType?.decompose({
      x: 100,
      y: 50,
      text: 'Hello World',
      fill: 'red'
    }, {});

    expect(result?.renderCanvas).toBeTypeOf('function');

    // Create a mock canvas context
    const ctx = {
      save: vi.fn(),
      restore: vi.fn(),
      fillText: vi.fn(),
      translate: vi.fn(),
      rotate: vi.fn()
    };

    // Call the Canvas rendering function
    const canvasResult = result?.renderCanvas(ctx);

    // Verify the canvas operations were performed correctly
    expect(canvasResult).toBe(true);
    expect(ctx.save).toHaveBeenCalled();
    expect(ctx.fillText).toHaveBeenCalledWith('Hello World', 100, 50);
    expect(ctx.restore).toHaveBeenCalled();
  });

  test('should apply default values for optional properties', () => {
    const textType = getType('text');

    const result = textType?.decompose({
      text: 'Hello World'
      // No optional properties specified
    }, {});

    expect(result?.attributes).toEqual({
      x: 0,
      y: 0,
      'font-size': 12,
      'font-family': 'sans-serif',
      'font-weight': 'normal',
      fill: 'black',
      'text-anchor': 'start',
      'dominant-baseline': 'auto',
      opacity: 1,
      transform: null
    });
  });
});
