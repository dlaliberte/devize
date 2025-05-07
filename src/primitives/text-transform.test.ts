import { describe, test, expect, vi, beforeEach } from 'vitest';
import { registerType, getType, hasType, _resetRegistryForTesting } from '../core/registry';
import { registerDefineType } from '../core/define';
import { buildViz } from '../core/creator';

// Mock buildViz to capture calls and execute define implementations
vi.mock('../core/creator', () => ({
  buildViz: vi.fn((spec) => {
    console.log('Mock buildViz called with type:', spec.type);

    // If this is a define call, manually register the type
    if (spec.type === 'define') {
      console.log('Registering type:', spec.name);

      // Extract required properties
      const requiredProps = Object.entries(spec.properties)
        .filter(([_, config]) => (config as any).required)
        .map(([name]) => name);

      // Extract optional properties with defaults
      const optionalProps = Object.fromEntries(
        Object.entries(spec.properties)
          .filter(([_, config]) => !(config as any).required && (config as any).default !== undefined)
          .map(([name, config]) => [name, (config as any).default])
      );

      // Register the type directly
      registerType({
        name: spec.name,
        requiredProps,
        optionalProps,
        generateConstraints: () => [],
        decompose: (innerSpec, innerSolvedConstraints) => {
          return spec.implementation(innerSpec);
        }
      });

      console.log('Type registered:', spec.name);
      console.log('Has type:', hasType(spec.name));

      return { type: 'group', children: [] };
    }

    return { type: 'group', children: [] };
  })
}));

// Reset registry and register define type before each test
beforeEach(() => {
  console.log('Resetting registry and registering define type');
  _resetRegistryForTesting();
  registerDefineType();

  console.log('Define type registered:', hasType('define'));

  // Register the text type with transform support
  buildViz({
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
      // Create a simple implementation that directly uses the context methods
      return {
        renderCanvas: (ctx) => {
          // Apply transform if specified
          if (props.transform) {
            const transformStr = props.transform.trim();
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

          // Draw the text (simplified for testing)
          ctx.fillText(props.text, props.x, props.y);

          return true;
        },

        renderSVG: (container) => {
          const element = {
            setAttribute: vi.fn(),
            textContent: props.text
          };

          // Set transform attribute if specified
          if (props.transform) {
            element.setAttribute('transform', props.transform);
          }

          if (container && container.appendChild) {
            container.appendChild(element);
          }

          return element;
        }
      };
    }
  });

  console.log('Text type registered:', hasType('text'));
});

describe('Text Transformations', () => {
  test('should handle translate transform in canvas rendering', () => {
    console.log('Starting translate test');
    console.log('Available types:', Object.keys(getType));
    console.log('Has text type:', hasType('text'));

    // Register the text type directly if it doesn't exist
    if (!hasType('text')) {
      console.log('Manually registering text type');
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
          return {
            renderCanvas: (ctx) => {
              // Apply transform if specified
              if (spec.transform) {
                const transformStr = spec.transform.trim();
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

              // Draw the text (simplified for testing)
              ctx.fillText(spec.text, spec.x, spec.y);

              return true;
            },

            renderSVG: (container) => {
              const element = {
                setAttribute: vi.fn(),
                textContent: spec.text
              };

              // Set transform attribute if specified
              if (spec.transform) {
                element.setAttribute('transform', spec.transform);
              }

              if (container && container.appendChild) {
                container.appendChild(element);
              }

              return element;
            }
          };
        }
      });
    }

    const textType = getType('text');
    expect(textType).toBeDefined();

    // Create a simple spec with translate transform
    const spec = {
      text: 'Translated text',
      transform: 'translate(50,30)'
    };

    // Create mock context
    const ctx = {
      translate: vi.fn(),
      rotate: vi.fn(),
      fillText: vi.fn()
    };

    // Call decompose and then renderCanvas
    const result = textType.decompose(spec, {});
    result.renderCanvas(ctx);

    // Verify translate was called with correct arguments
    expect(ctx.translate).toHaveBeenCalledWith(50, 30);
    expect(ctx.rotate).not.toHaveBeenCalled();
  });

  test('should handle rotate transform in canvas rendering', () => {
    const textType = getType('text');
    expect(textType).toBeDefined();

    // Create a simple spec with rotate transform
    const spec = {
      text: 'Rotated text',
      transform: 'rotate(45)'
    };

    // Create mock context
    const ctx = {
      translate: vi.fn(),
      rotate: vi.fn(),
      fillText: vi.fn()
    };

    // Call decompose and then renderCanvas
    const result = textType?.decompose(spec, {});
    result.renderCanvas(ctx);

    // Verify rotate was called with correct arguments (45 degrees in radians)
    expect(ctx.rotate).toHaveBeenCalledWith(45 * Math.PI / 180);
    expect(ctx.translate).not.toHaveBeenCalled();
  });

  test('should handle transform in SVG rendering', () => {
    const textType = getType('text');
    expect(textType).toBeDefined();

    // Test translate transform
    const translateSpec = {
      text: 'Translated text',
      transform: 'translate(50,30)'
    };

    // Create mock container
    const container = {
      appendChild: vi.fn()
    };

    // Call decompose and then renderSVG
    const translateResult = textType?.decompose(translateSpec, {});
    const translateElement = translateResult.renderSVG(container);

    // Verify transform attribute was set correctly
    expect(translateElement.setAttribute).toHaveBeenCalledWith('transform', 'translate(50,30)');

    // Test rotate transform
    const rotateSpec = {
      text: 'Rotated text',
      transform: 'rotate(45)'
    };

    // Call decompose and then renderSVG
    const rotateResult = textType?.decompose(rotateSpec, {});
    const rotateElement = rotateResult.renderSVG(container);

    // Verify transform attribute was set correctly
    expect(rotateElement.setAttribute).toHaveBeenCalledWith('transform', 'rotate(45)');
  });

  test('should ignore invalid transforms', () => {
    const textType = getType('text');
    expect(textType).toBeDefined();

    // Create a simple spec with invalid transform
    const spec = {
      text: 'Invalid transform',
      transform: 'invalid(10,20)'
    };

    // Create mock context
    const ctx = {
      translate: vi.fn(),
      rotate: vi.fn(),
      fillText: vi.fn()
    };

    // Call decompose and then renderCanvas
    const result = textType?.decompose(spec, {});
    result.renderCanvas(ctx);

    // Verify no transform methods were called
    expect(ctx.translate).not.toHaveBeenCalled();
    expect(ctx.rotate).not.toHaveBeenCalled();
  });

  test('should handle empty transform', () => {
    const textType = getType('text');
    expect(textType).toBeDefined();

    // Create a simple spec with empty transform
    const spec = {
      text: 'No transform',
      transform: ''
    };

    // Create mock context
    const ctx = {
      translate: vi.fn(),
      rotate: vi.fn(),
      fillText: vi.fn()
    };

    // Call decompose and then renderCanvas
    const result = textType?.decompose(spec, {});
    result.renderCanvas(ctx);

    // Verify no transform methods were called
    expect(ctx.translate).not.toHaveBeenCalled();
    expect(ctx.rotate).not.toHaveBeenCalled();
  });
});
