import { buildViz } from '../../src/core/devize';
import { vi } from 'vitest';
import '../../src/components/axis';
import '../../src/primitives/shapes';
import '../../src/primitives/containers';

describe('Axis Component', () => {
  let container;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  test('should be defined as a component', () => {
    // Just check that we can create an axis specification without errors
    const axisSpec = {
      type: 'axis',
      orientation: 'bottom',
      length: 300,
      values: [0, 25, 50, 75, 100],
      title: 'X Axis'
    };

    // This shouldn't throw an error
    expect(() => {
      buildViz({
        type: 'group',
        children: [axisSpec],
        container
      });
    }).not.toThrow();
  });

  test('should support custom formatters', () => {
    // Create a formatter function
    const formatter = vi.fn(value => `$${value}`);

    // Create a visualization with an axis using the formatter
    buildViz({
      type: 'group',
      children: [
        {
          type: 'axis',
          orientation: 'bottom',
          length: 300,
          values: [1000, 2000, 3000],
          format: formatter
        }
      ],
      container
    });

    // Check that the formatter was called
    expect(formatter).toHaveBeenCalled();
  });
});
