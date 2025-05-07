import { buildViz } from '../../src/core/devize';
import '../../src/components/axis';
import '../../src/components/legend';

describe('Basic Component Tests', () => {
  let container;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  test('axis component should be created without errors', () => {
    // Create a group to contain the axis
    const group = buildViz({
      type: 'group',
      children: [
        {
          type: 'axis',
          orientation: 'bottom',
          length: 300,
          values: [0, 25, 50, 75, 100],
          title: 'X Axis'
        }
      ],
      container
    });

    // Just check that we didn't get an error
    expect(group).toBeDefined();
    expect(group.element).toBeDefined();
  });

  test('legend component should be created without errors', () => {
    // Create a group to contain the legend
    const group = buildViz({
      type: 'group',
      children: [
        {
          type: 'legend',
          orientation: 'horizontal',
          items: [
            { label: 'Category A', color: 'red' },
            { label: 'Category B', color: 'blue' }
          ]
        }
      ],
      container
    });

    // Just check that we didn't get an error
    expect(group).toBeDefined();
    expect(group.element).toBeDefined();
  });
});
