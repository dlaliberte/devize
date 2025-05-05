import { createViz } from '../../src/core/devize';
import '../../src/charts/barChart';

describe('Complex Chart Integration', () => {
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

  test('should create bar chart with color mapping', () => {
    // Sample data with categories
    const data = [
      { product: 'Product A', revenue: 420, category: 'Electronics' },
      { product: 'Product B', revenue: 650, category: 'Clothing' },
      { product: 'Product C', revenue: 340, category: 'Electronics' },
      { product: 'Product D', revenue: 570, category: 'Clothing' }
    ];

    // Create chart with color mapping
    const chart = createViz({
      type: 'barChart',
      data: data,
      x: { field: 'product' },
      y: { field: 'revenue' },
      color: { field: 'category' },
      title: 'Revenue by Product and Category',
      container
    });

    expect(chart.element).toBeDefined();

    // Check for legend
    const svg = container.querySelector('svg');
    const legendTexts = Array.from(svg.querySelectorAll('text'))
      .filter(el => el.textContent === 'Electronics' || el.textContent === 'Clothing');

    expect(legendTexts.length).toBe(2);

    // Check for bars with different colors
    const bars = svg.querySelectorAll('rect');
    const barColors = new Set();

    bars.forEach(bar => {
      const fill = bar.getAttribute('fill');
      if (fill && fill !== 'none') {
        barColors.add(fill);
      }
    });

    // Should have at least 2 different colors
    expect(barColors.size).toBeGreaterThan(1);
  });

  test('should create bar chart with custom margins and grid', () => {
    const data = [
      { product: 'Product A', revenue: 420 },
      { product: 'Product B', revenue: 650 },
      { product: 'Product C', revenue: 340 }
    ];

    const chart = createViz({
      type: 'barChart',
      data: data,
      x: { field: 'product' },
      y: { field: 'revenue' },
      margin: { top: 60, right: 40, bottom: 80, left: 70 },
      grid: true,
      container
    });

    expect(chart.element).toBeDefined();

    // Check transform attribute (margin)
    expect(chart.element.getAttribute('transform')).toBe('translate(70, 60)');

    // If grid is implemented, check for grid lines
    const svg = container.querySelector('svg');
    const lines = svg.querySelectorAll('line');

    // Should have multiple lines (axis lines + potentially grid lines)
    expect(lines.length).toBeGreaterThan(2);
  });
});
