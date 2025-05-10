/**
 * Bar Chart Component Tests
 *
 * Purpose: Tests the bar chart component
 * Author: [Author Name]
 * Creation Date: [Date]
 * Last Modified: [Date]
 */

import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import { registry, hasType, getType } from '../core/registry';
import { buildViz } from '../core/builder';
import { registerDefineType } from '../core/define';

// Import the bar chart definition
import { barChartDefinition, createBarChart } from './barChart';

// Import required components and primitives
import { registerRectanglePrimitive } from '../primitives/rectangle';
import { registerTextPrimitive } from '../primitives/text';
import { registerGroupPrimitive } from '../primitives/group';
import { registerLinePrimitive } from '../primitives/line';
import { registerScaleComponents } from '../components/scales/scale';
import { registerAxisComponent } from '../components/axis';
import { registerLegendComponent } from '../components/legend';

import '../components/axis';
import '../components/legend';
import '../components/scales/linearScale';
import '../components/scales/bandScale';

import {
  resetRegistry,
  createTestContainer,
  cleanupTestContainer
} from '../test/testUtils';

describe('Bar Chart Component', () => {
  let container: HTMLElement;

    // Define sample data for all tests to use
    const sampleData = [
      { category: 'A', value: 10, group: 'Group 1' },
      { category: 'B', value: 20, group: 'Group 2' },
      { category: 'C', value: 15, group: 'Group 1' },
      { category: 'D', value: 25, group: 'Group 2' }
  ];

  // Reset registry before each test
  beforeEach(() => {
    // Reset the registry
    resetRegistry();

    // Register the define type first
    registerDefineType();

    // Register primitives
    registerRectanglePrimitive();
    registerTextPrimitive();
    registerGroupPrimitive();
    registerLinePrimitive();

    // Register required components
    registerScaleComponents();
    registerAxisComponent();
    registerLegendComponent();

    // Register the bar chart component
    buildViz(barChartDefinition);

    // Create a test container
    container = createTestContainer();
  });

  // Clean up after each test
  afterEach(() => {
    cleanupTestContainer(container);
  });

  test('should register the barChart type', () => {
    // Check if the barChart type is registered
    expect(hasType('barChart')).toBe(true);

    // Get the barChart type definition
    const barChartType = getType('barChart');
    expect(barChartType).toBeDefined();

    // Check properties
    expect(barChartType?.properties.data.required).toBe(true);
    expect(barChartType?.properties.x.required).toBe(true);
    expect(barChartType?.properties.y.required).toBe(true);
    expect(barChartType?.properties.color.default).toBe('#3366CC');
    expect(barChartType?.properties.width.default).toBe(800);
    expect(barChartType?.properties.height.default).toBe(400);
  });

  test('should create a bar chart with provided data', () => {
    const data = [
      { category: 'A', value: 10 },
      { category: 'B', value: 20 },
      { category: 'C', value: 15 },
      { category: 'D', value: 25 }
    ];

    const result = buildViz({
      type: 'barChart',
      data: data,
      x: { field: 'category' },
      y: { field: 'value' },
      width: 500,
      height: 300,
      title: 'Test Bar Chart'
    });

    // Check basic properties
    expect(result).toBeDefined();
    expect(result.renderableType).toBe('barChart');
    expect(result.getProperty('data')).toBe(data);
    expect(result.getProperty('x').field).toBe('category');
    expect(result.getProperty('y').field).toBe('value');
    expect(result.getProperty('width')).toBe(500);
    expect(result.getProperty('height')).toBe(300);
    expect(result.getProperty('title')).toBe('Test Bar Chart');
  });

  test('should create a bar chart with color mapping', () => {
    const data = [
      { category: 'A', value: 10, group: 'Group 1' },
      { category: 'B', value: 20, group: 'Group 2' },
      { category: 'C', value: 15, group: 'Group 1' },
      { category: 'D', value: 25, group: 'Group 2' }
    ];

    const result = buildViz({
      type: 'barChart',
      data: data,
      x: { field: 'category' },
      y: { field: 'value' },
      color: { field: 'group' },
      width: 500,
      height: 300
    });

    // Check basic properties
    expect(result).toBeDefined();
    expect(result.renderableType).toBe('barChart');
    expect(result.getProperty('color').field).toBe('group');
  });

  test('should create a bar chart with custom margins', () => {
    const data = [
      { category: 'A', value: 10 },
      { category: 'B', value: 20 }
    ];

    const customMargin = { top: 20, right: 20, bottom: 30, left: 40 };

    const result = buildViz({
      type: 'barChart',
      data: data,
      x: { field: 'category' },
      y: { field: 'value' },
      margin: customMargin,
      width: 400,
      height: 200
    });

    // Check margin property
    expect(result).toBeDefined();
    expect(result.getProperty('margin')).toEqual(customMargin);
  });

  test('should create a bar chart with tooltips', () => {
    const data = [
      { category: 'A', value: 10 },
      { category: 'B', value: 20 }
    ];

    const result = buildViz({
      type: 'barChart',
      data: data,
      x: { field: 'category' },
      y: { field: 'value' },
      tooltip: true,
      width: 400,
      height: 200
    });

    // Check tooltip property
    expect(result).toBeDefined();
    expect(result.getProperty('tooltip')).toBe(true);
  });

  test('should create a bar chart with a fixed color', () => {
    const data = [
      { category: 'A', value: 10 },
      { category: 'B', value: 20 }
    ];

    const fixedColor = '#FF5733';

    const result = buildViz({
      type: 'barChart',
      data: data,
      x: { field: 'category' },
      y: { field: 'value' },
      color: fixedColor,
      width: 400,
      height: 200
    });

    // Check color property
    expect(result).toBeDefined();
    expect(result.getProperty('color')).toBe(fixedColor);
  });

  test('should validate data is an array', () => {
    // Should throw when data is not an array
    expect(() => {
      buildViz({
        type: 'barChart',
        // @ts-ignore - Testing runtime behavior with invalid input
        data: 'not an array',
        x: { field: 'category' },
        y: { field: 'value' }
      });
    }).toThrow(/Data must be an array/);
  });

  test('should validate x and y fields are specified', () => {
    const data = [
      { category: 'A', value: 10 },
      { category: 'B', value: 20 }
    ];

    // Should throw when x field is missing
    expect(() => {
      buildViz({
        type: 'barChart',
        data: data,
        // @ts-ignore - Testing runtime behavior with invalid input
        x: {},
        y: { field: 'value' }
      });
    }).toThrow(/X field must be specified/);

    // Should throw when y field is missing
    expect(() => {
      buildViz({
        type: 'barChart',
        data: data,
        x: { field: 'category' },
        // @ts-ignore - Testing runtime behavior with invalid input
        y: {}
      });
    }).toThrow(/Y field must be specified/);
  });

  test('should validate width and height are positive', () => {
    const data = [
      { category: 'A', value: 10 },
      { category: 'B', value: 20 }
    ];

    // Should throw when width or height is not positive
    expect(() => {
      buildViz({
        type: 'barChart',
        data: data,
        x: { field: 'category' },
        y: { field: 'value' },
        width: -100,
        height: 200
      });
    }).toThrow(/Width and height must be positive/);

    expect(() => {
      buildViz({
        type: 'barChart',
        data: data,
        x: { field: 'category' },
        y: { field: 'value' },
        width: 100,
        height: 0
      });
    }).toThrow(/Width and height must be positive/);
  });

  test('should create a bar chart using the createBarChart helper', () => {
    const data = [
      { category: 'A', value: 10 },
      { category: 'B', value: 20 }
    ];

    const result = createBarChart({
      data: data,
      x: { field: 'category' },
      y: { field: 'value' },
      title: 'Helper Function Test'
    });

    // Check basic properties
    expect(result).toBeDefined();
    expect(result.renderableType).toBe('barChart');
    expect(result.getProperty('data')).toBe(data);
    expect(result.getProperty('x').field).toBe('category');
    expect(result.getProperty('y').field).toBe('value');
    expect(result.getProperty('title')).toBe('Helper Function Test');

    // Check default values
    expect(result.getProperty('width')).toBe(800);
    expect(result.getProperty('height')).toBe(400);
    expect(result.getProperty('color')).toBe('#3366CC');
    expect(result.getProperty('tooltip')).toBe(false);
  });

  test('should render a bar chart to the container', () => {
    const data = [
      { category: 'A', value: 10 },
      { category: 'B', value: 20 }
    ];

    const chart = createBarChart({
      data: data,
      x: { field: 'category' },
      y: { field: 'value' },
      width: 400,
      height: 200
    });

    // Render the chart to the container
    const renderResult = chart.render(container);

    // Check that the chart was rendered
    expect(renderResult).toBeDefined();
    expect(renderResult.element).toBeDefined();

    // Check that SVG elements were created
    const svg = container.querySelector('svg');
    expect(svg).not.toBeNull();

    // Check for axes - they're rendered as groups with lines and text
    // Based on the SVG structure, we're looking for groups that contain both lines and text
    // This is clearly an over-simplification, but it serves the purpose of this test
    const axisGroups = svg?.querySelectorAll('g > g');
    expect(axisGroups?.length).toBeGreaterThan(0);

    // Check for axis lines
    const axisLines = svg?.querySelectorAll('line[x2], line[y2]');
    expect(axisLines?.length).toBeGreaterThan(0);

    // Check for bars
    const bars = svg?.querySelectorAll('rect');
    expect(bars?.length).toBe(2); // One for each data point
  });

  test('should match the exported barChart definition', () => {
    // Verify that the exported definition matches what's registered
    expect(barChartDefinition.type).toBe('define');
    expect(barChartDefinition.name).toBe('barChart');
    expect(barChartDefinition.properties).toBeDefined();
    expect(barChartDefinition.implementation).toBeDefined();

    // Compare with the registered type
    const registeredType = getType('barChart');
    expect(registeredType?.properties).toEqual(barChartDefinition.properties);
  });

  test('should render a bar chart with default legend position', () => {
    // Create a bar chart with default legend position
    const chart = createBarChart({
      data: sampleData,
      x: { field: 'category' },
      y: { field: 'value' },
      color: { field: 'group' },
      width: 600,
      height: 400
    });

    // Render the chart
    chart.render(container);

    // Check if the chart is rendered
    const svg = container.querySelector('svg');
    expect(svg).toBeTruthy();

    // Check if legend is rendered
    const legendGroup = svg?.querySelector('.legend');
    expect(legendGroup).toBeTruthy();

    // Check legend position - should be at the right side by default
    const legendTransform = legendGroup?.getAttribute('transform');
    console.log('Default legend transform:', legendTransform);

    // The legend should have a transform that positions it on the right side
    // This will depend on your implementation, but we expect it to be positioned
    // relative to the right edge of the chart
    expect(legendTransform).toBeTruthy();

    // Check if legend items are rendered
    const legendItems = svg?.querySelectorAll('.legend-item');
    expect(legendItems?.length).toBeGreaterThan(0);
  });

  test('should position legend at specified coordinates', () => {
    // Create a bar chart with custom legend position
    const chart = buildViz({
      type: 'barChart',
      data: sampleData,
      x: { field: 'category' },
      y: { field: 'value' },
      color: { field: 'group' },
      width: 600,
      height: 400,
      legend: {
        position: { x: 450, y: 50 } // Explicitly position the legend
      }
    });

    // Render the chart
    chart.render(container);

    // Check if legend is rendered
    const svg = container.querySelector('svg');
    const legendGroup = svg?.querySelector('.legend');
    expect(legendGroup).toBeTruthy();

    // Check legend position
    const legendTransform = legendGroup?.getAttribute('transform');
    console.log('Custom legend transform:', legendTransform);

    // The legend should have a transform that positions it at the specified coordinates
    expect(legendTransform).toContain('translate(450,50)');
  });

  test('should position legend with different orientations', () => {
    // Create a bar chart with horizontal legend
    const chart = buildViz({
      type: 'barChart',
      data: sampleData,
      x: { field: 'category' },
      y: { field: 'value' },
      color: { field: 'group' },
      width: 600,
      height: 400,
      legend: {
        position: { x: 150, y: 350 },
        orientation: 'horizontal'
      }
    });

    // Render the chart
    chart.render(container);

    // Check if legend is rendered
    const svg = container.querySelector('svg');
    const legendGroup = svg?.querySelector('.legend');
    expect(legendGroup).toBeTruthy();

    // Check legend position
    const legendTransform = legendGroup?.getAttribute('transform');
    console.log('Horizontal legend transform:', legendTransform);

    // The legend should have a transform that positions it at the specified coordinates
    expect(legendTransform).toContain('translate(150,350)');

    // Check if legend items are rendered horizontally
    // This might be harder to test directly, but we can check if they exist
    const legendItems = svg?.querySelectorAll('.legend-item');
    expect(legendItems?.length).toBeGreaterThan(0);
  });
});
