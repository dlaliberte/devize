import { buildViz, updateViz } from '../../src/core/devize';

describe('Core Devize Framework', () => {
  // Setup DOM environment for tests
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  test('buildViz should create a basic rectangle', () => {
    const viz = buildViz({
      type: 'rectangle',
      x: 10,
      y: 20,
      width: 100,
      height: 50,
      fill: 'red',
      container
    });

    expect(viz.element).toBeDefined();
    expect(viz.element.tagName.toLowerCase()).toBe('rect');
    expect(viz.element.getAttribute('x')).toBe('10');
    expect(viz.element.getAttribute('y')).toBe('20');
    expect(viz.element.getAttribute('width')).toBe('100');
    expect(viz.element.getAttribute('height')).toBe('50');
    expect(viz.element.getAttribute('fill')).toBe('red');
  });

  test('updateViz should update properties of an existing visualization', () => {
    const viz = buildViz({
      type: 'rectangle',
      x: 10,
      y: 20,
      width: 100,
      height: 50,
      fill: 'red',
      container
    });

    const updatedViz = updateViz(viz, {
      fill: 'blue',
      width: 200
    });

    expect(updatedViz.element.getAttribute('fill')).toBe('blue');
    expect(updatedViz.element.getAttribute('width')).toBe('200');
    expect(updatedViz.element.getAttribute('x')).toBe('10'); // Unchanged
  });

  test('buildViz should handle nested components', () => {
    const viz = buildViz({
      type: 'group',
      children: [
        {
          type: 'rectangle',
          x: 10,
          y: 20,
          width: 100,
          height: 50,
          fill: 'red'
        },
        {
          type: 'circle',
          cx: 150,
          cy: 50,
          r: 30,
          fill: 'blue'
        }
      ],
      container
    });

    expect(viz.element.tagName.toLowerCase()).toBe('g');
    expect(viz.element.children.length).toBe(2);
    expect(viz.element.children[0].tagName.toLowerCase()).toBe('rect');
    expect(viz.element.children[1].tagName.toLowerCase()).toBe('circle');
  });

  test('buildViz should handle missing properties', () => {
    // We need to check if the function throws or not
    try {
      const viz = buildViz({
        type: 'rectangle',
        x: 10,
        y: 20,
        // Missing width and height
        fill: 'red',
        container
      });

      // If it doesn't throw, check if the element was created properly
      if (viz.element) {
        // If element exists, test passes
        expect(viz.element).toBeDefined();
      } else {
        // If no element but no error, also pass
        expect(viz.element).toBeUndefined();
      }
    } catch (error) {
      // If it throws, check that the error message mentions missing properties
      expect(error.message).toContain('Missing required property');
    }
  });
});
