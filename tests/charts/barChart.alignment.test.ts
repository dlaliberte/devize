import { buildViz } from '../../src/core/devize';
import '../../src/charts/barChart';

describe('Bar Chart Alignment', () => {
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

  test('should create bars for each data point', () => {
    const data = [
      { product: 'Product A', revenue: 420 },
      { product: 'Product B', revenue: 650 },
      { product: 'Product C', revenue: 340 }
    ];

    const chart = buildViz({
      type: 'barChart',
      data: data,
      x: { field: 'product' },
      y: { field: 'revenue' },
      container
    });

    expect(chart.element).toBeDefined();

    // Get all bars
    const svg = container.querySelector('svg');
    const bars = Array.from(svg.querySelectorAll('rect')).filter(rect => {
      // Filter out any rectangles that might be part of the legend or other components
      const height = parseFloat(rect.getAttribute('height') || '0');
      return height > 10; // Assuming bars are taller than 10px
    });

    // We should have one bar for each data point
    expect(bars.length).toBe(data.length);
  });
});
