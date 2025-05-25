/**
 * Line Chart Component
 *
 * Purpose: Provides a line chart visualization with options for area charts and scatter plots
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
import { LineStyle } from '../components/styles/lineStyle';
import { AreaStyle } from '../components/styles/areaStyle';
import { PointStyle } from '../components/styles/pointStyle';
import { CartesianCoordinateSystem, createCartesianCoordinateSystem } from '../components/coordinates/cartesianCoordinateSystem';
import { Annotation, renderAnnotations } from '../core/annotations';

// Make sure define type is registered
registerDefineType();

// Import required components
import '../primitives/path';
import '../primitives/circle';
import '../primitives/text';
import '../primitives/group';
import '../components/axes/axis';
import '../components/legend';
import '../components/scales/linearScale';
import '../components/scales/bandScale';

// Define the lineChart component
export const lineChartDefinition = {
  type: "define",
  name: "lineChart",
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
    curve: { default: 'linear' }, // 'linear', 'cardinal', 'step'
    showLine: { default: true },
    showPoints: { default: true },
    pointSize: { default: 4 },
    lineWidth: { default: 2 },
    fillArea: { default: false },
    fillOpacity: { default: 0.2 },
    lineStyle: { default: null },
    areaStyle: { default: null },
    pointStyle: { default: null },
    legend: {
      default: {
        enabled: true,
        position: 'top-right', // 'top-right', 'top-left', 'bottom-right', 'bottom-left', or {x, y}
        orientation: 'vertical'
      }
    },
    annotations: {
      default: [],
      validate: (annotations: Annotation[]) => {
        if (!Array.isArray(annotations)) {
          throw new Error('Annotations must be an array');
        }
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

    // Validate curve type
    const validCurves = ['linear', 'cardinal', 'step'];
    if (props.curve && !validCurves.includes(props.curve)) {
      throw new Error(`Curve must be one of: ${validCurves.join(', ')}`);
    }
  },
  implementation: function(props: any) {
    // Extract properties from props
    const {
      data, x, y, color, margin, tooltip, title, width, height,
      curve, showLine, showPoints, pointSize, lineWidth, fillArea, fillOpacity,
      lineStyle: customLineStyle, areaStyle: customAreaStyle, pointStyle: customPointStyle
    } = props;

    // Calculate dimensions
    const dimensions = {
      chartWidth: width - margin.left - margin.right,
      chartHeight: height - margin.top - margin.bottom
    };

    // Sort data by x value to ensure proper line drawing
    const sortedData = [...data].sort((a, b) => {
      const aVal = a[x.field];
      const bVal = b[x.field];

      // Handle numeric values
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return aVal - bVal;
      }

      // Handle date values
      if (aVal instanceof Date && bVal instanceof Date) {
        return aVal.getTime() - bVal.getTime();
      }

      // Handle string values
      return String(aVal).localeCompare(String(bVal));
    });

    // Extract data for axes
    const xValues = sortedData.map((d: any) => d[x.field]);

    // Determine if x values are numeric, dates, or categorical
    const xType = determineXType(xValues);

    // Calculate y-axis statistics
    const yValues = sortedData.map((d: any) => d[y.field]);
    const yMin = Math.min(...yValues);
    const yMax = Math.max(...yValues);
    const yRange = yMax - yMin;
    const yPadding = yRange * 0.05; // 5% padding

    // Create y-axis tick values
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
      const xMin = Math.min(...xValues);
      const xMax = Math.max(...xValues);
      const xRange = xMax - xMin;
      const xPadding = xRange * 0.05; // 5% padding

      xScale = createScale('linear', {
        domain: [xMin - xPadding, xMax + xPadding],
        range: [0, dimensions.chartWidth]
      });
    } else if (xType === 'time') {
      const xMin = new Date(Math.min(...xValues.map(d => d.getTime())));
      const xMax = new Date(Math.max(...xValues.map(d => d.getTime())));
      const xRange = xMax.getTime() - xMin.getTime();
      const xPadding = xRange * 0.05; // 5% padding

      xScale = createScale('time', {
        domain: [
          new Date(xMin.getTime() - xPadding),
          new Date(xMax.getTime() + xPadding)
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

    // Create default styles
    const defaultLineStyle = new LineStyle({
      stroke: typeof color === 'string' ? color : '#3366CC',
      strokeWidth: lineWidth,
      strokeLinecap: 'round',
      strokeLinejoin: 'round'
    });

    const defaultAreaStyle = new AreaStyle({
      fill: typeof color === 'string' ? color : '#3366CC',
      fillOpacity: fillOpacity,
      stroke: 'none'
    });

    const defaultPointStyle = new PointStyle({
      shape: 'circle',
      size: pointSize * 2, // PointStyle size is diameter, not radius
      fill: typeof color === 'string' ? color : '#3366CC',
      stroke: '#fff',
      strokeWidth: 1
    });

    // Merge with custom styles if provided
    const lineStyleToUse = customLineStyle ? defaultLineStyle.merge(customLineStyle) : defaultLineStyle;
    const areaStyleToUse = customAreaStyle ? defaultAreaStyle.merge(customAreaStyle) : defaultAreaStyle;
    const pointStyleToUse = customPointStyle ? defaultPointStyle.merge(customPointStyle) : defaultPointStyle;

    // Generate path data for the line using the coordinate system
    function generatePathData(data: any[]) {
      if (data.length === 0) return '';

      let pathData = '';

      // Move to the first point
      const firstPoint = data[0];
      const firstScreenPoint = coordSystem.toScreen({ x: firstPoint[x.field], y: firstPoint[y.field] });
      pathData += `M ${firstScreenPoint.x} ${firstScreenPoint.y} `;

      // Add line segments based on curve type
      if (curve === 'linear') {
        // Simple line segments
        for (let i = 1; i < data.length; i++) {
          const d = data[i];
          const screenPoint = coordSystem.toScreen({ x: d[x.field], y: d[y.field] });
          pathData += `L ${screenPoint.x} ${screenPoint.y} `;
        }
      } else if (curve === 'cardinal') {
        // Cardinal spline (simplified version)
        for (let i = 1; i < data.length; i++) {
          const d = data[i];
          const screenPoint = coordSystem.toScreen({ x: d[x.field], y: d[y.field] });

          // Simple curved line - in a real implementation, this would use
          // proper cardinal spline calculations
          if (i === 1) {
            pathData += `C ${firstScreenPoint.x + (screenPoint.x - firstScreenPoint.x) / 2} ${firstScreenPoint.y}, `;
            pathData += `${firstScreenPoint.x + (screenPoint.x - firstScreenPoint.x) / 2} ${screenPoint.y}, `;
            pathData += `${screenPoint.x} ${screenPoint.y} `;
          } else {
            const prevD = data[i - 1];
            const prevScreenPoint = coordSystem.toScreen({ x: prevD[x.field], y: prevD[y.field] });

            pathData += `S ${prevScreenPoint.x + (screenPoint.x - prevScreenPoint.x) / 2} ${screenPoint.y}, `;
            pathData += `${screenPoint.x} ${screenPoint.y} `;
          }
        }
      } else if (curve === 'step') {
        // Step line (horizontal first)
        for (let i = 1; i < data.length; i++) {
          const d = data[i];
          const screenPoint = coordSystem.toScreen({ x: d[x.field], y: d[y.field] });
          const prevD = data[i - 1];
          const prevScreenPoint = coordSystem.toScreen({ x: prevD[x.field], y: prevD[y.field] });

          // Horizontal line to midpoint, then vertical line
          pathData += `H ${screenPoint.x} V ${screenPoint.y} `;
        }
      }

      return pathData;
    }

    // Generate area path data (for filled area charts)
    function generateAreaPathData(data: any[]) {
      if (data.length === 0) return '';

      // Start with the line path
      let pathData = generatePathData(data);

      // Add the closing path to create an area
      const lastPoint = data[data.length - 1];
      const lastScreenPoint = coordSystem.toScreen({ x: lastPoint[x.field], y: lastPoint[y.field] });

      // Line to bottom
      pathData += `L ${lastScreenPoint.x} ${dimensions.chartHeight} `;

      // Line to bottom-left corner
      const firstPoint = data[0];
      const firstScreenPoint = coordSystem.toScreen({ x: firstPoint[x.field], y: firstPoint[y.field] });
      pathData += `L ${firstScreenPoint.x} ${dimensions.chartHeight} `;

      // Close the path
      pathData += 'Z';

      return pathData;
    }

    // Create chart elements
    const chartElements = [];

    // If we're showing multiple series based on a color field
    if (colorField) {
      const categories = [...new Set(data.map((d: any) => d[colorField]))];
      const colors = ["#3366CC", "#DC3912", "#FF9900", "#109618", "#990099"];

      // Create a line/area for each category
      categories.forEach((category, index) => {
        const categoryData = sortedData.filter((d: any) => d[colorField] === category);
        const lineColor = colors[index % colors.length];

        // Create category-specific styles
        const categoryLineStyle = new LineStyle({
          stroke: lineColor,
          strokeWidth: lineWidth,
          strokeLinecap: 'round',
          strokeLinejoin: 'round'
        });

        const categoryAreaStyle = new AreaStyle({
          fill: lineColor,
          fillOpacity: fillOpacity,
          stroke: 'none'
        });

        const categoryPointStyle = new PointStyle({
          shape: 'circle',
          size: pointSize * 2,
          fill: lineColor,
          stroke: '#fff',
          strokeWidth: 1
        });

        // Add area fill if enabled
        if (fillArea) {
          chartElements.push({
            type: 'path',
            d: generateAreaPathData(categoryData),
            ...categoryAreaStyle.toSpec(),
            class: `area-${category}`,
            data: { category }
          });
        }

        // Add line if enabled
        if (showLine) {
          chartElements.push({
            type: 'path',
            d: generatePathData(categoryData),
            fill: 'none',
            ...categoryLineStyle.toSpec(),
            class: `line-${category}`,
            data: { category }
          });
        }

        // Add points if enabled
        if (showPoints) {
          categoryData.forEach((d: any) => {
            const screenPoint = coordSystem.toScreen({ x: d[x.field], y: d[y.field] });
            chartElements.push({
              type: 'circle',
              cx: screenPoint.x,
              cy: screenPoint.y,
              r: pointSize,
              ...categoryPointStyle.toSpec(),
              class: `point-${category}`,
              data: d,

              tooltip: tooltip
            });
          });
        }
      });
    } else {
      // Single series
      const lineColor = typeof color === 'string' ? color : '#3366CC';

      // Add area fill if enabled
      if (fillArea) {
        chartElements.push({
          type: 'path',
          d: generateAreaPathData(sortedData),
          ...areaStyleToUse.toSpec(),
          class: 'area'
        });
      }

      // Add line if enabled
      if (showLine) {
        chartElements.push({
          type: 'path',
          d: generatePathData(sortedData),
          fill: 'none',
          ...lineStyleToUse.toSpec(),
          class: 'line'
        });
      }

      // Add points if enabled
      if (showPoints) {
        sortedData.forEach((d: any) => {
          chartElements.push({
            type: 'circle',
            cx: xScale.scale(d[x.field]),
            cy: yScale.scale(d[y.field]),
            r: pointSize,
            fill: lineColor,
            stroke: '#fff',
            strokeWidth: 1,
            class: 'point',
            data: d,
            tooltip: tooltip
          });
        });
      }
    }

    // Create chart title
    const chartTitle = createChartTitle(title, dimensions);

    // Create grid lines if enabled
    const gridLines = props.grid ? createGridLines(dimensions, yAxisValues, xValues, xScale, yScale, xType) : [];

    // Create rendered annotations
    const renderedAnnotations = props.annotations && props.annotations.length > 0
      ? renderAnnotations(props.annotations, coordSystem, dimensions)
      : [];

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

        // Chart elements (lines, areas, points)
        ...chartElements,

        // Annotations
        ...renderedAnnotations,

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
      'lineChart',
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

// Register the lineChart component
buildViz(lineChartDefinition);

/**
 * Create a line chart directly
 *
 * @param options Line chart configuration options
 * @returns A renderable line chart visualization
 */
export function createLineChart(options: {
  data: any[],
  x: { field: string, title?: string },
  y: { field: string, title?: string },
  color?: string | { field: string },
  margin?: { top: number, right: number, bottom: number, left: number },
  tooltip?: boolean,
  title?: string,
  grid?: boolean,
  width?: number,
  height?: number,
  curve?: 'linear' | 'cardinal' | 'step',
  showLine?: boolean,
  showPoints?: boolean,
  pointSize?: number,
  lineWidth?: number,
  fillArea?: boolean,
  fillOpacity?: number,
  legend?: {
    enabled?: boolean,
    position?: string | { x: number, y: number },
    orientation?: 'vertical' | 'horizontal'
  },
  annotations?: Annotation[]
}) {
  return buildViz({
    type: 'lineChart',
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
    curve: options.curve || 'linear',
    showLine: options.showLine !== undefined ? options.showLine : true,
    showPoints: options.showPoints !== undefined ? options.showPoints : true,
    pointSize: options.pointSize || 4,
    lineWidth: options.lineWidth || 2,
    fillArea: options.fillArea || false,
    fillOpacity: options.fillOpacity || 0.2,
    legend: options.legend,
    annotations: options.annotations || []
  });
}
