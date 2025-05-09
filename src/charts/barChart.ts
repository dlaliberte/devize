/**
 * Bar Chart Component
 *
 * Purpose: Provides a bar chart visualization
 * Author: [Author Name]
 * Creation Date: [Date]
 * Last Modified: [Date]
 */

import { buildViz } from '../core/builder';
import { registerDefineType } from '../core/define';
import { createScale } from '../components/scales/scale';

// Make sure define type is registered
registerDefineType();

// Import required components
import '../primitives/shapes'; // For rectangle
import '../primitives/text'; // For text
import '../primitives/containers'; // For group
import '../components/axis'; // For axis component
import '../components/legend'; // For legend component
import '../components/scales/scale'; // For scale component

// Define the barChart visualization type
buildViz({
  type: "define",
  name: "barChart",
  properties: {
    data: { required: true },
    x: { required: true },
    y: { required: true },
    color: { default: '#3366CC' },
    margin: { default: { top: 40, right: 30, bottom: 60, left: 60 } },
    tooltip: { default: false },
    title: { default: '' },
    grid: { default: false },
    width: { default: 800 },
    height: { default: 400 }
  },

  implementation: function(props) {
    console.log('Bar chart implementation called with props:', props);

    // Extract properties from props
    const { data, x, y, color, margin, tooltip, title, grid, width, height } = props;

    console.log('Data:', data);
    console.log('Dimensions:', width, height);

    // Calculate dimensions
    const dimensions = {
      chartWidth: width - margin.left - margin.right,
      chartHeight: height - margin.top - margin.bottom
    };

    // Extract data for axes
    const xValues = data.map(d => d[x.field]);

    // Calculate y-axis statistics
    const yValues = data.map(d => d[y.field]);
    const yMin = Math.min(0, ...yValues);
    const yMax = Math.max(...yValues);
    const yAxisValues = [0, yMax * 0.25, yMax * 0.5, yMax * 0.75, yMax];

    // Create scales using the createScale function
    const xScale = createScale('band', {
      domain: xValues,
      range: [0, dimensions.chartWidth],
      padding: 0.2
    });

    const yScale = createScale('linear', {
      domain: [0, yMax],
      range: [dimensions.chartHeight, 0]
    });

    // Build the visualization with these scales
    const groupSpec = {
      type: 'group',
      transform: `translate(${margin.left}, ${margin.top})`,
      children: [
        // X-axis
        {
          type: 'axis',
          orientation: 'bottom',
          scale: xScale,  // Pass the scale object directly
          length: dimensions.chartWidth,
          transform: `translate(0, ${dimensions.chartHeight})`,
          title: x.field,
          values: xValues  // Add this line to provide the required 'values' property
        },

        // Y-axis
        {
          type: 'axis',
          orientation: 'left',
          scale: yScale,  // Pass the scale object directly
          length: dimensions.chartHeight,
          transform: 'translate(0, 0)',
          title: y.field,
          format: value => value.toLocaleString(),
          values: yAxisValues  // Add this line to provide the required 'values' property
        },

        // Bars
        ...data.map((d, i, array) => {
          // Use the scales to calculate bar position and dimensions
          const barX = xScale.scale(d[x.field]);
          const barWidth = xScale.bandwidth ? xScale.bandwidth() : dimensions.chartWidth / data.length * 0.8;
          const barHeight = dimensions.chartHeight - yScale.scale(d[y.field]);
          const barY = yScale.scale(d[y.field]);

          // Determine bar color
          let barColor;
          if (typeof color === 'string') {
            barColor = color;
          } else if (color && color.field) {
            const colorField = color.field;
            const categories = [...new Set(array.map(item => item[colorField]))];
            const colors = ["#3366CC", "#DC3912", "#FF9900", "#109618", "#990099"];
            const categoryIndex = categories.indexOf(d[colorField]);
            barColor = colors[categoryIndex % colors.length];
          } else {
            barColor = '#3366CC';
          }

          return {
            type: 'rectangle',
            x: barX,
            y: barY,
            width: barWidth,
            height: barHeight,
            fill: barColor,
            stroke: '#fff',
            strokeWidth: 1,
            data: d,
            tooltip: tooltip
          };
        }),

        // Title (conditionally included)
        title ? {
          type: 'text',
          x: dimensions.chartWidth / 2,
          y: -10,
          text: title,
          fontSize: '16px',
          fontFamily: 'Arial',
          fontWeight: 'bold',
          fill: '#333',
          textAnchor: 'middle'
        } : null,

        // Legend (conditionally included)
        color && typeof color !== 'string' && color.field ? {
          type: 'legend',
          legendType: 'color', // Use legendType instead of type
          transform: `translate(${dimensions.chartWidth - 120}, 0)`,
          items: (() => {
            const colorField = color.field;
            const categories = [...new Set(data.map(d => d[colorField]))];
            const colors = ["#3366CC", "#DC3912", "#FF9900", "#109618", "#990099"];

            return categories.map((category, i) => ({
              value: category,
              color: colors[i % colors.length]
            }));
          })()
        } : null
      ].filter(Boolean) // Remove null items
    };

    // Process the group specification to create a renderable visualization
    const renderableGroup = buildViz(groupSpec);

    // Return a specification with rendering functions that delegate to the group
    const result = {
      _renderType: "barChart",
      type: 'barChart',
      data,
      x,
      y,
      color,
      margin,
      tooltip,
      title,
      grid,
      width,
      height,

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
      }
    };

    console.log('Bar chart result:', result);
    return result;
  }
});

/**
 * Create a bar chart
 * @param spec The bar chart specification
 * @returns The bar chart instance
 */
export function createBarChart(spec) {
  // Create the visualization using the registered type
  return buildViz({
    ...spec,
    type: 'barChart'
  });
}
