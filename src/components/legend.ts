  /**
 * Legend Component
 *
 * Purpose: Provides legend visualization for charts
 * Author: [Author Name]
 * Creation Date: [Date]
 * Last Modified: [Date]
 */

import { buildViz } from '../core/builder';

// Define the legend component
buildViz({
  type: "define",
  name: "legend",
  properties: {
    type: { required: true }, // 'color', 'size', 'symbol'
    title: { default: '' },
    items: { required: true }, // Array of {value, label, color/size/symbol}
    orientation: { default: 'vertical' },
    position: { default: { x: 0, y: 0 } },
    itemSpacing: { default: 20 },
    labelOffset: { default: 10 },
    symbolSize: { default: 15 },
    format: { default: value => value.toString() }
  },
  implementation: function(props) {
    const { type, title, items, orientation, position, itemSpacing, labelOffset, symbolSize, format } = props;

    const isHorizontal = orientation === 'horizontal';

    // Create legend title
    const legendTitle = title ? {
      type: 'text',
      x: position.x,
      y: position.y,
      text: title,
      fontSize: '14px',
      fontFamily: 'Arial',
      fontWeight: 'bold',
      textAnchor: 'start',
      dominantBaseline: 'hanging',
      class: 'legend-title'
    } : null;

    // Calculate title offset for items positioning
    const titleOffset = title ? 25 : 0;

    // Create legend items
    const legendItems = items.map((item, i) => {
      const itemX = position.x + (isHorizontal ? i * itemSpacing : 0);
      const itemY = position.y + titleOffset + (isHorizontal ? 0 : i * itemSpacing);

      // Create the appropriate symbol based on legend type
      let symbol;

      if (type === 'color') {
        symbol = {
          type: 'rectangle',
          x: itemX,
          y: itemY,
          width: symbolSize,
          height: symbolSize,
          fill: item.color || '#ccc',
          class: 'legend-symbol'
        };
      } else if (type === 'size') {
        const size = item.size || symbolSize;
        symbol = {
          type: 'circle',
          cx: itemX + symbolSize / 2,
          cy: itemY + symbolSize / 2,
          r: size / 2,
          fill: '#666',
          class: 'legend-symbol'
        };
      } else if (type === 'symbol') {
        // Default to a circle if no symbol specified
        const symbolType = item.symbol || 'circle';

        if (symbolType === 'circle') {
          symbol = {
            type: 'circle',
            cx: itemX + symbolSize / 2,
            cy: itemY + symbolSize / 2,
            r: symbolSize / 2,
            fill: item.color || '#666',
            class: 'legend-symbol'
          };
        } else if (symbolType === 'square') {
          symbol = {
            type: 'rectangle',
            x: itemX,
            y: itemY,
            width: symbolSize,
            height: symbolSize,
            fill: item.color || '#666',
            class: 'legend-symbol'
          };
        } else if (symbolType === 'triangle') {
          const halfSize = symbolSize / 2;
          symbol = {
            type: 'polygon',
            points: [
              { x: itemX + halfSize, y: itemY },
              { x: itemX, y: itemY + symbolSize },
              { x: itemX + symbolSize, y: itemY + symbolSize }
            ],
            fill: item.color || '#666',
            class: 'legend-symbol'
          };
        }
      }

      // Create label
      const label = {
        type: 'text',
        x: itemX + (isHorizontal ? symbolSize + labelOffset : symbolSize + 5),
        y: itemY + (isHorizontal ? symbolSize / 2 : symbolSize / 2),
        text: format(item.label || item.value),
        fontSize: '12px',
        fontFamily: 'Arial',
        textAnchor: 'start',
        dominantBaseline: 'middle',
        class: 'legend-label'
      };

      return {
        type: 'group',
        children: [symbol, label],
        class: 'legend-item'
      };
    });

    // Combine all elements
    return {
      type: 'group',
      class: 'legend',
      children: [
        legendTitle,
        ...legendItems
      ].filter(Boolean)
    };
  }
});
