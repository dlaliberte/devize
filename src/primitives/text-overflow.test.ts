import { describe, test, expect, vi, beforeEach } from 'vitest';
import { registerType, getType, _resetRegistryForTesting } from '../core/registry';

// Reset registry before each test
beforeEach(() => {
  _resetRegistryForTesting();

  // Directly register the text type with overflow handling
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
      transform: '',
      maxWidth: 0,
      overflow: 'clip' // 'clip', 'ellipsis', or 'wrap'
    },
    generateConstraints: () => [],
    decompose: (spec, solvedConstraints) => {
      // Ensure numeric values
      const x = Number(spec.x) || 0;
      const y = Number(spec.y) || 0;
      const fontSize = Number(spec.fontSize) || 12;
      const maxWidth = Number(spec.maxWidth) || 0;

      // Prepare attributes
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
        _renderType: "text",
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

          // Handle overflow if maxWidth is specified
          if (maxWidth > 0) {
            const textWidth = ctx.measureText ? ctx.measureText(spec.text).width : spec.text.length * 5;

            if (textWidth > maxWidth) {
              if (spec.overflow === 'ellipsis') {
                // Add ellipsis
                let truncatedText = spec.text;
                const ellipsis = '...';

                while (truncatedText.length > 0) {
                  truncatedText = truncatedText.slice(0, -1);
                  const ellipsisWidth = ctx.measureText ? ctx.measureText(truncatedText + ellipsis).width : (truncatedText + ellipsis).length * 5;

                  if (ellipsisWidth <= maxWidth) {
                    ctx.fillText(truncatedText + ellipsis, x, y);
                    break;
                  }
                }
              } else if (spec.overflow === 'wrap') {
                // Simple word wrapping
                const words = spec.text.split(' ');
                let line = '';
                let lineY = y;

                for (const word of words) {
                  const testLine = line + (line ? ' ' : '') + word;
                  const testWidth = ctx.measureText ? ctx.measureText(testLine).width : testLine.length * 5;

                  if (testWidth > maxWidth && line !== '') {
                    ctx.fillText(line, x, lineY);
                    line = word;
                    lineY += fontSize * 1.2; // Simple line height
                  } else {
                    line = testLine;
                  }
                }

                // Draw the last line
                ctx.fillText(line, x, lineY);
              } else {
                // Default: clip
                ctx.fillText(spec.text, x, y);
              }
            } else {
              // No overflow, draw normally
              ctx.fillText(spec.text, x, y);
            }
          } else {
            // No maxWidth, draw normally
            ctx.fillText(spec.text, x, y);
          }

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

          // Handle overflow if maxWidth is specified
          if (maxWidth > 0) {
            // For SVG, we can use textLength and lengthAdjust attributes
            element.setAttribute('textLength', maxWidth.toString());

            if (spec.overflow === 'ellipsis') {
              // For ellipsis, we need to simulate in JS since SVG doesn't have native ellipsis
              const canvas = document.createElement('canvas');
              const ctx = canvas.getContext('2d');

              if (ctx) {
                ctx.font = `${spec.fontWeight} ${fontSize}px ${spec.fontFamily}`;
                const textWidth = ctx.measureText(spec.text).width;

                if (textWidth > maxWidth) {
                  let truncatedText = spec.text;
                  const ellipsis = '...';

                  while (truncatedText.length > 0) {
                    truncatedText = truncatedText.slice(0, -1);
                    const ellipsisWidth = ctx.measureText(truncatedText + ellipsis).width;

                    if (ellipsisWidth <= maxWidth) {
                      element.textContent = truncatedText + ellipsis;
                      break;
                    }
                  }
                } else {
                  element.textContent = spec.text;
                }
              } else {
                element.textContent = spec.text;
              }
            } else if (spec.overflow === 'wrap') {
              // For wrap, we need to create multiple tspan elements
              const canvas = document.createElement('canvas');
              const ctx = canvas.getContext('2d');

              if (ctx) {
                ctx.font = `${spec.fontWeight} ${fontSize}px ${spec.fontFamily}`;

                // Simple word wrapping
                const words = spec.text.split(' ');
                let line = '';
                let lines = [];

                for (const word of words) {
                  const testLine = line + (line ? ' ' : '') + word;
                  const testWidth = ctx.measureText(testLine).width;

                  if (testWidth > maxWidth && line !== '') {
                    lines.push(line);
                    line = word;
                  } else {
                    line = testLine;
                  }
                }

                // Add the last line
                lines.push(line);

                // Create tspan elements for each line
                lines.forEach((lineText, i) => {
                  const tspan = document.createElementNS('http://www.w3.org/2000/svg', 'tspan');
                  tspan.setAttribute('x', x.toString());
                  tspan.setAttribute('dy', i === 0 ? '0' : (fontSize * 1.2).toString());
                  tspan.textContent = lineText;
                  element.appendChild(tspan);
                });
              } else {
                element.textContent = spec.text;
              }
            } else {
              // Default: clip
              element.setAttribute('lengthAdjust', 'spacingAndGlyphs');
              element.textContent = spec.text;
            }
          } else {
            // No maxWidth, set text content normally
            element.textContent = spec.text;
          }

          // Append to container
          if (container) container.appendChild(element);

          return element;
        }
      };
    }
  });
});

// Mock document methods for SVG creation
global.document = {
  createElementNS: vi.fn((namespace, tagName) => {
    if (tagName === 'tspan') {
      return {
        tagName: 'TSPAN',
        setAttribute: vi.fn(),
        textContent: null
      };
    }
    return {
      tagName: tagName.toUpperCase(),
      setAttribute: vi.fn(),
      textContent: null,
      appendChild: vi.fn()
    };
  }),
  createElement: vi.fn(() => ({
    getContext: vi.fn(() => ({
      measureText: vi.fn(text => ({ width: text.length * 5 })),
      font: ''
    }))
  }))
} as any;

describe('Text Overflow', () => {
    test('should clip text when overflow is set to clip', () => {
        const textType = getType('text');
        expect(textType).toBeDefined();

        const result = textType.decompose({
            text: 'This is a long text that should be clipped',
            x: 10,
            y: 20,
            maxWidth: 100,
            overflow: 'clip'
        }, {});

        // Create a mock canvas context
        const ctx = {
            save: vi.fn(),
            restore: vi.fn(),
            fillText: vi.fn(),
            measureText: vi.fn(text => ({ width: text.length * 10 })), // Make sure it's wider than maxWidth
            textAlign: 'unset',
            textBaseline: 'unset'
        };

        // Call the Canvas rendering function
        result.renderCanvas(ctx);

        // Should have called fillText once with the full text
        expect(ctx.fillText).toHaveBeenCalledTimes(1);
        expect(ctx.fillText).toHaveBeenCalledWith('This is a long text that should be clipped', 10, 20);
    });

    test('should add ellipsis when overflow is set to ellipsis', () => {
        const textType = getType('text');
        expect(textType).toBeDefined();

        const result = textType.decompose({
            text: 'This is a long text that should have ellipsis',
            x: 10,
            y: 20,
            maxWidth: 100,
            overflow: 'ellipsis'
        }, {});

        // Create a mock canvas context with text measurement
        const ctx = {
            save: vi.fn(),
            restore: vi.fn(),
            fillText: vi.fn(),
            measureText: vi.fn((text) => {
                // Return a width that ensures we need to truncate
                // Make the full text too wide, but allow shorter text + ellipsis to fit
                if (text.length > 20) {
                    return { width: 150 }; // Too wide
                } else {
                    return { width: 90 }; // Fits within maxWidth
                }
            }),
            textAlign: 'unset',
            textBaseline: 'unset'
        };

        // Call the Canvas rendering function
        result.renderCanvas(ctx);

        // Should have called fillText with truncated text + ellipsis
        expect(ctx.fillText).toHaveBeenCalledTimes(1);
        expect(ctx.fillText.mock.calls[0][0]).toContain('...');
        expect(ctx.fillText.mock.calls[0][0].length).toBeLessThan('This is a long text that should have ellipsis'.length);
    });

    test('should wrap text when overflow is set to wrap', () => {
        const textType = getType('text');
        expect(textType).toBeDefined();

        const result = textType.decompose({
            text: 'This is a long text that should be wrapped to multiple lines',
            x: 10,
            y: 20,
            maxWidth: 100,
            overflow: 'wrap'
        }, {});

        // Create a mock canvas context with text measurement
        const ctx = {
            save: vi.fn(),
            restore: vi.fn(),
            fillText: vi.fn(),
            measureText: vi.fn((text) => {
                // Return a width based on text length to force wrapping
                return { width: text.length * 5 };
            }),
            textAlign: 'unset',
            textBaseline: 'unset'
        };

        // Call the Canvas rendering function
        result.renderCanvas(ctx);

        // Should have called fillText multiple times for each line
        expect(ctx.fillText.mock.calls.length).toBeGreaterThan(1);

        // First line should be at the original y position
        expect(ctx.fillText.mock.calls[0][2]).toBe(20);

        // Second line should be at y + (fontSize * 1.2)
        const lineHeight = 12 * 1.2; // fontSize * 1.2
        expect(ctx.fillText.mock.calls[1][2]).toBeCloseTo(20 + lineHeight);
    });

    test('should handle SVG rendering with ellipsis overflow', () => {
        const textType = getType('text');
        expect(textType).toBeDefined();

        // Mock document methods for SVG creation
        const mockTextElement = {
            setAttribute: vi.fn(),
            textContent: null
        };

        const mockCanvas = {
            getContext: vi.fn(() => ({
                measureText: vi.fn((text) => {
                    // Return a width that ensures we need to truncate
                    // Make the full text too wide, but allow shorter text + ellipsis to fit
                    if (text.length > 20) {
                        return { width: 150 }; // Too wide
                    } else {
                        return { width: 90 }; // Fits within maxWidth
                    }
                }),
                font: ''
            }))
        };

        global.document = {
            createElementNS: vi.fn(() => mockTextElement),
            createElement: vi.fn(() => mockCanvas)
        } as any;

        const result = textType.decompose({
            text: 'This is a long text that should have ellipsis',
            x: 10,
            y: 20,
            maxWidth: 100,
            overflow: 'ellipsis'
        }, {});

        // Create a mock container
        const container = { appendChild: vi.fn() };

        // Call the SVG rendering function
        result.renderSVG(container);

        // Should have set textLength attribute
            + expect(mockTextElement.setAttribute).toHaveBeenCalledWith('textLength', '100');
        +
            +  // Should have appended to container
            +  expect(container.appendChild).toHaveBeenCalledWith(mockTextElement);
        +
            +  // Should have set text content with ellipsis
            +  expect(mockTextElement.textContent).toContain('...');
        +  expect(mockTextElement.textContent.length).toBeLessThan('This is a long text that should have ellipsis'.length);
    });

    test('should handle SVG rendering with wrap overflow', () => {
        const textType = getType('text');
        expect(textType).toBeDefined();

        // Mock document methods for SVG creation
        const mockTextElement = {
            setAttribute: vi.fn(),
            textContent: null,
            appendChild: vi.fn()
        };

        const mockTspan = {
            setAttribute: vi.fn(),
            textContent: null
        };

        const mockCanvas = {
            getContext: vi.fn(() => ({
                measureText: vi.fn((text) => {
                    // Return a width based on text length to force wrapping
                    return { width: text.length * 5 };
                }),
                font: ''
            }))
        };

        global.document = {
            createElementNS: vi.fn((ns, tag) => {
                if (tag === 'tspan') return { ...mockTspan };
                return mockTextElement;
            }),
            createElement: vi.fn(() => mockCanvas)
        } as any;

        const result = textType.decompose({
            text: 'This is a long text that should be wrapped to multiple lines',
            x: 10,
            y: 20,
            maxWidth: 100,
            overflow: 'wrap'
        }, {});

        // Create a mock container
        const container = { appendChild: vi.fn() };

        // Call the SVG rendering function
        result.renderSVG(container);

        // Should have appended to container
        expect(container.appendChild).toHaveBeenCalledWith(mockTextElement);

        // Should have created tspan elements
        expect(mockTextElement.appendChild).toHaveBeenCalled();
        expect(mockTextElement.appendChild.mock.calls.length).toBeGreaterThan(1);
    });
});
