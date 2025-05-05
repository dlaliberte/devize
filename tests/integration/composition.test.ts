import { createViz } from '../../src/core/devize';
import '../../src/primitives/shapes';
import '../../src/primitives/containers';

describe('Visualization Composition', () => {
  let container;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  test('should compose multiple visualizations', () => {
    // Create a complex visualization with multiple components
    const viz = createViz({
      type: 'group',
      children: [
        // Background
        {
          type: 'rectangle',
          x: 0,
          y: 0,
          width: 400,
          height: 300,
          fill: '#f5f5f5',
          stroke: '#cccccc',
          strokeWidth: 1
        },
        // Title
        {
          type: 'text',
          x: 200,
          y: 30,
          text: 'Composition Example',
          fontSize: 18,
          fontWeight: 'bold',
          textAnchor: 'middle'
        },
        // Left circle
        {
          type: 'circle',
          cx: 100,
          cy: 150,
          r: 50,
          fill: 'rgba(255, 0, 0, 0.5)'
        },
        // Right circle
        {
          type: 'circle',
          cx: 300,
          cy: 150,
          r: 50,
          fill: 'rgba(0, 0, 255, 0.5)'
        },
        // Connecting line
        {
          type: 'line',
          x1: 100,
          y1: 150,
          x2: 300,
          y2: 150,
          stroke: '#333333',
          strokeWidth: 2,
          strokeDasharray: '5,5'
        },
        // Labels
        {
          type: 'text',
          x: 100,
          y: 220,
          text: 'Circle A',
          textAnchor: 'middle'
        },
        {
          type: 'text',
          x: 300,
          y: 220,
          text: 'Circle B',
          textAnchor: 'middle'
        }
      ],
      container
    });

    expect(viz.element).toBeDefined();
    expect(viz.element.tagName.toLowerCase()).toBe('g');

    // Check for all child elements
    const svg = container.querySelector('svg');
    expect(svg.querySelectorAll('rect').length).toBe(1);
    expect(svg.querySelectorAll('circle').length).toBe(2);
    expect(svg.querySelectorAll('line').length).toBe(1);
    expect(svg.querySelectorAll('text').length).toBe(3);
  });
});
