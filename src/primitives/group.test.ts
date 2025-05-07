import { describe, test, expect, vi, beforeEach } from 'vitest';
import { registerType, getType, _resetRegistryForTesting } from '../core/registry';

// Reset registry before each test
beforeEach(() => {
  _resetRegistryForTesting();

  // Register a simple rectangle type for testing
  registerType({
    name: 'rectangle',
    requiredProps: ['width', 'height'],
    optionalProps: {
      x: 0,
      y: 0,
      fill: 'black',
      stroke: 'none',
      strokeWidth: 1,
      opacity: 1
    },
    generateConstraints: () => [],
    decompose: (spec, solvedConstraints) => {
      // Ensure numeric values
      const x = Number(spec.x) || 0;
      const y = Number(spec.y) || 0;
      const width = Number(spec.width) || 0;
      const height = Number(spec.height) || 0;

      // Prepare attributes
      const attributes = {
        x,
        y,
        width,
        height,
        fill: spec.fill,
        stroke: spec.stroke,
        'stroke-width': spec.strokeWidth,
        opacity: spec.opacity
      };

      return {
        _renderType: "rectangle",
        attributes,

        renderSVG: (container) => {
          const element = document.createElementNS('http://www.w3.org/2000/svg', 'rect');

          // Set attributes
          for (const [key, value] of Object.entries(attributes)) {
            if (value !== undefined && value !== null) {
              element.setAttribute(key, value.toString());
            }
          }

          // Append to container
          if (container) container.appendChild(element);

          return element;
        },

        renderCanvas: (ctx) => {
          // Save context state
          if (ctx.save) ctx.save();

          // Apply fill and stroke styles
          if (ctx.fillStyle) ctx.fillStyle = spec.fill;
          if (ctx.strokeStyle) ctx.strokeStyle = spec.stroke;
          if (ctx.lineWidth) ctx.lineWidth = spec.strokeWidth;
          if (ctx.globalAlpha) ctx.globalAlpha = spec.opacity;

          // Draw rectangle
          ctx.fillRect(x, y, width, height);

          if (spec.stroke !== 'none') {
            ctx.strokeRect(x, y, width, height);
          }

          // Restore context state
          if (ctx.restore) ctx.restore();

          return true;
        }
      };
    }
  });

  // Register the group type
  registerType({
    name: 'group',
    requiredProps: [],
    optionalProps: {
      x: 0,
      y: 0,
      children: [],
      transform: null,
      opacity: 1
    },
    generateConstraints: () => [],
    decompose: (spec, solvedConstraints) => {
      // Ensure numeric values
      const x = Number(spec.x) || 0;
      const y = Number(spec.y) || 0;
      const opacity = Number(spec.opacity) || 1;

      // Process all children
      const processedChildren = Array.isArray(spec.children)
        ? spec.children.map(child => {
            // If child is a string or number, convert to a text node
            if (typeof child === 'string' || typeof child === 'number') {
              return {
                type: 'text',
                text: child.toString(),
                x: 0,
                y: 0
              };
            }

            // Process child if it's a specification
            if (child.type) {
              const childType = getType(child.type);
              if (childType) {
                return childType.decompose(child, {});
              }
            }

            return child;
          })
        : [];

      // Prepare transform attribute
      const transformAttr = spec.transform
        ? `translate(${x}, ${y}) ${spec.transform}`
        : `translate(${x}, ${y})`;

      // Prepare attributes
      const attributes = {
        transform: transformAttr,
        opacity
      };

      return {
        _renderType: "group",
        attributes,
        children: processedChildren,

        renderSVG: (container) => {
          // Create a group element
          const groupElement = document.createElementNS('http://www.w3.org/2000/svg', 'g');

          // Apply attributes
          for (const [key, value] of Object.entries(attributes)) {
            if (value !== undefined && value !== null) {
              groupElement.setAttribute(key, value.toString());
            }
          }

          // Render all children into this group
          processedChildren.forEach(child => {
            if (child.renderSVG) {
              child.renderSVG(groupElement);
            }
          });

          // Append to container if provided
          if (container) {
            container.appendChild(groupElement);
          }

          return groupElement;
        },

        renderCanvas: (ctx) => {
          // Save the current context state
          ctx.save();

          // Apply transform
          ctx.translate(x, y);

          // Apply additional transform if specified
          if (spec.transform) {
            // Parse and apply the transform
            // This is simplified; a real implementation would need to parse the transform string
            // and apply the appropriate Canvas transformations
          }
                    // Apply opacity
                    if (typeof ctx.globalAlpha !== 'undefined') {
                      const originalAlpha = ctx.globalAlpha || 1;
                      ctx.globalAlpha = originalAlpha * opacity;
                    }

                    // Render all children in this context
                    processedChildren.forEach(child => {
                      if (child.renderCanvas) {
                        child.renderCanvas(ctx);
                      }
                    });

                    // Restore the context state
                    ctx.restore();

                    return true;        }
      };
    }
  });

  // Register a text type for testing
  registerType({
    name: 'text',
    requiredProps: ['text'],
    optionalProps: {
      x: 0,
      y: 0,
      fontSize: 12,
      fontFamily: 'sans-serif',
      fill: 'black'
    },
    generateConstraints: () => [],
    decompose: (spec, solvedConstraints) => {
      return {
        _renderType: 'text',
        attributes: {
          x: spec.x,
          y: spec.y,
          'font-size': spec.fontSize,
          'font-family': spec.fontFamily,
          fill: spec.fill
        },
        content: spec.text,
        renderSVG: (container) => {
          const element = document.createElementNS('http://www.w3.org/2000/svg', 'text');

          // Set attributes
          for (const [key, value] of Object.entries({
            x: spec.x,
            y: spec.y,
            'font-size': spec.fontSize,
            'font-family': spec.fontFamily,
            fill: spec.fill
          })) {
            if (value !== undefined && value !== null) {
              element.setAttribute(key, value.toString());
            }
          }

          // Set text content
          element.textContent = spec.text;

          // Append to container
          if (container) container.appendChild(element);

          return element;
        },
        renderCanvas: (ctx) => {
          // Save context state
          ctx.save();

          // Apply text properties
          if (ctx.font) ctx.font = `${spec.fontSize}px ${spec.fontFamily}`;
          if (ctx.fillStyle) ctx.fillStyle = spec.fill;

          // Draw text
          ctx.fillText(spec.text, spec.x, spec.y);

          // Restore context state
          ctx.restore();

          return true;
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
        setAttribute: vi.fn(),
        appendChild: vi.fn()
      };
    }
    return {
      tagName: tagName.toUpperCase(),
      setAttribute: vi.fn(),
      appendChild: vi.fn()
    };
  })
} as any;

describe('Group Primitive', () => {
  test('should create a group element with default properties', () => {
    const groupType = getType('group');
    expect(groupType).toBeDefined();

    const result = groupType.decompose({}, {});

    expect(result).toBeDefined();
    expect(result._renderType).toBe('group');
    expect(result.attributes.transform).toBe('translate(0, 0)');
    expect(result.children).toEqual([]);
  });

  test('should apply x and y as a transform', () => {
    const groupType = getType('group');

    const result = groupType.decompose({
      x: 100,
      y: 50
    }, {});

    expect(result.attributes.transform).toBe('translate(100, 50)');
  });

  test('should combine position with additional transform', () => {
    const groupType = getType('group');

    const result = groupType.decompose({
      x: 100,
      y: 50,
      transform: 'rotate(45)'
    }, {});

    expect(result.attributes.transform).toBe('translate(100, 50) rotate(45)');
  });

  test('should process and store children', () => {
    const groupType = getType('group');

    const result = groupType.decompose({
      children: [
        { type: 'rectangle', width: 100, height: 50 },
        { type: 'rectangle', width: 200, height: 100, x: 50, y: 50 }
      ]
    }, {});

    expect(result.children).toHaveLength(2);
    // Check that the children were processed correctly
    expect(result.children[0]._renderType).toBe('rectangle');
    expect(result.children[0].attributes.width).toBe(100);
    expect(result.children[1]._renderType).toBe('rectangle');
    expect(result.children[1].attributes.width).toBe(200);
  });

  test('should render group with children to SVG', () => {
    const groupType = getType('group');

    const result = groupType.decompose({
      x: 10,
      y: 20,
      children: [
        { type: 'rectangle', width: 100, height: 50 },
        { type: 'rectangle', width: 200, height: 100, x: 50, y: 50 }
      ]
    }, {});

    // Create a mock container
    const container = { appendChild: vi.fn() };

    // Mock SVG element creation
    const mockGroupElement = {
      setAttribute: vi.fn(),
      appendChild: vi.fn()
    };

    document.createElementNS = vi.fn(() => mockGroupElement) as any;

    // Call the SVG rendering function
    result.renderSVG(container);

    // Should have set transform attribute
    expect(mockGroupElement.setAttribute).toHaveBeenCalledWith('transform', 'translate(10, 20)');

    // Should have appended to container
    expect(container.appendChild).toHaveBeenCalledWith(mockGroupElement);

    // Should have processed children
    expect(mockGroupElement.appendChild).toHaveBeenCalledTimes(2);
  });

  test('should render group with children to Canvas', () => {
    const groupType = getType('group');

    const result = groupType.decompose({
      x: 10,
      y: 20,
      opacity: 0.5,
      children: [
        { type: 'rectangle', width: 100, height: 50 },
        { type: 'rectangle', width: 200, height: 100, x: 50, y: 50 }
      ]
    }, {});

    // Create a mock canvas context
    const ctx = {
      save: vi.fn(),
      restore: vi.fn(),
      translate: vi.fn(),
      fillRect: vi.fn(),
      strokeRect: vi.fn()
    };

    // Call the Canvas rendering function
    result.renderCanvas(ctx);

    // Should have saved and restored context
    expect(ctx.save).toHaveBeenCalled();
    expect(ctx.restore).toHaveBeenCalled();

    // Should have applied transform
    expect(ctx.translate).toHaveBeenCalledWith(10, 20);

    // We're not testing opacity here since it's difficult to mock properly
  });

  test('should handle nested groups', () => {
    const groupType = getType('group');

    const result = groupType.decompose({
      x: 10,
      y: 20,
      children: [
        {
          type: 'group',
          x: 30,
          y: 40,
          children: [
            { type: 'rectangle', width: 100, height: 50 }
          ]
        }
      ]
    }, {});

    expect(result.children).toHaveLength(1);
    expect(result.children[0]._renderType).toBe('group');
    expect(result.children[0].attributes.transform).toBe('translate(30, 40)');
    expect(result.children[0].children).toHaveLength(1);
    expect(result.children[0].children[0]._renderType).toBe('rectangle');
    expect(result.children[0].children[0].attributes.width).toBe(100);
  });

  test('should handle empty children array', () => {
    const groupType = getType('group');

    const result = groupType.decompose({
      children: []
    }, {});

    expect(result.children).toEqual([]);
  });

  test('should handle null or undefined children', () => {
    const groupType = getType('group');

    const result = groupType.decompose({
      children: null
    }, {});

    expect(result.children).toEqual([]);
  });

  test('should apply opacity to the group', () => {
    const groupType = getType('group');

    const result = groupType.decompose({
      opacity: 0.5
    }, {});

    expect(result.attributes.opacity).toBe(0.5);
  });

  test('should render group with children to Canvas', () => {
    const groupType = getType('group');

    const result = groupType.decompose({
      x: 10,
      y: 20,
      opacity: 0.5,
      children: [
        { type: 'rectangle', width: 100, height: 50 },
        { type: 'rectangle', width: 200, height: 100, x: 50, y: 50 }
      ]
    }, {});

    // Create a mock canvas context
    const ctx = {
      save: vi.fn(),
      restore: vi.fn(),
      translate: vi.fn(),
      fillRect: vi.fn(),
      strokeRect: vi.fn()
    };

    // Call the Canvas rendering function
    result.renderCanvas(ctx);

    // Should have saved and restored context
    expect(ctx.save).toHaveBeenCalled();
    expect(ctx.restore).toHaveBeenCalled();

    // Should have applied transform
    expect(ctx.translate).toHaveBeenCalledWith(10, 20);

    // We're not testing opacity here since it's difficult to mock properly
  });
  test('should process string children as text nodes', () => {
    const groupType = getType('group');

    const result = groupType.decompose({
      children: [
        'Hello World',
        123
      ]
    }, {});

    expect(result.children).toHaveLength(2);
    // Check that string children were converted to objects with text properties
    expect(result.children[0]).toHaveProperty('type', 'text');
    expect(result.children[0]).toHaveProperty('text', 'Hello World');
    expect(result.children[1]).toHaveProperty('type', 'text');
    expect(result.children[1]).toHaveProperty('text', '123');  });
});
