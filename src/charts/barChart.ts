// Bar chart implementation using scales
import { createViz } from '../core/devize';
import { VizSpec, VizInstance, DataField } from '../core/types';
import { createScale } from '../components/scales/scale';

// Import direct dependencies only
import '../primitives/shapes'; // For rectangle, text, etc.
import '../primitives/containers'; // For group
import '../core/define'; // For the define component
import '../components/axis'; // For axis component
import '../components/legend'; // For legend component
import '../components/scales/scale'; // For scaling

// Define the barChart visualization type using the define type
createViz({
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

    // Create scales
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
    const result = {
      type: 'group',
      transform: `translate(${margin.left}, ${margin.top})`,
      children: [
        // X-axis using the scale
        {
          type: 'axis',
          orientation: 'bottom',
          length: dimensions.chartWidth,
          values: xValues,
          scale: xScale,
          transform: `translate(0, ${dimensions.chartHeight})`,
          title: x.field
        },

        // Y-axis using the scale
        {
          type: 'axis',
          orientation: 'left',
          length: dimensions.chartHeight,
          values: yAxisValues,
          scale: yScale,
          transform: 'translate(0, 0)',
          title: y.field,
          format: value => value.toLocaleString()
        },

        // Bars using the scales
        ...data.map((d, i, array) => {
          // Get the bar position using the scale
          const barX = xScale.scale(d[x.field]);
          const barWidth = xScale.bandwidth();
          const barY = yScale.scale(d[y.field]);
          const barHeight = dimensions.chartHeight - barY;

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
          orientation: 'vertical',
          transform: `translate(${dimensions.chartWidth - 120}, 0)`,
          items: (() => {
            const colorField = color.field;
            const categories = [...new Set(data.map(d => d[colorField]))];
            const colors = ["#3366CC", "#DC3912", "#FF9900", "#109618", "#990099"];

            return categories.map((category, i) => ({
              label: category,
              color: colors[i % colors.length]
            }));
          })()
        } : null
      ].filter(Boolean) // Remove null items
    };

    console.log('Bar chart result:', result);
    return result;
  }
});

/**
 * Create a bar chart
 * @param spec The bar chart specification
 * @param container The container element
 * @returns The bar chart instance
 */
export function createBarChart(spec: VizSpec): VizInstance {
  // Create the visualization using the registered type
  return createViz({
    ...spec,
    type: 'barChart',
    container
  });
}
