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
import { createRenderableVisualization } from '../core/componentUtils';

// Make sure define type is registered
registerDefineType();

// Import required components
import '../primitives/rectangle';
import '../primitives/text';
import '../primitives/group';
import '../components/axis';
import '../components/legend';
import '../components/scales/linearScale';
import '../components/scales/bandScale';

// Define the barChart component
export const barChartDefinition = {
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
  validate: function(props: any) {
    // Validate data is an array
    if (!Array.isArray(props.data)) {
      throw new Error('Data must be an array');
    }

    // Validate x and y fields
    if (!props.x || !props.x.field) {
      throw new Error('X field must be specified');
    }

    if (!props.y || !props.y.field) {
      throw new Error('Y field must be specified');
    }

    // Validate dimensions
    if (props.width <= 0 || props.height <= 0) {
      throw new Error('Width and height must be positive');
    }
  },
  implementation: function(props: any) {
    // Extract properties from props
    const { data, x, y, color, margin, tooltip, title, width, height } = props;

    // Calculate dimensions
    const dimensions = {
      chartWidth: width - margin.left - margin.right,
      chartHeight: height - margin.top - margin.bottom
    };

    // Extract data for axes
    const xValues = data.map((d: any) => d[x.field]);

    // Calculate y-axis statistics
    const yValues = data.map((d: any) => d[y.field]);
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

    // Determine color mapping
    let colorMapping = null;
    if (typeof color === 'object' && color.field) {
      const colorField = color.field;
      const categories = [...new Set(data.map((d: any) => d[colorField]))];
      const colors = ["#3366CC", "#DC3912", "#FF9900", "#109618", "#990099"];

      colorMapping = categories.map((category: any, index: number) => ({
        value: category,
        color: colors[index % colors.length]
      }));
    }

    // Create legend if color mapping exists
    const legend = colorMapping ? {
      type: 'legend',
      legendType: 'color',
      transform: `translate(${dimensions.chartWidth - 120}, 0)`,
      items: colorMapping
    } : null;

    // Create bars
    const bars = data.map((d: any) => {
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
        const categories = [...new Set(data.map((item: any) => item[colorField]))];
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
    });

    // Create chart title
    const chartTitle = title ? {
      type: 'text',
      x: dimensions.chartWidth / 2,
      y: -10,
      text: title,
      fontSize: '16px',
      fontFamily: 'Arial',
      fontWeight: 'bold',
      fill: '#333',
      textAnchor: 'middle'
    } : null;

    // Combine all elements into a group specification
    const groupSpec = {
      type: 'group',
      transform: `translate(${margin.left}, ${margin.top})`,
      children: [
        // X-axis
        {
          type: 'axis',
          orientation: 'bottom',
          scale: xScale,
          length: dimensions.chartWidth,
          transform: `translate(0, ${dimensions.chartHeight})`,
          title: x.field,
          values: xValues
        },

        // Y-axis
        {
          type: 'axis',
          orientation: 'left',
          scale: yScale,
          length: dimensions.chartHeight,
          transform: 'translate(0, 0)',
          title: y.field,
          format: (value: number) => value.toLocaleString(),
          values: yAxisValues
        },

        // Bars
        ...bars,

        // Title
        chartTitle,

        // Legend
        legend
      ].filter(Boolean) // Remove null items
    };

    // Process the group specification to create a renderable visualization
    const renderableGroup = buildViz(groupSpec);

    // Create and return a renderable visualization
    return createRenderableVisualization(
      'barChart',
      props,
      // SVG rendering function - delegates to the group's renderToSvg
      (container: SVGElement): SVGElement => {
        if (renderableGroup && renderableGroup.renderToSvg) {
          return renderableGroup.renderToSvg(container);
        }
        throw new Error('Failed to render SVG');
      },
      // Canvas rendering function - delegates to the group's renderToCanvas
      (ctx: CanvasRenderingContext2D): boolean => {
        if (renderableGroup && renderableGroup.renderToCanvas) {
          return renderableGroup.renderToCanvas(ctx);
        }
        return false;
      }
    );
  }
};

// Register the barChart component
buildViz(barChartDefinition);

/**
 * Create a bar chart directly
 *
 * @param options Bar chart configuration options
 * @returns A renderable bar chart visualization
 */
export function createBarChart(options: {
  data: any[],
  x: { field: string },
  y: { field: string },
  color?: string | { field: string },
  margin?: { top: number, right: number, bottom: number, left: number },
  tooltip?: boolean,
  title?: string,
  grid?: boolean,
  width?: number,
  height?: number
}) {
  return buildViz({
    type: 'barChart',
    data: options.data,
    x: options.x,
    y: options.y,
    color: options.color || '#3366CC',
    margin: options.margin || { top: 40, right: 30, bottom: 60, left: 60 },
    tooltip: options.tooltip || false,
    title: options.title || '',
    grid: options.grid || false,
    width: options.width || 800,
    height: options.height || 400
  });
}
