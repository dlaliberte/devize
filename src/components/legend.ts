/**
 * Legend Component - Bug Fixes
 *
 * Issues to fix:
 * 1. Horizontal orientation layout
 * 2. Title font size and weight not applying
 * 3. Label offset not working
 */

import { buildViz } from '../core/builder';
import { registerDefineType } from '../core/define';
import { createRenderableVisualization } from '../core/componentUtils';

// Import required primitives
import '../primitives/rectangle';
import '../primitives/circle';
import '../primitives/polygon';
import '../primitives/line';
import '../primitives/shape';
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
    format: { default: value => value ? value.toString() : '' },
    titleFontSize: { default: '14px' },
    titleFontWeight: { default: 'bold' },
    titleFontFamily: { default: 'Arial' },
    labelFontSize: { default: '12px' },
    labelFontFamily: { default: 'Arial' }
  },
  validate: function(props) {
    // Validate legend type
    const validTypes = ['color', 'size', 'symbol', 'shape'];
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
    const {
      legendType,
      title,
      items,
      orientation,
      position,
      itemSpacing,
      labelOffset,
      symbolSize,
      format,
      titleFontSize,
      titleFontWeight,
      titleFontFamily,
      labelFontSize,
      labelFontFamily
    } = props;

    const isHorizontal = orientation === 'horizontal';

    // Get position coordinates - either from position object or transform
    let posX = 0;
    let posY = 0;

    if (position && typeof position === 'object') {
      posX = position.x || 0;
      posY = position.y || 0;
    } else if (props.transform) {
      // Try to extract position from transform attribute if provided
      const translateMatch = props.transform.match(/translate\(([^,]+),([^)]+)\)/);
      if (translateMatch) {
        posX = parseFloat(translateMatch[1]);
        posY = parseFloat(translateMatch[2]);
      }
    }

    // Create legend title with correct positioning and styling
    const legendTitle = title ? {
      type: 'text',
      x: 0, // Relative to the legend group
      y: 0,
      text: title,
      fontSize: titleFontSize, // Use the provided title font size
      fontFamily: titleFontFamily, // Use the provided title font family
      fontWeight: titleFontWeight, // Use the provided title font weight
      textAnchor: 'start',
      dominantBaseline: 'hanging',
      class: 'legend-title'
    } : null;

    // Calculate title offset for items positioning
    const titleOffset = title ? 25 : 0;

    // Create legend items with correct positioning
    const legendItems = items.map((item, i) => {
      // Calculate position based on orientation
      const itemX = isHorizontal ? i * itemSpacing : 0;
      const itemY = isHorizontal ? titleOffset : titleOffset + i * itemSpacing;

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
      } else if (legendType === 'symbol' || legendType === 'shape') {
        // Default to a circle if no symbol/shape specified
        const symbolType = item.symbol || item.shape || 'circle';

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
        } else if (symbolType === 'diamond') {
          const halfSize = symbolSize / 2;
          symbol = {
            type: 'polygon',
            points: [
              { x: itemX + halfSize, y: itemY },
              { x: itemX + symbolSize, y: itemY + halfSize },
              { x: itemX + halfSize, y: itemY + symbolSize },
              { x: itemX, y: itemY + halfSize }
            ],
            fill: item.color || '#666',
            class: 'legend-symbol'
          };
        } else if (symbolType === 'cross' || symbolType === 'star') {
          // For more complex shapes, we'd need to use a path
          // This is a simplified version
          symbol = {
            type: 'text',
            x: itemX + symbolSize / 2,
            y: itemY + symbolSize / 2,
            text: symbolType === 'cross' ? '✕' : '★',
            fontSize: symbolSize + 'px',
            fill: item.color || '#666',
            textAnchor: 'middle',
            dominantBaseline: 'middle',
            class: 'legend-symbol'
          };
        }
      }

      // Create label with proper positioning based on orientation
      const label = {
        type: 'text',
        // For horizontal orientation, place label to the right of symbol
        // For vertical orientation, place label to the right of symbol
        x: itemX + symbolSize + labelOffset, // Apply label offset correctly
        y: itemY + (symbolSize / 2), // Center vertically with the symbol
        text: format(item.label || item.value),
        fontSize: labelFontSize, // Use the provided label font size
        fontFamily: labelFontFamily, // Use the provided label font family
        textAnchor: 'start',
        dominantBaseline: 'middle', // Center text vertically
        class: 'legend-label'
      };

      // Create a group for this legend item with explicit class
      return {
        type: 'group',
        class: 'legend-item',
        children: [symbol, label].filter(Boolean)
      };
    });

    // For horizontal orientation, we need to calculate the total width
    // to ensure items don't overlap
    if (isHorizontal) {
      // Adjust item positions to prevent overlap
      let currentX = 0;

      legendItems.forEach((item, index) => {
        // Update the x position of the symbol
        const symbol = item.children[0];
        symbol.x = currentX;

        if (symbol.type === 'circle') {
          symbol.cx = currentX + symbolSize / 2;
        } else if (symbol.type === 'polygon') {
          // Adjust polygon points
          const halfSize = symbolSize / 2;
          symbol.points = [
            { x: currentX + halfSize, y: symbol.points[0].y },
            { x: currentX, y: symbol.points[1].y },
            { x: currentX + symbolSize, y: symbol.points[2].y }
          ];
        }

        // Update the x position of the label
        const label = item.children[1];
        label.x = currentX + symbolSize + labelOffset;

        // Calculate the width of this item (symbol + label + spacing)
        // Estimate text width based on character count (rough approximation)
        const textLength = label.text.toString().length;
        const estimatedTextWidth = textLength * (parseInt(labelFontSize) * 0.6);
        const itemWidth = symbolSize + labelOffset + estimatedTextWidth + 20; // Add some padding

        // Update the current x position for the next item
        currentX += itemWidth;
      });
    }

    // Combine all elements into a group specification with explicit transform
    const groupSpec = {
      type: 'group',
      transform: `translate(${posX},${posY})`, // Apply explicit positioning
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
          const element = renderableGroup.renderToSvg(container);
          // Ensure the class is set on the SVG element
          if (element && !element.classList.contains('legend')) {
            element.classList.add('legend');
          }
          return element;
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
  format?: (value: any) => string,
  titleFontSize?: string,
  titleFontWeight?: string,
  titleFontFamily?: string,
  labelFontSize?: string,
  labelFontFamily?: string
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
    format: options.format || (value => value.toString()),
    titleFontSize: options.titleFontSize || '14px',
    titleFontWeight: options.titleFontWeight || 'bold',
    titleFontFamily: options.titleFontFamily || 'Arial',
    labelFontSize: options.labelFontSize || '12px',
    labelFontFamily: options.labelFontFamily || 'Arial'
  });
}

export function registerLegendComponent() {
  // Make sure define type is registered
  registerDefineType();

  // Register the legend component with the builder
  buildViz(legendDefinition);
  console.log('Legend component registered');
}

registerLegendComponent();
