import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import { registry, hasType, getType } from '../core/registry';
import { buildViz } from '../core/builder';
import { registerDefineType } from '../core/define';

// Import the scatter plot definition
import { scatterPlotDefinition, createScatterPlot } from './scatterPlot';

// Import required components and primitives
import { registerCirclePrimitive } from '../primitives/circle';
import { registerLinePrimitive } from '../primitives/line';
import { registerTextPrimitive } from '../primitives/text';
import { registerGroupPrimitive } from '../primitives/group';
import { registerAxisComponent } from '../components/axis';
import { registerLegendComponent } from '../components/legend';
import { registerLinearScaleComponent } from '../components/scales/linearScale';
import { registerBandScaleComponent } from '../components/scales/bandScale';

import '../components/axis';
import '../components/legend';
import '../components/scales/linearScale';
import '../components/scales/bandScale';

// Test utilities
import {
  resetRegistry,
  createTestContainer,
  cleanupTestContainer
} from '../test/testUtils';

describe('Scatter Plot Component', () => {
  let container: HTMLElement;

  // Define sample data for all tests to use
  const sampleData = [
    { xValue: 1, yValue: 10, category: 'A' },
    { xValue: 2, yValue: 20, category: 'B' },
    { xValue: 3, yValue: 15, category: 'A' },
    { xValue: 4, yValue: 25, category: 'B' }
  ];

  // Reset registry before each test
  beforeEach(() => {
    resetRegistry();

    registerDefineType();

    // Register primitives
    registerCirclePrimitive();
    registerLinePrimitive();
    registerTextPrimitive();
    registerGroupPrimitive();

    // Register required components
    registerAxisComponent();
    registerLegendComponent();
    registerLinearScaleComponent();
    registerBandScaleComponent();

    // Register the scatter plot component
    buildViz(scatterPlotDefinition);

    container = createTestContainer();
  });

  // Clean up after each test
  afterEach(() => {
    cleanupTestContainer(container);
  });

  test('should register the scatterPlot type', () => {
    expect(hasType('scatterPlot')).toBe(true);
    const scatterPlotType = getType('scatterPlot');
    expect(scatterPlotType).toBeDefined();

    expect(scatterPlotType?.properties.data.required).toBe(true);
    expect(scatterPlotType?.properties.x.required).toBe(true);
    expect(scatterPlotType?.properties.y.required).toBe(true);
    expect(scatterPlotType?.properties.color.default).toBe('#3366CC');
    // Updated to match the new implementation
    expect(scatterPlotType?.properties.size.default).toEqual({ value: 5 });
  });

  test('should create a scatter plot with provided data', () => {
    const result = buildViz({
      type: 'scatterPlot',
      data: sampleData,
      x: { field: 'xValue' },
      y: { field: 'yValue' },
      width: 500,
      height: 300,
      title: 'Test Scatter Plot'
    });

    expect(result).toBeDefined();
    expect(result.renderableType).toBe('scatterPlot');
    expect(result.getProperty('data')).toBe(sampleData);
    expect(result.getProperty('x').field).toBe('xValue');
    expect(result.getProperty('y').field).toBe('yValue');
    expect(result.getProperty('width')).toBe(500);
    expect(result.getProperty('height')).toBe(300);
    expect(result.getProperty('title')).toBe('Test Scatter Plot');
  });

  test('should create a scatter plot with size scale based on data', () => {
    const customizedSizeData = sampleData.map((point, index) => ({ ...point, size: index * 2 + 3 }));

    const result = buildViz({
      type: 'scatterPlot',
      data: customizedSizeData,
      x: { field: 'xValue' },
      y: { field: 'yValue' },
      size: { field: 'size' },
      width: 500,
      height: 300
    });

    expect(result).toBeDefined();
    expect(result.getProperty('size').field).toBe('size');
  });

  test('should create a scatter plot with default and specified color', () => {
    const data = [
      { xValue: 1, yValue: 10, category: 'A' },
      { xValue: 2, yValue: 20, category: 'B' }
    ];

    const customColor = '#FF5733';

    const resultWithDefaultColor = buildViz({
      type: 'scatterPlot',
      data,
      x: { field: 'xValue' },
      y: { field: 'yValue' }
    });

    const resultWithCustomColor = buildViz({
      type: 'scatterPlot',
      data,
      x: { field: 'xValue' },
      y: { field: 'yValue' },
      color: customColor
    });

    expect(resultWithDefaultColor).toBeDefined();
    expect(resultWithDefaultColor.getProperty('color')).toBe('#3366CC');

    expect(resultWithCustomColor).toBeDefined();
    expect(resultWithCustomColor.getProperty('color')).toBe(customColor);
  });

  test('should validate data is an array', () => {
    expect(() => {
      buildViz({
        type: 'scatterPlot',
        // @ts-ignore - Testing runtime behavior with invalid input
        data: 'not an array',
        x: { field: 'xValue' },
        y: { field: 'yValue' }
      });
    }).toThrow(/Data must be an array/);
  });

  test('should validate x and y fields are specified', () => {
    expect(() => {
      buildViz({
        type: 'scatterPlot',
        data: sampleData,
        // @ts-ignore - Testing runtime behavior with invalid input
        x: {},
        y: { field: 'yValue' }
      });
    }).toThrow(/X field must be specified/);

    expect(() => {
      buildViz({
        type: 'scatterPlot',
        data: sampleData,
        x: { field: 'xValue' },
        // @ts-ignore - Testing runtime behavior with invalid input
        y: {}
      });
    }).toThrow(/Y field must be specified/);
  });

  test('should validate width and height are positive', () => {
    expect(() => {
      buildViz({
        type: 'scatterPlot',
        data: sampleData,
        x: { field: 'xValue' },
        y: { field: 'yValue' },
        width: -100,
        height: 200
      });
    }).toThrow(/Width and height must be positive/);

    expect(() => {
      buildViz({
        type: 'scatterPlot',
        data: sampleData,
        x: { field: 'xValue' },
        y: { field: 'yValue' },
        width: 100,
        height: 0
      });
    }).toThrow(/Width and height must be positive/);
  });

  test('should create a scatter plot using the createScatterPlot helper', () => {
    const result = createScatterPlot({
      data: sampleData,
      x: { field: 'xValue' },
      y: { field: 'yValue' },
      title: 'Helper Function Test'
    });

    expect(result).toBeDefined();
    expect(result.renderableType).toBe('scatterPlot');
    expect(result.getProperty('data')).toBe(sampleData);
    expect(result.getProperty('x').field).toBe('xValue');
    expect(result.getProperty('y').field).toBe('yValue');
    expect(result.getProperty('title')).toBe('Helper Function Test');
    expect(result.getProperty('width')).toBe(800);
    expect(result.getProperty('height')).toBe(400);
    expect(result.getProperty('color')).toBe('#3366CC');
    expect(result.getProperty('tooltip')).toBe(false);
  });

  test('should render a scatter plot to the container', () => {
    const chart = createScatterPlot({
      data: sampleData,
      x: { field: 'xValue' },
      y: { field: 'yValue' },
      width: 400,
      height: 200
    });

    const renderResult = chart.render(container);
    expect(renderResult).toBeDefined();
    expect(renderResult.element).toBeDefined();

    const svg = container.querySelector('svg');
    expect(svg).not.toBeNull();

    const circles = svg?.querySelectorAll('circle');
    expect(circles?.length).toBe(sampleData.length);
  });
});
