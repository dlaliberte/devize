import { createViz } from '../core/devize';

// Define the legend component
createViz({
  type: "define",
  name: "legend",
  properties: {
    items: { required: true },
    orientation: { default: 'vertical' },
    transform: { default: 'translate(0, 0)' },
    itemSpacing: { default: 20 },
    symbolSize: { default: 10 },
    fontSize: { default: '12px' },
    fontFamily: { default: 'Arial' }
  },
  requiresContainer: true,
  implementation: function(props) {
    const { items, orientation, transform, itemSpacing, symbolSize, fontSize, fontFamily } = props;

    // Check if items is an array
    if (!Array.isArray(items) || items.length === 0) {
      return { type: 'group', children: [] };
    }

    // Create legend items
    const legendItems = items.map((item, index) => {
      const isHorizontal = orientation === 'horizontal';
      const x = isHorizontal ? index * itemSpacing : 0;
      const y = isHorizontal ? 0 : index * itemSpacing;

      return {
        type: 'group',
        transform: `translate(${x}, ${y})`,
        children: [
          // Symbol
          {
            type: 'rectangle',
            x: 0,
            y: 0,
            width: symbolSize,
            height: symbolSize,
            fill: item.color || '#333'
          },
          // Label
          {
            type: 'text',
            x: symbolSize + 5,
            y: symbolSize / 2,
            text: item.label || '',
            fontSize: fontSize,
            fontFamily: fontFamily,
            fill: '#333',
            textAnchor: 'start',
            dominantBaseline: 'middle'
          }
        ]
      };
    });

    return {
      type: 'group',
      transform: transform,
      children: legendItems
    };
  }
});
