import { createViz, updateViz } from '../../src/core/devize';
import '../../src/primitives/shapes';
import '../../src/primitives/containers';

describe('Core Framework', () => {
  let container;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  test('createViz should create basic shapes', () => {
    // Rectangle
    const rect = createViz({
      type: 'rectangle',
      x: 10,
      y: 20,
      width: 100,
      height: 50,
      fill: 'red',
      container
    });

    expect(rect.element).toBeDefined();
    expect(rect.element.tagName.toLowerCase()).toBe('rect');

    // Circle
    const circle = createViz({
      type: 'circle',
      cx: 50,
      cy: 50,
      r: 30,
      fill: 'blue',
      container
    });

    expect(circle.element).toBeDefined();
    expect(circle.element.tagName.toLowerCase()).toBe('circle');

    // Line
    const line = createViz({
      type: 'line',
      x1: 0,
      y1: 0,
      x2: 100,
      y2: 100,
      stroke: 'green',
      container
    });

    expect(line.element).toBeDefined();
    expect(line.element.tagName.toLowerCase()).toBe('line');

    // Text
    const text = createViz({
      type: 'text',
      x: 50,
      y: 50,
      text: 'Hello',
      fill: 'black',
      container
    });

    expect(text.element).toBeDefined();
    expect(text.element.tagName.toLowerCase()).toBe('text');
  });

  test('createViz should create groups with children', () => {
    const group = createViz({
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

    expect(group.element).toBeDefined();
    expect(group.element.tagName.toLowerCase()).toBe('g');
    expect(group.element.children.length).toBe(2);
    expect(group.element.children[0].tagName.toLowerCase()).toBe('rect');
    expect(group.element.children[1].tagName.toLowerCase()).toBe('circle');
  });

  test('updateViz should update properties', () => {
    // Create initial visualization
    const rect = createViz({
      type: 'rectangle',
      x: 10,
      y: 20,
      width: 100,
      height: 50,
      fill: 'red',
      container
    });

    // Update properties
    const updated = updateViz(rect, {
      width: 200,
      fill: 'blue'
    });

    expect(updated.element).toBeDefined();
    expect(updated.element.getAttribute('width')).toBe('200');
    expect(updated.element.getAttribute('fill')).toBe('blue');
    // Original properties should be preserved
    expect(updated.element.getAttribute('x')).toBe('10');
    expect(updated.element.getAttribute('y')).toBe('20');
  });
});
