// Bar chart implementation using a structured functional approach
import { createViz } from '../core/devize';
import { VizSpec, VizInstance, DataField } from '../core/types';

// Import direct dependencies only
import '../primitives/shapes'; // For rectangle, text, etc.
import '../primitives/containers'; // For group
import '../core/define'; // For the define component
import '../components/axis'; // For axis component
import '../components/legend'; // For legend component
import '../components/scales/linearScale'; // For y-axis scaling
import '../components/scales/bandScale'; // For x-axis scaling
import '../components/data/dataMap'; // For data mapping

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
  requiresContainer: true, // Explicitly set this to true
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

    // Calculate bar positioning parameters
    const barSpacing = 0.2; // 20% of available space for spacing
    const barWidth = (dimensions.chartWidth / data.length) * (1 - barSpacing);

    // Calculate x positions for each bar center - these will be used for axis ticks too
    const xPositions = data.map((_, i) =>
      i * (dimensions.chartWidth / data.length) + (dimensions.chartWidth / data.length) * 0.5
    );

    // Build the visualization with these pre-calculated values
    const result = {
      type: 'group',
      transform: `translate(${margin.left}, ${margin.top})`,
      children: [
        // X-axis with corrected tick positions
        {
          type: 'axis',
          orientation: 'bottom',
          length: dimensions.chartWidth,
          values: xValues,
          positions: xPositions, // Pass the calculated positions for ticks
          transform: `translate(0, ${dimensions.chartHeight})`,
          title: x.field
        },

        // Y-axis
        {
          type: 'axis',
          orientation: 'left',
          length: dimensions.chartHeight,
          values: yAxisValues,
          transform: 'translate(0, 0)',
          title: y.field,
          format: value => value.toLocaleString()
        },

        // Bars
        ...data.map((d, i, array) => {
          // Use the pre-calculated positions
          const barX = xPositions[i] - barWidth / 2;
          const yScale = (value) => dimensions.chartHeight - (value / yMax * dimensions.chartHeight);
          const barY = yScale(d[y.field]);
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
export function createBarChart(spec: VizSpec, container: HTMLElement): VizInstance {
  // Create the visualization using the registered type
  return createViz({
    ...spec,
    type: 'barChart',
    container
  });
}
