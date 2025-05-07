import { buildViz } from '../../src/core/devize';
import '../../src/charts/barChart';

describe('Bar Chart', () => {
  let container;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  test('should render without errors', () => {
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

    expect(chart).toBeDefined();
    expect(chart.element).toBeDefined();

    // Check that we have an SVG
    const svg = container.querySelector('svg');
    expect(svg).toBeDefined();

    // Check that we have some rectangles (bars)
    const rects = svg.querySelectorAll('rect');
    expect(rects.length).toBeGreaterThan(0);

    // Check that we have some text elements (labels)
    const texts = svg.querySelectorAll('text');
    expect(texts.length).toBeGreaterThan(0);
  });

  test('should handle color mapping', () => {
    const data = [
      { product: 'Product A', revenue: 420, category: 'Electronics' },
      { product: 'Product B', revenue: 650, category: 'Clothing' },
      { product: 'Product C', revenue: 340, category: 'Electronics' }
    ];

    const chart = buildViz({
      type: 'barChart',
      data: data,
      x: { field: 'product' },
      y: { field: 'revenue' },
      color: { field: 'category' },
      container
    });

    expect(chart).toBeDefined();

    // Check that we have an SVG
    const svg = container.querySelector('svg');
    expect(svg).toBeDefined();

    // Check that we have rectangles with different colors
    const rects = Array.from(svg.querySelectorAll('rect'));
    const barColors = new Set();

    rects.forEach(rect => {
      const fill = rect.getAttribute('fill');
      if (fill && fill !== 'none') {
        barColors.add(fill);
      }
    });

    // Should have at least 2 different colors
    expect(barColors.size).toBeGreaterThan(1);
  });
});
