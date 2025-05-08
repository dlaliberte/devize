/**
 * Bar Chart Tests
 */

import { buildViz } from '../core/builder';
import { initializeLibrary } from '../core/devize';

// Initialize the library
initializeLibrary();

// Import the bar chart component
import './barChart';

describe('Bar Chart Component', () => {
  test('should create a bar chart with provided data', () => {
    const data = [
      { category: 'A', value: 10 },
      { category: 'B', value: 20 },
      { category: 'C', value: 15 },
      { category: 'D', value: 25 }
    ];

    const barChart = buildViz({
      type: 'barChart',
      data: data,
      x: { field: 'category' },
      y: { field: 'value' },
      width: 500,
      height: 300,
      title: 'Test Bar Chart'
    });

    expect(barChart).toBeDefined();
   // expect(barChart.type).toBe('barChart');  Not yet.

    // Get the implementation result
    const impl = barChart.implementation;
    // expect(impl.type).toBe('group');

    // Check that we have the right number of children
    // (x-axis, y-axis, 4 bars, title)
    expect(impl.children.length).toBe(7);

    // Check the title
    const title = impl.children[6];
    // expect(title.type).toBe('text');
    expect(title.text).toBe('Test Bar Chart');
  });

  test('should create a bar chart with color mapping', () => {
    const data = [
      { category: 'A', value: 10, group: 'Group 1' },
      { category: 'B', value: 20, group: 'Group 2' },
      { category: 'C', value: 15, group: 'Group 1' },
      { category: 'D', value: 25, group: 'Group 2' }
    ];

    const barChart = buildViz({
      type: 'barChart',
      data: data,
      x: { field: 'category' },
      y: { field: 'value' },
      color: { field: 'group' },
      width: 500,
      height: 300
    });

    expect(barChart).toBeDefined();
    // expect(barChart.type).toBe('barChart');

    // Get the implementation result
    const impl = barChart.getProperty('implementation');

    // Check that we have a legend
    const legend = impl.children.find(child => child.type === 'legend');
    expect(legend).toBeDefined();
    expect(legend.legendType).toBe('color');

    // Check that we have items in the legend
    expect(legend.items.length).toBe(2);
    expect(legend.items[0].value).toBe('Group 1');
    expect(legend.items[1].value).toBe('Group 2');
  });

  // New test: Bar chart with custom margins
  test('should create a bar chart with custom margins', () => {
    const data = [
      { category: 'A', value: 10 },
      { category: 'B', value: 20 }
    ];

    const customMargin = { top: 20, right: 20, bottom: 30, left: 40 };

    const barChart = buildViz({
      type: 'barChart',
      data: data,
      x: { field: 'category' },
      y: { field: 'value' },
      margin: customMargin,
      width: 400,
      height: 200
    });

    expect(barChart).toBeDefined();

    // Get the implementation result
    const impl = barChart.getProperty('implementation');

    // Check that the group has the correct transform based on margins
    expect(impl.transform).toBe(`translate(${customMargin.left}, ${customMargin.top})`);
  });

  // New test: Bar chart with tooltip enabled
  test('should create a bar chart with tooltips', () => {
    const data = [
      { category: 'A', value: 10 },
      { category: 'B', value: 20 }
    ];

    const barChart = buildViz({
      type: 'barChart',
      data: data,
      x: { field: 'category' },
      y: { field: 'value' },
      tooltip: true,
      width: 400,
      height: 200
    });

    expect(barChart).toBeDefined();

    // Get the implementation result
    const impl = barChart.getProperty('implementation');

    // Find the bars
    const bars = impl.children.filter(child => child.type === 'rectangle');
    expect(bars.length).toBe(2);

    // Check that tooltips are enabled on bars
    bars.forEach(bar => {
      expect(bar.tooltip).toBe(true);
    });
  });

  // New test: Bar chart with a fixed color
  test('should create a bar chart with a fixed color', () => {
    const data = [
      { category: 'A', value: 10 },
      { category: 'B', value: 20 }
    ];

    const fixedColor = '#FF5733';

    const barChart = buildViz({
      type: 'barChart',
      data: data,
      x: { field: 'category' },
      y: { field: 'value' },
      color: fixedColor,
      width: 400,
      height: 200
    });

    expect(barChart).toBeDefined();

    // Get the implementation result
    const impl = barChart.getProperty('implementation');

    // Find the bars
    const bars = impl.children.filter(child => child.type === 'rectangle');
    expect(bars.length).toBe(2);

    // Check that all bars have the fixed color
    bars.forEach(bar => {
      expect(bar.fill).toBe(fixedColor);
    });
  });

  // New test: Bar chart with negative values
  test('should handle negative values correctly', () => {
    const data = [
      { category: 'A', value: 10 },
      { category: 'B', value: -5 },
      { category: 'C', value: 15 }
    ];

    const barChart = buildViz({
      type: 'barChart',
      data: data,
      x: { field: 'category' },
      y: { field: 'value' },
      width: 400,
      height: 200
    });

    expect(barChart).toBeDefined();

    // Get the implementation result
    const impl = barChart.getProperty('implementation');

    // Find the bars
    const bars = impl.children.filter(child => child.type === 'rectangle');
    expect(bars.length).toBe(3);

    // Check that the negative value bar has the correct height and position
    const negativeBar = bars.find(bar => bar.data.value < 0);
    expect(negativeBar).toBeDefined();
    expect(negativeBar.height).toBeGreaterThan(0); // Height should be positive
  });
});
