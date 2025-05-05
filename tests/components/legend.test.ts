import { createViz } from '../../src/core/devize';
import '../../src/components/legend';

describe('Legend Component', () => {
  let container;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  test('should render horizontal legend', () => {
    // First create a container visualization
    const containerViz = createViz({
      type: 'group',
      children: [],
      container
    });

    // Then create the legend within that container
    const legend = createViz({
      type: 'legend',
      orientation: 'horizontal',
      items: [
        { label: 'Category A', color: 'red' },
        { label: 'Category B', color: 'blue' },
        { label: 'Category C', color: 'green' }
      ],
      container: containerViz.element
    });

    // Check that we got some result
    expect(legend).toBeDefined();

    // Check that the container has children now
    const svg = container.querySelector('svg');
    expect(svg).toBeDefined();

    // Check for legend items
    const groups = svg.querySelectorAll('g > g');
    expect(groups.length).toBeGreaterThan(0);

    // Check for color swatches
    const rects = svg.querySelectorAll('rect');
    expect(rects.length).toBeGreaterThan(0);

    // Check for labels
    const texts = svg.querySelectorAll('text');
    expect(texts.length).toBeGreaterThan(0);

    // Check label content
    const labels = Array.from(texts).map(el => el.textContent);
    expect(labels.some(label => label === 'Category A')).toBe(true);
    expect(labels.some(label => label === 'Category B')).toBe(true);
    expect(labels.some(label => label === 'Category C')).toBe(true);
  });

  test('should render vertical legend', () => {
    // First create a container visualization
    const containerViz = createViz({
      type: 'group',
      children: [],
      container
    });

    // Then create the legend within that container
    const legend = createViz({
      type: 'legend',
      orientation: 'vertical',
      items: [
        { label: 'Category A', color: 'red' },
        { label: 'Category B', color: 'blue' }
      ],
      container: containerViz.element
    });

    // Check that we got some result
    expect(legend).toBeDefined();

    // Check that the container has children now
    const svg = container.querySelector('svg');
    expect(svg).toBeDefined();

    // Check for legend items
    const groups = svg.querySelectorAll('g > g');
    expect(groups.length).toBeGreaterThan(0);
  });

  test('should handle custom item rendering', () => {
    // First create a container visualization
    const containerViz = createViz({
      type: 'group',
      children: [],
      container
    });

    // Then create the legend with custom item renderer
    const legend = createViz({
      type: 'legend',
      orientation: 'horizontal',
      items: [
        { label: 'Custom Item', color: 'purple', shape: 'circle' }
      ],
      itemRenderer: (item) => ({
        type: 'group',
        children: [
          item.shape === 'circle'
            ? {
                type: 'circle',
                cx: 10,
                cy: 10,
                r: 8,
                fill: item.color
              }
            : {
                type: 'rect',
                x: 2,
                y: 2,
                width: 16,
                height: 16,
                fill: item.color
              },
          {
            type: 'text',
            x: 25,
            y: 10,
            text: item.label,
            dominantBaseline: 'middle'
          }
        ]
      }),
      container: containerViz.element
    });

    // Check that we got some result
    expect(legend).toBeDefined();

    // Check that the container has children now
    const svg = container.querySelector('svg');
    expect(svg).toBeDefined();

    // Check for circle instead of rectangle
    const circles = svg.querySelectorAll('circle');
    expect(circles.length).toBeGreaterThan(0);
  });
});
