import { buildViz } from '../../src/core/devize';
import '../../src/components/legend';
import '../../src/primitives/shapes';
import '../../src/primitives/containers';

describe('Legend Component', () => {
  let container;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  test('should be defined as a component', () => {
    // Just check that we can create a legend specification without errors
    const legendSpec = {
      type: 'legend',
      orientation: 'horizontal',
      items: [
        { label: 'Category A', color: 'red' },
        { label: 'Category B', color: 'blue' },
        { label: 'Category C', color: 'green' }
      ]
    };

    // This shouldn't throw an error
    expect(() => {
      buildViz({
        type: 'group',
        children: [legendSpec],
        container
      });
    }).not.toThrow();
  });

  test('should handle custom item rendering', () => {
    // Define a custom item renderer
    const itemRenderer = (item) => ({
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
    });

    // This shouldn't throw an error
    expect(() => {
      buildViz({
        type: 'group',
        children: [
          {
            type: 'legend',
            orientation: 'horizontal',
            items: [
              { label: 'Custom Item', color: 'purple', shape: 'circle' }
            ],
            itemRenderer: itemRenderer
          }
        ],
        container
      });
    }).not.toThrow();
  });
});
