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
    expect(barChart.type).toBe('barChart');

    // Get the implementation result
    const impl = barChart.getProperty('implementation');
    expect(impl.type).toBe('group');

    // Check that we have the right number of children
    // (x-axis, y-axis, 4 bars, title)
    expect(impl.children.length).toBe(7);

    // Check the title
    const title = impl.children[6];
    expect(title.type).toBe('text');
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
    expect(barChart.type).toBe('barChart');

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
});
