import { describe, test, expect, vi, beforeEach } from 'vitest';
import { registerType, getType, _resetRegistryForTesting } from '../core/registry';

// Reset registry before each test
beforeEach(() => {
  _resetRegistryForTesting();

  // Directly register the text type
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
    decompose: (spec, solvedConstraints) => {
      // Prepare attributes
      const attributes = {
        x: spec.x,
        y: spec.y,
        'font-size': spec.fontSize,
        'font-family': spec.fontFamily,
        'font-weight': spec.fontWeight,
        fill: spec.fill,
        'text-anchor': spec.textAnchor,
        'dominant-baseline': spec.dominantBaseline,
        opacity: spec.opacity,
        transform: spec.transform || null
      };

      return {
        _renderType: "text",
        attributes: attributes,
        content: spec.text,

        renderCanvas: (ctx) => {
          // Save context state
          if (ctx.save) ctx.save();

          // Apply text properties
          if (ctx.font) ctx.font = `${spec.fontWeight} ${spec.fontSize}px ${spec.fontFamily}`;
          if (ctx.fillStyle) ctx.fillStyle = spec.fill;

          // Draw text
          ctx.fillText(spec.text, spec.x, spec.y);

          // Restore context state
          if (ctx.restore) ctx.restore();

          return true;
        },

        renderSVG: (container) => {
          const element = document.createElementNS('http://www.w3.org/2000/svg', 'text');

          // Set attributes
          for (const [key, value] of Object.entries(attributes)) {
            if (value !== undefined && value !== null) {
              element.setAttribute(key, value.toString());
            }
          }

          // Set text content
          element.textContent = spec.text;

          // Append to container
          if (container) container.appendChild(element);

          return element;
        }
      };
    }
  });

  // Register the wrappingText type
  registerType({
    name: 'wrappingText',
    requiredProps: ['text', 'width'],
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
      transform: '',
      lineHeight: 1.2,
      maxLines: 0
    },
    generateConstraints: () => [],
    decompose: (spec, solvedConstraints) => {
      // Ensure numeric values
      const x = Number(spec.x) || 0;
      const y = Number(spec.y) || 0;
      const fontSize = Number(spec.fontSize) || 12;
      const lineHeight = Number(spec.lineHeight) || 1.2;
      const width = Number(spec.width) || 100;
      const maxLines = Number(spec.maxLines) || 0;

      // Get the base text attributes
      const attributes = {
        x: x,
        y: y,
        'font-size': fontSize,
        'font-family': spec.fontFamily,
        'font-weight': spec.fontWeight,
        fill: spec.fill,
        'text-anchor': spec.textAnchor,
        'dominant-baseline': spec.dominantBaseline,
        opacity: spec.opacity,
        transform: spec.transform || null
      };

      return {
        _renderType: "wrappingText",
        attributes: attributes,
        content: spec.text,

        renderCanvas: (ctx) => {
          // Save context state
          if (ctx.save) ctx.save();

          // Apply text properties
          if (ctx.font) ctx.font = `${spec.fontWeight} ${fontSize}px ${spec.fontFamily}`;
          if (ctx.fillStyle) ctx.fillStyle = spec.fill;

          // Handle text anchor
          if (spec.textAnchor === 'middle' && ctx.textAlign) {
            ctx.textAlign = 'center';
          } else if (spec.textAnchor === 'end' && ctx.textAlign) {
            ctx.textAlign = 'right';
          } else if (ctx.textAlign) {
            ctx.textAlign = 'left';
          }

          // Handle dominant baseline
          if (spec.dominantBaseline === 'middle' && ctx.textBaseline) {
            ctx.textBaseline = 'middle';
          } else if (spec.dominantBaseline === 'hanging' && ctx.textBaseline) {
            ctx.textBaseline = 'top';
          } else if (ctx.textBaseline) {
            ctx.textBaseline = 'alphabetic';
          }

          // Wrap text to the specified width
          const words = spec.text.split(' ');
          const lines = [];
          let currentLine = words[0] || '';

          for (let i = 1; i < words.length; i++) {
            const word = words[i];
            const textWidth = ctx.measureText ? ctx.measureText(currentLine + ' ' + word).width : (currentLine + ' ' + word).length * 5;

            if (textWidth < width) {
              currentLine += ' ' + word;
            } else {
              lines.push(currentLine);
              currentLine = word;
            }
          }
          lines.push(currentLine);

          // Limit to maxLines if specified
          const linesToRender = maxLines > 0 ? lines.slice(0, maxLines) : lines;

          // Calculate line height based on fontSize and lineHeight
          const calculatedLineHeight = fontSize * lineHeight;

          // Draw each line
          linesToRender.forEach((line, i) => {
            const lineY = y + (i * calculatedLineHeight);
            ctx.fillText(line, x, lineY);
          });

          // Restore context state
          if (ctx.restore) ctx.restore();

          return true;
        },

        renderSVG: (container) => {
          // For SVG, we need to create multiple text elements, one for each line
          const svgGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');

          // Simulate text wrapping by measuring in a canvas context
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');

          if (!ctx) {
            console.error('Could not get canvas context for text measurement');
            return svgGroup;
          }

          // Set font for measurement
          ctx.font = `${spec.fontWeight} ${fontSize}px ${spec.fontFamily}`;

          // Wrap text to the specified width
          const words = spec.text.split(' ');
          const lines = [];
          let currentLine = words[0] || '';

          for (let i = 1; i < words.length; i++) {
            const word = words[i];
            const textWidth = ctx.measureText(currentLine + ' ' + word).width;

            if (textWidth < width) {
              currentLine += ' ' + word;
            } else {
              lines.push(currentLine);
              currentLine = word;
            }
          }
          lines.push(currentLine);

          // Limit to maxLines if specified
          const linesToRender = maxLines > 0 ? lines.slice(0, maxLines) : lines;

          // Calculate line height based on fontSize and lineHeight
          const calculatedLineHeight = fontSize * lineHeight;

          // Create a text element for each line
          linesToRender.forEach((line, i) => {
            const textElement = document.createElementNS('http://www.w3.org/2000/svg', 'text');

            // Copy attributes from base text
            for (const [key, value] of Object.entries(attributes)) {
              if (value !== undefined && value !== null) {
                textElement.setAttribute(key, value.toString());
              }
            }

            // Override y position for this line
            const lineY = y + (i * calculatedLineHeight);
            textElement.setAttribute('y', lineY.toString());

            // Set the text content
            textElement.textContent = line;

            svgGroup.appendChild(textElement);
          });

          if (container) container.appendChild(svgGroup);
          return svgGroup;
        }
      };
    }
  });
});

// Mock document methods for SVG creation
global.document = {
  createElementNS: vi.fn((namespace, tagName) => {
    if (tagName === 'g') {
      return {
        tagName: 'G',
        appendChild: vi.fn()
      };
    }
    return {
      tagName: tagName.toUpperCase(),
      setAttribute: vi.fn(),
      textContent: null
    };
  }),
  createElement: vi.fn(() => ({
    getContext: vi.fn(() => ({
      measureText: vi.fn(text => ({ width: text.length * 5 })),
      font: ''
    }))
  }))
} as any;

describe('Text Wrapping', () => {
  test('should wrap text to specified width in canvas rendering', () => {
    const wrappingTextType = getType('wrappingText');
    expect(wrappingTextType).toBeDefined();

    const result = wrappingTextType.decompose({
      text: 'This is a long text that should be wrapped to multiple lines',
      x: 10,
      y: 20,
      width: 100
    }, {});

    expect(result).toBeDefined();
    expect(result._renderType).toBe('wrappingText');

    // Create a mock canvas context with text measurement
    const ctx = {
      save: vi.fn(),
      restore: vi.fn(),
      fillText: vi.fn(),
      measureText: vi.fn(text => ({ width: text.length * 5 })), // Simple mock for text width
      textAlign: 'unset',
      textBaseline: 'unset'
    };

    // Call the Canvas rendering function
    result.renderCanvas(ctx);

    // Should have called fillText multiple times for each line
    expect(ctx.fillText.mock.calls.length).toBeGreaterThan(1);

    // First line should be at the original y position
    expect(ctx.fillText.mock.calls[0][2]).toBe(20);

    // Second line should be at y + lineHeight
    const lineHeight = 12 * 1.2; // fontSize * lineHeight
    expect(ctx.fillText.mock.calls[1][2]).toBeCloseTo(20 + lineHeight);
  });

  test('should respect maxLines limit', () => {
    const wrappingTextType = getType('wrappingText');
    expect(wrappingTextType).toBeDefined();

    const result = wrappingTextType.decompose({
      text: 'This is a long text that should be wrapped to multiple lines but limited to just two lines',
      x: 10,
      y: 20,
      width: 100,
      maxLines: 2
    }, {});

    // Create a mock canvas context with text measurement
    const ctx = {
      save: vi.fn(),
      restore: vi.fn(),
      fillText: vi.fn(),
      measureText: vi.fn(text => ({ width: text.length * 5 })), // Simple mock for text width
      textAlign: 'unset',
      textBaseline: 'unset'
    };

    // Call the Canvas rendering function
    result.renderCanvas(ctx);

    // Should have called fillText exactly twice (maxLines = 2)
    expect(ctx.fillText).toHaveBeenCalledTimes(2);
  });

  test('should create multiple text elements for SVG rendering', () => {
    const wrappingTextType = getType('wrappingText');
    expect(wrappingTextType).toBeDefined();

    // Mock document methods for SVG creation
    const mockTextElement = {
      setAttribute: vi.fn(),
      textContent: null
    };

    const mockGroup = {
      appendChild: vi.fn()
    };

    const mockCanvas = {
      getContext: vi.fn(() => ({
        measureText: vi.fn(text => ({ width: text.length * 5 })),
        font: ''
      }))
    };

    global.document = {
      createElementNS: vi.fn((ns, tag) => {
        if (tag === 'g') return mockGroup;
        if (tag === 'text') return { ...mockTextElement };
        return {};
      }),
      createElement: vi.fn(() => mockCanvas)
    } as any;

    const result = wrappingTextType.decompose({
      text: 'This is a long text that should be wrapped to multiple lines',
      x: 10,
      y: 20,
      width: 100
    }, {});

    // Create a mock container
    const container = { appendChild: vi.fn() };

    // Call the SVG rendering function
    result.renderSVG(container);

    // Should have appended the group to the container
    expect(container.appendChild).toHaveBeenCalledWith(mockGroup);

    // Should have created multiple text elements and appended them to the group
    expect(mockGroup.appendChild.mock.calls.length).toBeGreaterThan(1);
  });

  test('should handle custom line height', () => {
    const wrappingTextType = getType('wrappingText');

    const result = wrappingTextType?.decompose({
      text: 'This is a long text that should be wrapped to multiple lines',
      x: 10,
      y: 20,
      width: 100,
      lineHeight: 2.0 // Double line height
    }, {});

    // Create a mock canvas context with text measurement
    const ctx = {
      save: vi.fn(),
      restore: vi.fn(),
      fillText: vi.fn(),
      measureText: vi.fn(text => ({ width: text.length * 5 })), // Simple mock for text width
      textAlign: 'unset',
      textBaseline: 'unset'
    };

    // Call the Canvas rendering function
    result?.renderCanvas(ctx);

    // First line should be at the original y position
    expect(ctx.fillText.mock.calls[0][2]).toBe(20);

    // Second line should be at y + (fontSize * lineHeight)
    const lineHeight = 12 * 2.0; // fontSize * lineHeight
    expect(ctx.fillText.mock.calls[1][2]).toBeCloseTo(20 + lineHeight);
  });

  test('should handle text with no spaces', () => {
    const wrappingTextType = getType('wrappingText');

    const result = wrappingTextType?.decompose({
      text: 'ThisIsALongTextWithNoSpaces',
      x: 10,
      y: 20,
      width: 100
    }, {});

    // Create a mock canvas context with text measurement
    const ctx = {
      save: vi.fn(),
      restore: vi.fn(),
      fillText: vi.fn(),
      measureText: vi.fn(text => ({ width: text.length * 5 })), // Simple mock for text width
      textAlign: 'unset',
      textBaseline: 'unset'
    };

    // Call the Canvas rendering function
    result?.renderCanvas(ctx);

    // Should have called fillText exactly once (no spaces to wrap)
    expect(ctx.fillText).toHaveBeenCalledTimes(1);
    expect(ctx.fillText).toHaveBeenCalledWith('ThisIsALongTextWithNoSpaces', 10, 20);
  });

  test('should handle empty text', () => {
    const wrappingTextType = getType('wrappingText');

    const result = wrappingTextType?.decompose({
      text: '',
      x: 10,
      y: 20,
      width: 100
    }, {});

    // Create a mock canvas context with text measurement
    const ctx = {
      save: vi.fn(),
      restore: vi.fn(),
      fillText: vi.fn(),
      measureText: vi.fn(text => ({ width: text.length * 5 })), // Simple mock for text width
      textAlign: 'unset',
      textBaseline: 'unset'
    };

    // Call the Canvas rendering function
    result?.renderCanvas(ctx);

    // Should have called fillText exactly once with empty string
    expect(ctx.fillText).toHaveBeenCalledTimes(1);
    expect(ctx.fillText).toHaveBeenCalledWith('', 10, 20);
  });
});
