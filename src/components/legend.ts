/**
 * Legend Component
 *
 * Purpose: Provides legend visualization for charts
 * Author: [Author Name]
 * Creation Date: [Date]
 * Last Modified: [Date]
 */

import { buildViz } from '../core/builder';
import { registerDefineType } from '../core/define';
import { createRenderableVisualization } from '../core/componentUtils';

// Import required primitives
import '../primitives/rectangle';
import '../primitives/circle';
import '../primitives/polygon';
import '../primitives/text';
import '../primitives/group';

// Make sure define type is registered
registerDefineType();

// Define the legend component
export const legendDefinition = {
  type: "define",
  name: "legend",
  properties: {
    legendType: { required: true }, // Changed from 'type' to 'legendType'
    title: { default: '' },
    items: { required: true }, // Array of {value, label, color/size/symbol}
    orientation: { default: 'vertical' },
    position: { default: { x: 0, y: 0 } },
    itemSpacing: { default: 20 },
    labelOffset: { default: 10 },
    symbolSize: { default: 15 },
    format: { default: value => value.toString() }
  },
  validate: function(props) {
    // Validate legend type
    const validTypes = ['color', 'size', 'symbol'];
    if (!validTypes.includes(props.legendType)) {
      throw new Error(`Invalid legend type: ${props.legendType}. Must be one of: ${validTypes.join(', ')}`);
    }

    // Validate items is an array
    if (!Array.isArray(props.items)) {
      throw new Error('Legend items must be an array');
    }

    // Validate orientation
    const validOrientations = ['vertical', 'horizontal'];
    if (!validOrientations.includes(props.orientation)) {
      throw new Error(`Invalid orientation: ${props.orientation}. Must be one of: ${validOrientations.join(', ')}`);
    }

    // Validate format is a function
    if (typeof props.format !== 'function') {
      throw new Error('Format must be a function');
    }
  },
  implementation: function(props) {
    const { legendType, title, items, orientation, position, itemSpacing, labelOffset, symbolSize, format } = props;

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

      if (legendType === 'color') {
        symbol = {
          type: 'rectangle',
          x: itemX,
          y: itemY,
          width: symbolSize,
          height: symbolSize,
          fill: item.color || '#ccc',
          class: 'legend-symbol'
        };
      } else if (legendType === 'size') {
        const size = item.size || symbolSize;
        symbol = {
          type: 'circle',
          cx: itemX + symbolSize / 2,
          cy: itemY + symbolSize / 2,
          r: size / 2,
          fill: '#666',
          class: 'legend-symbol'
        };
      } else if (legendType === 'symbol') {
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

    // Combine all elements into a group specification
    const groupSpec = {
      type: 'group',
      class: 'legend',
      children: [
        legendTitle,
        ...legendItems
      ].filter(Boolean) // Remove null items
    };

    // Process the group specification to create a renderable visualization
    const renderableGroup = buildViz(groupSpec);

    // Create and return a renderable visualization
    return createRenderableVisualization(
      'legend',
      props,
      // SVG rendering function - delegates to the group's renderToSvg
      (container) => {
        if (renderableGroup && renderableGroup.renderToSvg) {
          return renderableGroup.renderToSvg(container);
        }
        return null;
      },
      // Canvas rendering function - delegates to the group's renderToCanvas
      (ctx) => {
        if (renderableGroup && renderableGroup.renderToCanvas) {
          return renderableGroup.renderToCanvas(ctx);
        }
        return false;
      }
    );
  }
};

// Register the legend component
buildViz(legendDefinition);

/**
 * Create a legend directly
 *
 * @param options Legend configuration options
 * @returns A renderable legend visualization
 */
export function createLegend(options: {
  legendType: 'color' | 'size' | 'symbol',
  title?: string,
  items: Array<{
    value: any,
    label?: string,
    color?: string,
    size?: number,
    symbol?: 'circle' | 'square' | 'triangle'
  }>,
  orientation?: 'vertical' | 'horizontal',
  position?: { x: number, y: number },
  itemSpacing?: number,
  labelOffset?: number,
  symbolSize?: number,
  format?: (value: any) => string
}) {
  return buildViz({
    type: 'legend',
    legendType: options.legendType,
    title: options.title || '',
    items: options.items,
    orientation: options.orientation || 'vertical',
    position: options.position || { x: 0, y: 0 },
    itemSpacing: options.itemSpacing || 20,
    labelOffset: options.labelOffset || 10,
    symbolSize: options.symbolSize || 15,
    format: options.format || (value => value.toString())
  });
}
