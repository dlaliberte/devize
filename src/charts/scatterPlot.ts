/**
 * Scatter Plot Component
 *
 * Purpose: Provides a scatter plot visualization (line chart without lines)
 * Author: Devize Team
 * Creation Date: 2023-11-10
 * Last Modified: 2023-11-10
 */

import { buildViz } from '../core/builder';
import { registerDefineType } from '../core/define';
import { createScale } from '../components/scales/scale';
import { createRenderableVisualization } from '../core/componentUtils';
import {
  calculateLegendPosition,
  createColorMapping,
  createLegend,
  createGridLines,
  createChartTitle,
  determineXType
} from './utils/axisChartUtils';
import { PointStyle } from '../components/styles/pointStyle';
import { CartesianCoordinateSystem, createCartesianCoordinateSystem } from '../components/coordinates/cartesianCoordinateSystem';

// Make sure define type is registered
registerDefineType();

// Import required components
import '../primitives/circle';
import '../primitives/text';
import '../primitives/group';
import '../components/axis';
import '../components/legend';
import '../components/scales/linearScale';
import '../components/scales/bandScale';

// Import the line chart to extend it
import { lineChartDefinition } from './lineChart';

// Define the scatterPlot component as an extension of lineChart
export const scatterPlotDefinition = {
  type: "define",
  name: "scatterPlot",
  properties: {
    data: { required: true },
    x: { required: true },
    y: { required: true },
    color: { default: '#3366CC' },
    size: { default: { value: 5 } }, // Can be a fixed value or a field mapping
    margin: { default: { top: 40, right: 30, bottom: 60, left: 60 } },
    tooltip: { default: false },
    title: { default: '' },
    grid: { default: false },
    width: { default: 800 },
    height: { default: 400 },
    pointStyle: { default: null },
    legend: {
      default: {
        enabled: true,
        position: 'top-right', // 'top-right', 'top-left', 'bottom-right', 'bottom-left', or {x, y}
        orientation: 'vertical'
      }
    }
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

    // Validate size
    if (typeof props.size !== 'object' && typeof props.size !== 'number') {
      throw new Error('Size must be a number or an object with field and range properties');
    }
  },
  implementation: function(props: any) {
    // Convert scatterPlot props to lineChart props
    const lineChartProps = {
      ...props,
      showLine: false, // No lines between points
      showPoints: true, // Always show points
      pointSize: typeof props.size === 'number' ? props.size : props.size.value || 5,
      // If size is a field mapping, we'll handle it separately
    };

    // Extract properties from props
    const {
      data, x, y, color, size, margin, tooltip, title, width, height,
      pointStyle: customPointStyle
    } = props;

    // Calculate dimensions
    const dimensions = {
      chartWidth: width - margin.left - margin.right,
      chartHeight: height - margin.top - margin.bottom
    };

    // Extract data for axes
    const xValues = data.map((d: any) => d[x.field]);

    // Determine if x values are numeric, dates, or categorical
    const xType = determineXType(xValues);

    // Calculate axis statistics
    const yValues = data.map((d: any) => d[y.field]);
    let xMin, xMax;

    if (xType === 'linear') {
      xMin = Math.min(...xValues.filter(v => typeof v === 'number'));
      xMax = Math.max(...xValues.filter(v => typeof v === 'number'));
    } else if (xType === 'time') {
      xMin = new Date(Math.min(...xValues.map(d => d instanceof Date ? d.getTime() : 0)));
      xMax = new Date(Math.max(...xValues.map(d => d instanceof Date ? d.getTime() : 0)));
    } else {
      // For categorical data, we'll use the band scale
      xMin = 0;
      xMax = xValues.length - 1;
    }

    const yMin = Math.min(...yValues);
    const yMax = Math.max(...yValues);
    const xRange = xType === 'linear' ? xMax - xMin : xValues.length;
    const yRange = yMax - yMin;
    const xPadding = xRange * 0.05; // 5% padding
    const yPadding = yRange * 0.05; // 5% padding

    // Create axis tick values
    const yAxisValues = [
      yMin - yPadding,
      yMin + yRange * 0.25,
      yMin + yRange * 0.5,
      yMin + yRange * 0.75,
      yMax + yPadding
    ];

    // Create scales using the createScale function
    let xScale;
    if (xType === 'linear') {
      xScale = createScale('linear', {
        domain: [xMin - xPadding, xMax + xPadding],
        range: [0, dimensions.chartWidth]
      });
    } else if (xType === 'time') {
      const xMinTime = xMin.getTime();
      const xMaxTime = xMax.getTime();
      const xTimeRange = xMaxTime - xMinTime;
      const xTimePadding = xTimeRange * 0.05;

      xScale = createScale('time', {
        domain: [
          new Date(xMinTime - xTimePadding),
          new Date(xMaxTime + xTimePadding)
        ],
        range: [0, dimensions.chartWidth]
      });
    } else {
      // Band scale for categorical data
      xScale = createScale('band', {
        domain: xValues,
        range: [0, dimensions.chartWidth],
        padding: 0.2
      });
    }

    const yScale = createScale('linear', {
      domain: [yMin - yPadding, yMax + yPadding],
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
      colorMapping = createColorMapping(data, colorField);
    }

    // Create legend
    const legend = createLegend(colorMapping, props.legend, dimensions, margin);

    // Create size scale if size is a field mapping
    let sizeScale = null;
    let sizeField = null;
    if (typeof size === 'object' && size.field) {
      sizeField = size.field;
      const sizeValues = data.map(d => d[sizeField]);
      const sizeMin = Math.min(...sizeValues);
      const sizeMax = Math.max(...sizeValues);
      const sizeRange = size.range || [3, 15]; // Default size range

      sizeScale = createScale('linear', {
        domain: [sizeMin, sizeMax],
        range: sizeRange
      });
    }

    // Create default point style
    const defaultPointStyle = new PointStyle({
      shape: 'circle',
      size: typeof size === 'number' ? size * 2 : size.value * 2 || 10, // PointStyle size is diameter
      fill: typeof color === 'string' ? color : '#3366CC',
      stroke: '#fff',
      strokeWidth: 1
    });

    // Merge with custom style if provided
    const pointStyleToUse = customPointStyle ? defaultPointStyle.merge(customPointStyle) : defaultPointStyle;

    // Create points
    const points = data.map((d: any) => {
      const screenPoint = coordSystem.toScreen({ x: d[x.field], y: d[y.field] });

      // Determine point color
      let pointColor;
      if (typeof color === 'string') {
        pointColor = color;
      } else if (colorField) {
        const categories = [...new Set(data.map((item: any) => item[colorField]))];
        const colors = ["#3366CC", "#DC3912", "#FF9900", "#109618", "#990099"];
        const categoryIndex = categories.indexOf(d[colorField]);
        pointColor = colors[categoryIndex % colors.length];
      } else {
        pointColor = '#3366CC';
      }

      // Determine point size
      let pointSize;
      if (typeof size === 'number') {
        pointSize = size;
      } else if (sizeField && sizeScale) {
        pointSize = sizeScale.scale(d[sizeField]);
      } else {
        pointSize = size.value || 5;
      }

      // Create a custom point style for this specific point
      const pointStyle = new PointStyle({
        shape: pointStyleToUse.shape,
        size: pointSize * 2, // PointStyle size is diameter
        fill: pointColor,
        stroke: pointStyleToUse.stroke,
        strokeWidth: pointStyleToUse.strokeWidth
      });

      return {
        type: 'circle',
        cx: screenPoint.x,
        cy: screenPoint.y,
        r: pointSize,
        ...pointStyle.toSpec(),
        data: d,
        tooltip: tooltip
      };
    });

    // Create chart title
    const chartTitle = createChartTitle(title, dimensions);

    // Create grid lines if enabled
    const gridLines = props.grid ? createGridLines(dimensions, yAxisValues, xValues, xScale, yScale, xType) : [];

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
          values: xType === 'band' ? xValues : undefined
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

        // Points
        ...points,

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
      'scatterPlot',
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

// Register the scatterPlot component
buildViz(scatterPlotDefinition);

/**
 * Create a scatter plot directly
 *
 * @param options Scatter plot configuration options
 * @returns A renderable scatter plot visualization
 */
export function createScatterPlot(options: {
  data: any[],
  x: { field: string, title?: string },
  y: { field: string, title?: string },
  color?: string | { field: string },
  size?: number | { field: string, range?: [number, number] },
  margin?: { top: number, right: number, bottom: number, left: number },
  tooltip?: boolean,
  title?: string,
  grid?: boolean,
  width?: number,
  height?: number,
  pointStyle?: any,
  legend?: {
    enabled?: boolean,
    position?: string | { x: number, y: number },
    orientation?: 'vertical' | 'horizontal'
  }
}) {
  return buildViz({
    type: 'scatterPlot',
    data: options.data,
    x: options.x,
    y: options.y,
    color: options.color || '#3366CC',
    size: options.size || 5,
    margin: options.margin || { top: 40, right: 30, bottom: 60, left: 60 },
    tooltip: options.tooltip || false,
    title: options.title || '',
    grid: options.grid || false,
    width: options.width || 800,
    height: options.height || 400,
    pointStyle: options.pointStyle,
    legend: options.legend
  });
}
