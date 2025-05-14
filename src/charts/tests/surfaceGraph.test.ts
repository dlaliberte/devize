/**
 * Surface Graph Component Tests
 *
 * Purpose: Tests the surface graph visualization component
 * Author: Cody
 * Creation Date: 2023-12-22
 */

import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import { registry, hasType, getType } from '../../core/registry';
import { buildViz } from '../../core/builder';
import { registerDefineType } from '../../core/define';

// Import the surface graph definition
import { surfaceGraphDefinition, createSurfaceGraph, SurfaceData } from '../surfaceGraph';

// Import required components and primitives
import { registerCartesian3DCoordinateSystem } from '../../components/coordinates/cartesian3DCoordinateSystem';
import { registerScaleComponents } from '../../components/scales/scale';

import {
  resetRegistry,
  createTestContainer,
  cleanupTestContainer
} from '../../test/testUtils';

// We'll use a minimal mock for Three.js that just provides the necessary structure
// without mocking all the functionality
vi.mock('three', async () => {
  const actual = await vi.importActual('three');
  return {
    ...actual,
    // Override only what's necessary for our tests
    WebGLRenderer: vi.fn().mockImplementation(() => ({
      setSize: vi.fn(),
      setPixelRatio: vi.fn(),
      domElement: document.createElement('canvas'),
      render: vi.fn(),
      dispose: vi.fn()
    }))
  };
});

// Minimal mock for OrbitControls
vi.mock('three/examples/jsm/controls/OrbitControls', async () => {
  const actual = await vi.importActual('three/examples/jsm/controls/OrbitControls');
  return {
    ...actual,
    OrbitControls: vi.fn().mockImplementation(() => ({
      enableDamping: true,
      dampingFactor: 0.25,
      enableRotate: true,
      enableZoom: true,
      enablePan: true,
      update: vi.fn(),
      dispose: vi.fn()
    }))
  };
});

describe('Surface Graph Component', () => {
  let container: HTMLElement;

  // Define sample data for all tests to use
  const generateSampleData = (): SurfaceData => {
    const size = 10;
    const values: number[][] = [];

    for (let y = 0; y < size; y++) {
      const row: number[] = [];
      for (let x = 0; x < size; x++) {
        // Create a simple mathematical surface (e.g., a sine wave)
        const xNorm = x / size * 4 * Math.PI;
        const yNorm = y / size * 4 * Math.PI;
        const z = Math.sin(xNorm) * Math.cos(yNorm) * 2;
        row.push(z);
      }
      values.push(row);
    }

    return { values };
  };

  const sampleData = generateSampleData();

  // Reset registry before each test
  beforeEach(() => {
    // Reset the registry
    resetRegistry();

    // Register the define type first
    registerDefineType();

    // Register required components
    registerCartesian3DCoordinateSystem();
    registerScaleComponents();

    // Register the surface graph component
    buildViz(surfaceGraphDefinition);

    // Create a test container
    container = createTestContainer();

  });

  // Clean up after each test
  afterEach(() => {
    cleanupTestContainer(container);
    vi.clearAllMocks();
  });

  test('should register the surfaceGraph type', () => {
    // Check if the surfaceGraph type is registered
    expect(hasType('surfaceGraph')).toBe(true);

    // Get the surfaceGraph type definition
    const surfaceGraphType = getType('surfaceGraph');
    expect(surfaceGraphType).toBeDefined();

    // Check properties
    expect(surfaceGraphType?.properties.data.required).toBe(true);
    expect(surfaceGraphType?.properties.width.required).toBe(true);
    expect(surfaceGraphType?.properties.height.required).toBe(true);
    expect(surfaceGraphType?.properties.colorRange.default).toEqual(['#0000FF', '#FF0000']);
    expect(surfaceGraphType?.properties.wireframe.default).toBe(true);
    expect(surfaceGraphType?.properties.surfaceOpacity.default).toBe(0.8);
  });

  test('should create a surface graph with provided data', () => {
    const result = buildViz({
      type: 'surfaceGraph',
      data: sampleData,
      width: 500,
      height: 300
    });

    // Check basic properties
    expect(result).toBeDefined();
    expect(result.renderableType).toBe('surfaceGraph');
    expect(result.getProperty('data')).toBe(sampleData);
    expect(result.getProperty('width')).toBe(500);
    expect(result.getProperty('height')).toBe(300);
  });

  test('should create a surface graph with custom visual options', () => {
    const customColorRange = ['#00FF00', '#FF00FF'];
    const customWireframeColor = '#CCCCCC';
    const customOpacity = 0.5;

    const result = buildViz({
      type: 'surfaceGraph',
      data: sampleData,
      width: 500,
      height: 300,
      colorRange: customColorRange,
      wireframeColor: customWireframeColor,
      surfaceOpacity: customOpacity,
      wireframe: false
    });

    // Check visual properties
    expect(result.getProperty('colorRange')).toEqual(customColorRange);
    expect(result.getProperty('wireframeColor')).toBe(customWireframeColor);
    expect(result.getProperty('surfaceOpacity')).toBe(customOpacity);
    expect(result.getProperty('wireframe')).toBe(false);
  });

  test('should create a surface graph with custom projection', () => {
    const customProjection = {
      type: 'orthographic' as const,
      distance: 500
    };

    const result = buildViz({
      type: 'surfaceGraph',
      data: sampleData,
      width: 500,
      height: 300,
      projection: customProjection
    });

    // Check projection property
    expect(result.getProperty('projection')).toEqual(customProjection);
  });

  test('should create a surface graph with custom camera position', () => {
    const customCameraPosition = { x: 100, y: 200, z: 300 };

    const result = buildViz({
      type: 'surfaceGraph',
      data: sampleData,
      width: 500,
      height: 300,
      cameraPosition: customCameraPosition
    });

    // Check camera position property
    expect(result.getProperty('cameraPosition')).toEqual(customCameraPosition);
  });

  test('should create a surface graph with custom interaction options', () => {
    const result = buildViz({
      type: 'surfaceGraph',
      data: sampleData,
      width: 500,
      height: 300,
      enableRotation: false,
      enableZoom: false,
      enablePan: false
    });

    // Check interaction properties
    expect(result.getProperty('enableRotation')).toBe(false);
    expect(result.getProperty('enableZoom')).toBe(false);
    expect(result.getProperty('enablePan')).toBe(false);
  });

  test('should create a surface graph with custom domains', () => {
    const xDomain: [number, number] = [-5, 5];
    const yDomain: [number, number] = [-5, 5];
    const zDomain: [number, number] = [-2, 2];
    const colorDomain: [number, number] = [-2, 2];

    const result = buildViz({
      type: 'surfaceGraph',
      data: sampleData,
      width: 500,
      height: 300,
      xDomain,
      yDomain,
      zDomain,
      colorDomain
    });

    // Check domain properties
    expect(result.getProperty('xDomain')).toEqual(xDomain);
    expect(result.getProperty('yDomain')).toEqual(yDomain);
    expect(result.getProperty('zDomain')).toEqual(zDomain);
    expect(result.getProperty('colorDomain')).toEqual(colorDomain);
  });

  test('should create a surface graph using the createSurfaceGraph helper', () => {
    const result = createSurfaceGraph({
      data: sampleData,
      width: 500,
      height: 300,
      wireframe: true,
      colorRange: ['blue', 'red']
    });

    // Check basic properties
    expect(result).toBeDefined();
    expect(result.renderableType).toBe('surfaceGraph');
    expect(result.getProperty('data')).toBe(sampleData);
    expect(result.getProperty('width')).toBe(500);
    expect(result.getProperty('height')).toBe(300);
    expect(result.getProperty('wireframe')).toBe(true);
    expect(result.getProperty('colorRange')).toEqual(['blue', 'red']);
  });

  test('should render a surface graph to the container', () => {
    const chart = createSurfaceGraph({
      data: sampleData,
      width: 400,
      height: 200
    });

    // Render the chart to the container
    const renderResult = chart.render(container);

    // Check that the chart was rendered
    expect(renderResult).toBeDefined();
    expect(renderResult.element).toBeDefined();

    // Since we're using Three.js, the SVG should contain a message
    const foreignObject = container.querySelector('foreignObject');
    expect(foreignObject).not.toBeNull();

    const messageDiv = foreignObject?.querySelector('div');
    expect(messageDiv?.textContent).toContain('Surface Graph requires Three.js rendering');
  });

  test('should have a renderToThreeJS method', () => {
    const chart = createSurfaceGraph({
      data: sampleData,
      width: 400,
      height: 200
    });

    // Check that the renderToThreeJS method exists
    expect(chart.renderToThreeJS).toBeDefined();
    expect(typeof chart.renderToThreeJS).toBe('function');
  });

  // Skip this test for now until we have a better way to test Three.js rendering
  test('should render to Three.js when renderToThreeJS is called', () => {
    const chart = createSurfaceGraph({
      data: sampleData,
      width: 400,
      height: 200
    });

    // Call renderToThreeJS
    const renderer = chart.renderToThreeJS(container);

    // Check that a renderer was returned
    expect(renderer).toBeDefined();

    // Check that the container now contains a canvas (from the mocked WebGLRenderer)
    const canvas = container.querySelector('canvas');
    expect(canvas).not.toBeNull();
  });

  test('should handle data with custom coordinates', () => {
    // Create data with custom coordinates
    const dataWithCoordinates: SurfaceData = {
      values: sampleData.values,
      xCoordinates: Array.from({ length: sampleData.values[0].length }, (_, i) => i * 0.5),
      yCoordinates: Array.from({ length: sampleData.values.length }, (_, i) => i * 0.5)
    };

    const result = createSurfaceGraph({
      data: dataWithCoordinates,
      width: 500,
      height: 300
    });

    // Check that the data was stored correctly
    expect(result.getProperty('data')).toBe(dataWithCoordinates);
    expect(result.getProperty('data').xCoordinates).toBeDefined();
    expect(result.getProperty('data').yCoordinates).toBeDefined();
  });

    test('should validate data structure', () => {
    // Should throw when data is not properly structured
    expect(() => {
        createSurfaceGraph({
        // @ts-ignore - Testing runtime behavior with invalid input
        data: { values: 'not an array' },
        width: 500,
        height: 300
        });
    }).toThrow(/Data must contain a values array/);

    // Should throw when data values is not a 2D array
    expect(() => {
        createSurfaceGraph({
        // @ts-ignore - Testing runtime behavior with invalid input
        data: { values: [1, 2, 3] },
        width: 500,
        height: 300
        });
    }).toThrow(/Data values must be a 2D array/);
    });

  test('should validate width and height are positive', () => {
    // Should throw when width or height is not positive
    expect(() => {
      createSurfaceGraph({
        data: sampleData,
        width: -100,
        height: 200
      });
    }).toThrow(/Width and height must be positive/);

    expect(() => {
      createSurfaceGraph({
        data: sampleData,
        width: 100,
        height: 0
      });
    }).toThrow(/Width and height must be positive/);
  });
});
