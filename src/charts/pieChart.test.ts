/**
 * Pie Chart Component Tests
 *
 * Tests for the pie chart visualization component
 */

import { buildViz } from '../../src/core/builder';
import { renderViz, updateViz } from '../../src/core/renderer';
import '../../src/charts/pieChart';

describe('Pie Chart Component', () => {
  // Create a DOM element for testing
  let container: HTMLElement;

  beforeEach(() => {
    // Set up a fresh container before each test
    container = document.createElement('div');
    container.style.width = '500px';
    container.style.height = '500px';
    document.body.appendChild(container);
  });

  afterEach(() => {
    // Clean up after each test
    if (container && container.parentNode) {
      container.parentNode.removeChild(container);
    }
  });

  // Sample data for testing
  const testData = [
    { category: "Category A", value: 35 },
    { category: "Category B", value: 25 },
    { category: "Category C", value: 20 },
    { category: "Category D", value: 15 },
    { category: "Category E", value: 5 }
  ];

  test('should create a basic pie chart', () => {
    const pieChart = buildViz({
      type: 'pieChart',
      data: testData,
      value: { field: 'value' },
      category: { field: 'category' },
      width: 400,
      height: 400
    });

    expect(pieChart).toBeDefined();
    expect(pieChart.renderableType).toBe('pieChart');

    // Render the chart
    const result = renderViz(pieChart, container);
    expect(result).toBeDefined();

    // Check that SVG elements were created
    const svg = container.querySelector('svg');
    expect(svg).toBeTruthy();

    // Check that paths were created for each slice
    const paths = svg?.querySelectorAll('path');
    expect(paths?.length).toBe(testData.length);
  });

  test('should create a donut chart', () => {
    const donutChart = buildViz({
      type: 'pieChart',
      data: testData,
      value: { field: 'value' },
      category: { field: 'category' },
      innerRadius: '50%',
      width: 400,
      height: 400
    });

    // Render the chart
    renderViz(donutChart, container);

    // Check that SVG elements were created
    const svg = container.querySelector('svg');
    expect(svg).toBeTruthy();

    // Check that paths were created for each slice
    const paths = svg?.querySelectorAll('path');
    expect(paths?.length).toBe(testData.length);

    // For a donut chart, the paths should have more complex d attributes
    // that include both outer and inner arcs
    const firstPath = paths?.[0];
    const pathData = firstPath?.getAttribute('d') || '';
    expect(pathData).toContain('A'); // Arc command

    // A donut chart path should have multiple arc commands for inner and outer edges
    const arcCount = (pathData.match(/A/g) || []).length;
    expect(arcCount).toBeGreaterThan(1);
  });

  test('should update when data changes', async () => {
    // Create initial chart
    const pieChart = buildViz({
      type: 'pieChart',
      data: testData,
      value: { field: 'value' },
      category: { field: 'category' },
      width: 400,
      height: 400
    });

    // Render the chart
    renderViz(pieChart, container);

    // Get initial paths
    const initialPaths = container.querySelectorAll('path');
    const initialPathCount = initialPaths.length;

    // Filter data
    const filteredData = testData.filter(d => d.value > 15);

    // Update the chart with new data
    const updatedChart = buildViz({
      type: 'pieChart',
      data: filteredData,
      value: { field: 'value' },
      category: { field: 'category' },
      width: 400,
      height: 400
    });

    // Clear container and render the updated chart
    container.innerHTML = '';
    renderViz(updatedChart, container);

    // Check that paths were updated
    const updatedPaths = container.querySelectorAll('path');
    expect(updatedPaths.length).toBe(filteredData.length);
    expect(updatedPaths.length).toBeLessThan(initialPathCount);
  });

  test('should handle empty data', () => {
    const pieChart = buildViz({
      type: 'pieChart',
      data: [],
      value: { field: 'value' },
      category: { field: 'category' },
      width: 400,
      height: 400
    });

    // Render should not throw an error with empty data
    expect(() => renderViz(pieChart, container)).not.toThrow();
  });

  test('should apply custom colors', () => {
    const customColor = "#FF0000"; // Use a single color for all slices

    const pieChart = buildViz({
      type: 'pieChart',
      data: testData,
      value: { field: 'value' },
      category: { field: 'category' },
      color: customColor, // Use a string color directly
      width: 400,
      height: 400
    });

    // Render the chart
    renderViz(pieChart, container);

    // Check that paths have the custom color
    const paths = container.querySelectorAll('path');
    const firstPath = paths[0];

    // Check if the first path has our custom color
    const fillColor = firstPath.getAttribute('fill');
    expect(fillColor).toBe(customColor);
  });

  test('should render labels when enabled', () => {
    const pieChart = buildViz({
      type: 'pieChart',
      data: testData,
      value: { field: 'value' },
      category: { field: 'category' },
      labels: {
        enabled: true,
        type: 'percent',
        position: 'inside'
      },
      width: 400,
      height: 400
    });

    // Render the chart
    renderViz(pieChart, container);

    // Check that text elements were created for labels
    const labels = container.querySelectorAll('text');

    // Should have at least one label per data point
    // (Some very small slices might not get labels due to minSliceAngle)
    expect(labels.length).toBeGreaterThanOrEqual(testData.length - 1);
  });

  test('should render pie chart with correct radius relative to container size', () => {
  // Set specific container dimensions
  container.style.width = '400px';
  container.style.height = '400px';

  // Create a pie chart with 40% outer radius
  const pieChart = buildViz({
    type: 'pieChart',
    data: testData,
    value: { field: 'value' },
    category: { field: 'category' },
    outerRadius: '40%', // 40% of the available space
    width: 400,
    height: 400
  });

  // Render the chart
  renderViz(pieChart, container);

  // Get the SVG element
  const svg = container.querySelector('svg');
  expect(svg).toBeTruthy();

  // Get all path elements (slices)
  const paths = svg?.querySelectorAll('path');
  expect(paths?.length).toBe(testData.length);

  // Get the first path and its bounding box
  const firstPath = paths?.[0];
  const pathBBox = firstPath?.getBoundingClientRect();

  // Get the container's bounding box
  const containerBBox = container.getBoundingClientRect();

  // Calculate the center of the container
  const containerCenterX = containerBBox.width / 2;
  const containerCenterY = containerBBox.height / 2;

  // Calculate the expected maximum radius (40% of half the minimum dimension)
  const minDimension = Math.min(containerBBox.width, containerBBox.height);
  const expectedMaxRadius = (minDimension / 2) * 0.4;

  // Check that the path extends close to but not beyond the expected radius
  // We'll verify this by checking that the path's bounding box is within
  // a reasonable range of the expected size

  // Calculate the distance from the center to the furthest point of the path
  // This is an approximation since getBoundingClientRect() gives us a rectangle
  const pathWidth = pathBBox?.width || 0;
  const pathHeight = pathBBox?.height || 0;
  const pathMaxDimension = Math.max(pathWidth, pathHeight);

  // The combined dimensions of all paths should be close to the expected diameter
  // Get all paths' bounding boxes
  const allPathsBBox = Array.from(paths || []).reduce((bbox, path) => {
    const rect = path.getBoundingClientRect();
    return {
      left: Math.min(bbox.left, rect.left),
      top: Math.min(bbox.top, rect.top),
      right: Math.max(bbox.right, rect.right),
      bottom: Math.max(bbox.bottom, rect.bottom)
    };
  }, { left: Infinity, top: Infinity, right: -Infinity, bottom: -Infinity });

  // Calculate the width and height of all paths combined
  const allPathsWidth = allPathsBBox.right - allPathsBBox.left;
  const allPathsHeight = allPathsBBox.bottom - allPathsBBox.top;

  // The maximum dimension should be close to the expected diameter (2 * radius)
  const allPathsMaxDimension = Math.max(allPathsWidth, allPathsHeight);
  const expectedDiameter = expectedMaxRadius * 2;

  // Allow for some margin of error (10%)
  const lowerBound = expectedDiameter * 0.9;
  const upperBound = expectedDiameter * 1.1;

  // Check that the chart size is within the expected range
  expect(allPathsMaxDimension).toBeGreaterThanOrEqual(lowerBound);
  expect(allPathsMaxDimension).toBeLessThanOrEqual(upperBound);

  // Additionally, check that the chart is centered in the container
  const chartCenterX = allPathsBBox.left + (allPathsWidth / 2);
  const chartCenterY = allPathsBBox.top + (allPathsHeight / 2);

  // Calculate the distance between the centers
  const centerDistanceX = Math.abs(chartCenterX - (containerBBox.left + containerCenterX));
  const centerDistanceY = Math.abs(chartCenterY - (containerBBox.top + containerCenterY));

  // The centers should be close (allowing for some margin of error)
  const maxCenterDistance = minDimension * 0.1; // 10% of the minimum dimension
  expect(centerDistanceX).toBeLessThanOrEqual(maxCenterDistance);
  expect(centerDistanceY).toBeLessThanOrEqual(maxCenterDistance);
});

});
