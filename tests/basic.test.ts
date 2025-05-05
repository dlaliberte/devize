import { createViz } from '../src/core/devize';
import '../src/primitives/shapes';
import '../src/primitives/containers';

describe('Basic Visualization Tests', () => {
  let container;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  test('should create a rectangle', () => {
    const viz = createViz({
      type: 'rectangle',
      x: 10,
      y: 20,
      width: 100,
      height: 50,
      fill: 'red',
      container
    });

    expect(viz).toBeDefined();
    expect(viz.element).toBeDefined();
  });

  test('should create a group with children', () => {
    const viz = createViz({
      type: 'group',
      children: [
        {
          type: 'rectangle',
          x: 10,
          y: 20,
          width: 100,
          height: 50,
          fill: 'red'
        }
      ],
      container
    });

    expect(viz).toBeDefined();
    expect(viz.element).toBeDefined();
  });
});
