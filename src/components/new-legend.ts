/**
 * Legend Component
 *
 * Purpose: Provides legend visualization for charts
 * Author: Cody
 * Creation Date: 2023-11-17
 */

import { buildViz } from '../core/builder';
import { registerDefineType } from '../core/define';
import { createRenderableVisualization } from '../core/componentUtils';

// Import required primitives
import '../primitives/group';
import '../primitives/rect';
import '../primitives/text';

// Make sure define type is registered
registerDefineType();

// Define the legend component
export const legendDefinition = {
  type: "define",
  name: "legend",
  properties: {
    type: { default: 'color', required: true },
    orientation: { default: 'horizontal', required: true },
    title: { default: '' },
    items: { default: [], required: true },
    symbolSize: { default: 15 },
    fontSize: { default: '12px' },
    fontFamily: { default: 'Arial' },
    titleFontSize: { default: '14px' },
    titleFontWeight: { default: 'bold' },
    padding: { default: 5 },
    itemSpacing: { default: 10 },
    backgroundColor: { default: 'transparent' },
    border: { default: false },
    borderColor: { default: '#ccc' },
    borderWidth: { default: 1 },
    borderRadius: { default: 4 },
    className: { default: 'legend' }
  },
  validate: function(props) {
    // Validate type
    const validTypes = ['color', 'size', 'shape', 'line'];
    if (!validTypes.includes(props.type)) {
      throw new Error(`Invalid legend type: ${props.type}. Must be one of: ${validTypes.join(', ')}`);
    }

    // Validate orientation
    const validOrientations = ['horizontal', 'vertical'];
    if (!validOrientations.includes(props.orientation)) {
      throw new Error(`Invalid orientation: ${props.orientation}. Must be one of: ${validOrientations.join(', ')}`);
    }

    // Validate items
    if (!Array.isArray(props.items) || props.items.length === 0) {
      throw new Error('Legend items must be a non-empty array');
    }

    // Validate each item has label and value
    props.items.forEach((item, index) => {
      if (!item.label || !item.value) {
        throw new Error(`Legend item at index ${index} must have both label and value properties`);
      }
    });
  },
  implementation: function(props) {
    const {
      type, orientation, title, items, symbolSize, fontSize, fontFamily,
      titleFontSize, titleFontWeight, padding, itemSpacing,
      backgroundColor, border, borderColor, borderWidth, borderRadius,
      className
    } = props;

    const isHorizontal = orientation === 'horizontal';

    // Calculate dimensions based on content
    const titleHeight = title ? parseInt(titleFontSize) + 10 : 0;
    const itemHeight = Math.max(parseInt(fontSize), symbolSize);

    // Create legend items
    const legendItems = items.map((item, index) => {
      const symbol = createSymbol(type, item.value, symbolSize);

      return {
        type: 'group',
        transform: isHorizontal
          ? `translate(${index * (symbolSize + parseInt(fontSize) * 5 + itemSpacing)}, ${titleHeight})`
          : `translate(0, ${titleHeight + index * (itemHeight + itemSpacing)})`,
        children: [
          // Symbol
          symbol,
          // Label
          {
            type: 'text',
            x: symbolSize + 5,
            y: symbolSize / 2,
            text: item.label,
            fontSize: fontSize,
            fontFamily: fontFamily,
            dominantBaseline: 'middle',
            textAnchor: 'start',
            class: 'legend-item-label'
          }
        ],
        class: 'legend-item'
      };
    });

    // Calculate total width and height
    let totalWidth, totalHeight;

    if (isHorizontal) {
      totalWidth = items.length * (symbolSize + parseInt(fontSize) * 5 + itemSpacing) - itemSpacing + padding * 2;
      totalHeight = titleHeight + itemHeight + padding * 2;
    } else {
      totalWidth = symbolSize + parseInt(fontSize) * 5 + padding * 2;
      totalHeight = titleHeight + items.length * (itemHeight + itemSpacing) - itemSpacing + padding * 2;
    }

    // Create legend title if provided
    const legendTitle = title ? {
      type: 'text',
      x: isHorizontal ? totalWidth / 2 : padding,
      y: padding,
      text: title,
      fontSize: titleFontSize,
      fontFamily: fontFamily,
      fontWeight: titleFontWeight,
      dominantBaseline: 'hanging',
      textAnchor: isHorizontal ? 'middle' : 'start',
      class: 'legend-title'
    } : null;

    // Create background and border if needed
    const background = (backgroundColor !== 'transparent' || border) ? {
      type: 'rect',
      x: 0,
      y: 0,
      width: totalWidth,
      height: totalHeight,
      fill: backgroundColor,
      stroke: border ? borderColor : 'none',
      strokeWidth: border ? borderWidth : 0,
      rx: borderRadius,
      ry: borderRadius,
      class: 'legend-background'
    } : null;

    // Combine all elements into a group
    const groupSpec = {
      type: 'group',
      class: className,
      children: [
        background,
        legendTitle,
        ...legendItems
      ].filter(Boolean),
      // Add ARIA attributes for accessibility
      'aria-label': `Legend ${title ? 'for ' + title : ''}`
    };

    // Process the group specification to create a renderable visualization
    const renderableGroup = buildViz(groupSpec);

    // Return a specification with rendering functions that delegate to the group
    const renderable = {
      renderableType: "legend",
      type,
      orientation,
      items,

      // SVG rendering function - delegates to the group's renderToSvg
      renderToSvg: (container) => {
        if (renderableGroup && renderableGroup.renderToSvg) {
          return renderableGroup.renderToSvg(container);
        }
        return null;
      },

      // Canvas rendering function - delegates to the group's renderToCanvas
      renderToCanvas: (ctx) => {
        if (renderableGroup && renderableGroup.renderToCanvas) {
          return renderableGroup.renderToCanvas(ctx);
        }
        return false;
      },

      // Get a property value
      getProperty: (name) => {
        if (name === 'type') return type;
        if (name === 'orientation') return orientation;
        if (name === 'items') return items;
        if (name === 'title') return title;
        return props[name];
      }
    };

    // Create and return a renderable visualization using the utility function
    return createRenderableVisualization('legend', props, renderable.renderToSvg, renderable.renderToCanvas);
  }
};

// Helper function to create a symbol based on type and value
function createSymbol(type, value, size) {
  switch (type) {
    case 'color':
      return {
        type: 'rect',
        x: 0,
        y: 0,
        width: size,
        height: size,
        fill: value,
        stroke: '#000',
        strokeWidth: 0.5,
        class: 'legend-symbol color-symbol'
      };
    case 'size':
      const sizeValue = parseFloat(value);
      const normalizedSize = Math.max(size * (sizeValue / 100), 2);
      return {
        type: 'circle',
        cx: size / 2,
        cy: size / 2,
        r: normalizedSize / 2,
        fill: '#666',
        class: 'legend-symbol size-symbol'
      };
    case 'shape':
      // For shape, value should be a shape name like 'circle', 'square', 'triangle'
      if (value === 'circle') {
        return {
          type: 'circle',
          cx: size / 2,
          cy: size / 2,
          r: size / 2,
          fill: '#666',
          class: 'legend-symbol shape-symbol'
        };
      } else if (value === 'triangle') {
        return {
          type: 'polygon',
          points: `${size/2},0 ${size},${size} 0,${size}`,
          fill: '#666',
          class: 'legend-symbol shape-symbol'
        };
      } else {
        // Default to square
        return {
          type: 'rect',
          x: 0,
          y: 0,
          width: size,
          height: size,
          fill: '#666',
          class: 'legend-symbol shape-symbol'
        };
      }
    case 'line':
      // For line, value should be a line style like 'solid', 'dashed', 'dotted'
      return {
        type: 'line',
        x1: 0,
        y1: size / 2,
        x2: size,
        y2: size / 2,
        stroke: '#666',
        strokeWidth: 2,
        strokeDasharray: value === 'dashed' ? '4,2' : (value === 'dotted' ? '1,2' : 'none'),
        class: 'legend-symbol line-symbol'
      };
    default:
      return {
        type: 'rect',
        x: 0,
        y: 0,
        width: size,
        height: size,
        fill: value,
        class: 'legend-symbol'
      };
  }
}

/**
 * Create a legend directly
 *
 * @param options Legend configuration options
...
