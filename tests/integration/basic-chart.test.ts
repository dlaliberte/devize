import { buildViz } from '../../src/core/devize';
import '../../src/charts/barChart';

describe('Basic Chart Integration', () => {
  let container;

  beforeEach(() => {
    container = document.createElement('div');
    container.style.width = '800px';
    container.style.height = '600px';
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  test('should create and update a bar chart', () => {
    // Sample data
    const data = [
      { product: 'Product A', revenue: 420 },
      { product: 'Product B', revenue: 650 },
      { product: 'Product C', revenue: 340 }
    ];

    // Create chart
    const chart = buildViz({
      type: 'barChart',
      data: data,
      x: { field: 'product' },
      y: { field: 'revenue' },
      container
    });

    expect(chart.element).toBeDefined();

    // Check initial rendering
    const svg = container.querySelector('svg');
    const initialBars = svg.querySelectorAll('rect');
    const initialBarCount = initialBars.length;

    // Update with new data
    const newData = [
      ...data,
      { product: 'Product D', revenue: 500 }
    ];

    const updatedChart = buildViz({
      type: 'barChart',
      data: newData,
      x: { field: 'product' },
      y: { field: 'revenue' },
      container
    });

    expect(updatedChart.element).toBeDefined();

    // Check updated rendering
    const updatedBars = svg.querySelectorAll('rect');
    expect(updatedBars.length).toBeGreaterThan(initialBarCount);
  });
});
