import { createViz } from '../../src/core/devize';
import '../../src/components/axis';

describe('Axis Component', () => {
  let container;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  test('should render horizontal axis', () => {
    // First create a container visualization
    const containerViz = createViz({
      type: 'group',
      children: [],
      container
    });

    // Then create the axis within that container
    const axis = createViz({
      type: 'axis',
      orientation: 'bottom',
      length: 300,
      values: [0, 25, 50, 75, 100],
      title: 'X Axis',
      container: containerViz.element
    });

    // Log the result to understand its structure
    console.log('Axis result:', axis);

    // Check that we got some result
    expect(axis).toBeDefined();

    // Check that the container has children now
    const svg = container.querySelector('svg');
    expect(svg).toBeDefined();

    // Check for axis line
    const lines = svg.querySelectorAll('line');
    expect(lines.length).toBeGreaterThan(0);

    // Check for tick labels
    const texts = svg.querySelectorAll('text');
    expect(texts.length).toBeGreaterThan(0);

    // Check for title
    const titleElements = Array.from(texts)
      .filter(el => el.textContent === 'X Axis');
    expect(titleElements.length).toBe(1);
  });

  test('should render vertical axis', () => {
    // First create a container visualization
    const containerViz = createViz({
      type: 'group',
      children: [],
      container
    });

    // Then create the axis within that container
    const axis = createViz({
      type: 'axis',
      orientation: 'left',
      length: 200,
      values: [0, 20, 40, 60, 80, 100],
      title: 'Y Axis',
      container: containerViz.element
    });

    // Check that we got some result
    expect(axis).toBeDefined();

    // Check that the container has children now
    const svg = container.querySelector('svg');
    expect(svg).toBeDefined();

    // Check for axis line
    const lines = svg.querySelectorAll('line');
    expect(lines.length).toBeGreaterThan(0);

    // Check for tick labels
    const texts = svg.querySelectorAll('text');
    expect(texts.length).toBeGreaterThan(0);
  });

  test('should format tick values', () => {
    // First create a container visualization
    const containerViz = createViz({
      type: 'group',
      children: [],
      container
    });

    // Then create the axis with a formatter
    const axis = createViz({
      type: 'axis',
      orientation: 'bottom',
      length: 300,
      values: [1000, 2000, 3000, 4000],
      format: value => `$${value.toLocaleString()}`,
      container: containerViz.element
    });

    // Check that we got some result
    expect(axis).toBeDefined();

    // Check that the container has children now
    const svg = container.querySelector('svg');
    expect(svg).toBeDefined();

    // Check for formatted tick labels
    const texts = Array.from(svg.querySelectorAll('text'));
    const tickLabels = texts.map(el => el.textContent);

    // At least one label should have the $ prefix
    expect(tickLabels.some(label => label && label.includes('$'))).toBe(true);
  });
});
