import { createViz } from '../../src/core/devize';
import '../../src/charts/barChart';

describe('Bar Chart', () => {
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

  test('barChart should render without errors', () => {
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
      container
    });

    expect(chart.element).toBeDefined();
    expect(chart.element.tagName.toLowerCase()).toBe('g');

    // Check for SVG structure
    const svg = container.querySelector('svg');
    expect(svg).toBeDefined();

    // Check for basic elements
    const rects = svg.querySelectorAll('rect');
    expect(rects.length).toBeGreaterThan(0);

    const texts = svg.querySelectorAll('text');
    expect(texts.length).toBeGreaterThan(0);
  });

  test('barChart should handle custom properties', () => {
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
      color: '#ff0000',
      title: 'Revenue Chart',
      margin: { top: 50, right: 30, bottom: 50, left: 50 },
      container
    });

    expect(chart.element).toBeDefined();

    // Check for title
    const svg = container.querySelector('svg');
    const titleElements = Array.from(svg.querySelectorAll('text'))
      .filter(el => el.textContent === 'Revenue Chart');

    expect(titleElements.length).toBeGreaterThan(0);

    // Check for transform attribute (margin)
    expect(chart.element.getAttribute('transform')).toBe('translate(50, 50)');
  });
});
