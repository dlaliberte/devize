/**
 * Bar Chart Component
 *
 * Purpose: Provides a bar chart visualization
 * Author: Devize Team
 * Creation Date: 2023-11-10
 * Last Modified: 2023-11-10
 */

import { buildViz } from '../core/builder';
import { registerDefineType } from '../core/define';
import { createScale } from '../components/scales/scale';
import { createRenderableVisualizationEnhanced } from '../core/componentUtils';
import {
  calculateLegendPosition,
  createColorMapping,
  createLegend,
  createGridLines,
  createChartTitle,
  determineXType
} from './utils/axisChartUtils';
import { CartesianCoordinateSystem, createCartesianCoordinateSystem } from '../components/coordinates/cartesianCoordinateSystem';

// Make sure define type is registered
registerDefineType();

// Import required components
import '../primitives/rectangle';
import '../primitives/text';
import '../primitives/group';
import '../components/axes/axis';
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
    height: { default: 400 },
    barPadding: { default: 0.2 },
    legend: {
      default: {
        enabled: true,
        position: 'top-right', // 'top-right', 'top-left', 'bottom-right', 'bottom-left', or {x, y}
        orientation: 'vertical'
      }
    }
  },
  validate: function (props: any) {
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
  implementation: function (props: any) {
    // Extract properties from props
    const { data, x, y, color, margin, tooltip, title, width, height, barPadding } = props;

    // Calculate dimensions
    const dimensions = {
      chartWidth: width - margin.left - margin.right,
      chartHeight: height - margin.top - margin.bottom
    };

    // Extract data for axes
    const xValues = data.map((d: any) => d[x.field]);

    // Calculate y-axis statistics
    const yValues = data.map((d: any) => d[y.field]);
    const yMin = Math.min(0, ...yValues); // Include 0 as the minimum
    const yMax = Math.max(...yValues);
    const yRange = yMax - yMin;
    const yPadding = yRange * 0.05; // 5% padding

    // Create y-axis tick values
    const yAxisValues = [
      yMin,
      yMin + yRange * 0.25,
      yMin + yRange * 0.5,
      yMin + yRange * 0.75,
      yMax + yPadding
    ];

    // Create scales using the createScale function
    const xScale = createScale('band', {
      domain: xValues,
      range: [0, dimensions.chartWidth],
      padding: barPadding
    });

    const yScale = createScale('linear', {
      domain: [yMin, yMax + yPadding],
      range: [dimensions.chartHeight, 0]
    });

    // Create a Cartesian coordinate system
    const coordSystem = createCartesianCoordinateSystem({
      width: dimensions.chartWidth,
      height: dimensions.chartHeight,
      xScale: xScale,
      yScale: yScale,
      origin: { x: 0, y: 0 }, // Origin at top-left of chart area
      flipY: true // Flip Y axis for SVG coordinate system
    });

    // Determine color mapping
    let colorMapping = null;
    const colorField = typeof color === 'object' && color.field ? color.field : null;
    if (colorField) {
      const categories = [...new Set(data.map((d: any) => d[colorField]))];
      const colors = ["#3366CC", "#DC3912", "#FF9900", "#109618", "#990099"];

      colorMapping = categories.map((category: any, index: number) => ({
        value: category,
        color: colors[index % colors.length]
      }));
    }

    // Create legend
    const legendOptions = props.legend || {};
    const legendEnabled = legendOptions.enabled !== false;

    // Calculate legend position
    let legendPosition = legendOptions.position || 'top-right';
    const calculatedPosition = calculateLegendPosition(legendPosition, dimensions, margin);

    const legend = (colorMapping && legendEnabled) ? {
      type: 'legend',
      legendType: 'color',
      items: colorMapping,
      position: calculatedPosition,
      itemSpacing: 25,
      symbolSize: 15,
      orientation: legendOptions.orientation || 'vertical',
      class: 'legend',
      transform: `translate(${calculatedPosition.x},${calculatedPosition.y})`
    } : null;

    // Create bars
    const bars = data.map((d: any) => {
      // Use the coordinate system to calculate bar position and dimensions
      const barX = xScale.scale(d[x.field]);
      const barWidth = xScale.bandwidth ? xScale.bandwidth() : dimensions.chartWidth / data.length * 0.8;

      // For the bar height, we need to handle both positive and negative values
      const yZero = yScale.scale(0);
      const yValue = yScale.scale(d[y.field]);
      const barHeight = Math.abs(yZero - yValue);

      // For the bar Y position, we need to start from the zero line for negative values
      const barY = d[y.field] >= 0 ? yValue : yZero;

      // Determine bar color
      let barColor;
      if (typeof color === 'string') {
        barColor = color;
      } else if (colorField) {
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
    const chartTitle = createChartTitle(title, dimensions);

    // Create grid lines if enabled
    const gridLines = props.grid ? createGridLines(dimensions, yAxisValues, xValues, xScale, yScale, 'band') : [];

    // Combine all elements into a group specification
    const groupSpec = {
      type: 'group',
      transform: `translate(${margin.left}, ${margin.top})`,
      children: [
        // Grid lines (if enabled)
        ...gridLines,

        // X-axis
        {
          type: 'axis',
          orientation: 'bottom',
          scale: xScale,
          length: dimensions.chartWidth,
          transform: `translate(0, ${dimensions.chartHeight})`,
          title: x.title || x.field,
          values: xValues
        },

        // Y-axis
        {
          type: 'axis',
          orientation: 'left',
          scale: yScale,
          length: dimensions.chartHeight,
          transform: 'translate(0, 0)',
          title: y.title || y.field,
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
    return createRenderableVisualizationEnhanced(
      'barChart',
      props, {
        renderToSvg:
          // SVG rendering function - delegates to the group's renderToSvg
          (container: SVGElement): SVGElement => {
            if (renderableGroup && renderableGroup.renderToSvg) {
              return renderableGroup.renderToSvg(container);
            }
            throw new Error('Failed to render SVG');
          }, renderToCanvas:
        // Canvas rendering function - delegates to the group's renderToCanvas
        (ctx: CanvasRenderingContext2D): boolean => {
          if (renderableGroup && renderableGroup.renderToCanvas) {
            return renderableGroup.renderToCanvas(ctx);
          }
          return false;
        }
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
  x: { field: string, title?: string; },
  y: { field: string, title?: string; },
  color?: string | { field: string; },
  margin?: { top: number, right: number, bottom: number, left: number; },
  tooltip?: boolean,
  title?: string,
  grid?: boolean,
  width?: number,
  height?: number,
  barPadding?: number,
  legend?: {
    enabled?: boolean,
    position?: string | { x: number, y: number; },
    orientation?: 'vertical' | 'horizontal';
  };
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
    height: options.height || 400,
    barPadding: options.barPadding !== undefined ? options.barPadding : 0.2,
    legend: options.legend
  });
}
