import { describe, test, expect, vi, beforeEach } from 'vitest';
import { getType } from '../core/registry';
import { setupTestEnvironment } from '../test/setup';
import { registerLayerType } from './layer';

// Mock buildViz to ensure it doesn't try to use the real implementation
vi.mock('../core/builder', () => ({
  buildViz: vi.fn((spec) => {
    // If this is a define type, manually call the implementation
    if (spec.type === 'define') {
      const defineType = require('../core/registry').getType('define');
      if (defineType) {
        return defineType.decompose(spec, {});
      }
    }
    return { type: spec.type };
  })
}));

// Setup test environment before each test
beforeEach(() => {
  setupTestEnvironment();
  // Explicitly register the layer type
  registerLayerType();
});


describe('Layer Primitive', () => {
  test('should be registered correctly', () => {
    const layerType = getType('layer');
    expect(layerType).toBeDefined();
    expect(layerType.name).toBe('layer');
  });

  test('should create a layer element with default properties', () => {
    const layerType = getType('layer');
    const result = layerType.decompose({}, {});

    expect(result).toBeDefined();
    expect(result._renderType).toBe('layer');
    expect(result.attributes.transform).toBe('translate(0, 0)');
    expect(result.children).toEqual([]);
  });

  test('should apply x and y as a transform', () => {
    const layerType = getType('layer');
    const result = layerType.decompose({
      x: 100,
      y: 50
    }, {});

    expect(result.attributes.transform).toBe('translate(100, 50)');
  });

  test('should apply opacity', () => {
    const layerType = getType('layer');
    const result = layerType.decompose({
      opacity: 0.5
    }, {});

    expect(result.attributes.opacity).toBe(0.5);
  });

  test('should apply z-index', () => {
    const layerType = getType('layer');
    const result = layerType.decompose({
      zIndex: 10
    }, {});

    expect(result.attributes.style).toBe('z-index: 10');
  });

  test('should process children', () => {
    // First register rectangle type since we need it for this test
    const layerType = getType('layer');

    // Mock the getType function to return a simple rectangle type
    vi.spyOn(require('../core/registry'), 'getType').mockImplementation((name) => {
      if (name === 'layer') return layerType;
      if (name === 'rectangle') {
        return {
          decompose: (spec) => ({
            _renderType: 'rectangle',
            attributes: {
              x: spec.x || 0,
              y: spec.y || 0,
              width: spec.width,
              height: spec.height
            },
            renderToSvg: vi.fn(),
            renderToCanvas: vi.fn()
          })
        };
      }
      return undefined;
    });

    const result = layerType.decompose({
      children: [
        { type: 'rectangle', width: 100, height: 50 },
        { type: 'rectangle', width: 200, height: 100, x: 50, y: 50 }
      ]
    }, {});

    expect(result.children).toHaveLength(2);
    expect(result.children[0]._renderType).toBe('rectangle');
    expect(result.children[0].attributes.width).toBe(100);
    expect(result.children[1]._renderType).toBe('rectangle');
    expect(result.children[1].attributes.width).toBe(200);
  });

  test('should render layer with children to SVG', () => {
    const layerType = getType('layer');

    // Mock the getType function to return a simple rectangle type
    vi.spyOn(require('../core/registry'), 'getType').mockImplementation((name) => {
      if (name === 'layer') return layerType;
      if (name === 'rectangle') {
        return {
          decompose: () => ({
            _renderType: 'rectangle',
            attributes: {},
            renderToSvg: vi.fn(),
            renderToCanvas: vi.fn()
          })
        };
      }
      return undefined;
    });

    const result = layerType.decompose({
      x: 10,
      y: 20,
      zIndex: 5,
      opacity: 0.8,
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
      appendChild: vi.fn(),
      style: {}
    };

    document.createElementNS = vi.fn(() => mockGroupElement) as any;

    // Call the SVG rendering function
    result.renderToSvg(container);

    // Should have set transform attribute
    expect(mockGroupElement.setAttribute).toHaveBeenCalledWith('transform', 'translate(10, 20)');

    // Should have set opacity attribute
    expect(mockGroupElement.setAttribute).toHaveBeenCalledWith('opacity', '0.8');

    // Should have set z-index style
    expect(mockGroupElement.style.zIndex).toBe('5');

    // Should have appended to container
    expect(container.appendChild).toHaveBeenCalledWith(mockGroupElement);
  });

  test('should render layer with children to Canvas', () => {
    const layerType = getType('layer');

    // Mock the getType function to return a simple rectangle type
    vi.spyOn(require('../core/registry'), 'getType').mockImplementation((name) => {
      if (name === 'layer') return layerType;
      if (name === 'rectangle') {
        return {
          decompose: () => ({
            _renderType: 'rectangle',
            attributes: {},
            renderToSvg: vi.fn(),
            renderToCanvas: vi.fn()
          })
        };
      }
      return undefined;
    });

    const result = layerType.decompose({
      x: 10,
      y: 20,
      opacity: 0.5,
      zIndex: 3,
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
      globalAlpha: 1
    };

    // Call the Canvas rendering function
    result.renderToCanvas(ctx);

    // Should have saved and restored context
    expect(ctx.save).toHaveBeenCalled();
    expect(ctx.restore).toHaveBeenCalled();

    // Should have applied transform
    expect(ctx.translate).toHaveBeenCalledWith(10, 20);

    // Should have applied opacity
    expect(ctx.globalAlpha).toBe(0.5);
  });
});
