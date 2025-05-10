import { buildViz } from '../core/builder';
import { createScale } from '../components/scales/scale';
import { createRenderableVisualization } from '../core/componentUtils';

// Import necessary primitives and components
import '../primitives/circle';
import '../primitives/text';
import '../primitives/group';
import '../components/axis';
import '../components/legend';

// Helper function to calculate legend position (if needed)
function calculateLegendPosition(position, dimensions, margin) {
  // Logic similar to the barChart for positioning the legend
}

// Scatter plot component definition
export const scatterPlotDefinition = {
  type: "define",
  name: "scatterPlot",
  properties: {
    data: { required: true },
    x: { required: true },
    y: { required: true },
    color: { default: '#3366CC' },
    size: { default: 5 },
    margin: { default: { top: 40, right: 30, bottom: 60, left: 60 } },
    tooltip: { default: false },
    title: { default: '' },
    width: { default: 800 },
    height: { default: 400 }
  },
  validate(props) {
    // Validate function similar to the barChart for non-empty arrays, fields, and dimensions
    if (!Array.isArray(props.data) || props.data.length === 0) {
      throw new Error('Data must be a non-empty array');
    }
    if (!props.x || !props.y) {
      throw new Error('X and Y fields are required');
    }
    if (typeof props.x !== 'object' || typeof props.y !== 'object') {
      throw new Error('X and Y must be objects with a field property');
    }
    if (props.x.field === undefined || props.y.field === undefined) {
      throw new Error('X and Y must have a field property');
    }
    // height and width must be positive numbers
    if (props.width <= 0 || props.height <= 0) {
      throw new Error('Width and height must be positive');
    }
    if (props.color && typeof props.color !== 'string' && typeof props.color !== 'object') {
      throw new Error('Color must be a string or an object with a field property');
    }
  },
  implementation(props) {
    let { data, x, y, color, size, margin, tooltip, title, width, height } = props;
    // Get data and apply transformations
    data = Array.isArray(data) ? [...data] : [];

    // Apply transforms if specified
    if (props.transforms && Array.isArray(props.transforms)) {
      data = applyTransforms(data, props.transforms);
    }

    const xField = (props.x as DataField).field;
    const yField = (props.y as DataField).field;

    // Calculate dimensions - these will be filled in by constraints
    width = width || 800;
    height = height || 400;
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    // Calculate scales
    const xValues = data.map(d => d[xField]);
    const yValues = data.map(d => d[yField]);
    const xMin = Math.min(...xValues);
    const xMax = Math.max(...xValues);
    const yMin = Math.min(...yValues);
    const yMax = Math.max(...yValues);

    // Add padding to the domain for better visualization
    const xMin_padded = xMin - (xMax - xMin) * 0.05;
    const xMax_padded = xMax + (xMax - xMin) * 0.05;
    const yMin_padded = yMin - (yMax - yMin) * 0.05;
    const yMax_padded = yMax + (yMax - yMin) * 0.05;

    // Create color scale
    let colorField: string | undefined;
    let categories: any[] = [];
    const colors = ["#3366CC", "#DC3912", "#FF9900", "#109618", "#990099"];

    if (typeof props.color === 'string') {
      // Single color for all points
      colorField = undefined;
    } else if (props.color && (props.color as DataField).field) {
      // Color based on a field
      colorField = (props.color as DataField).field;
      categories = [...new Set(data.map(d => d[colorField!]))];
    }

    // Create size scale
    let sizeField: string | undefined;
    let sizeMin: number = 0;
    let sizeMax: number = 0;
    let sizeRange: number[] = [5, 20];

    if (typeof props.size === 'number') {
      // Fixed size for all points
      sizeField = undefined;
    } else if (props.size && (props.size as DataField).field) {
      // Size based on a field
      sizeField = (props.size as DataField).field;
      const sizeValues = data.map(d => d[sizeField!]);
      sizeMin = Math.min(...sizeValues);
      sizeMax = Math.max(...sizeValues);
      sizeRange = (props.size as DataField).range || [5, 20];
    }

    // Create the chart group
    const groupSpec = {
      type: 'group',
      transform: `translate(${margin.left}, ${margin.top})`,
      children: [
        // X-axis
        {
          type: 'axis',
          orientation: 'bottom',
          length: chartWidth,
          values: [xMin, xMin + (xMax - xMin) * 0.25, xMin + (xMax - xMin) * 0.5, xMin + (xMax - xMin) * 0.75, xMax],
          transform: `translate(0, ${chartHeight})`,
          title: xField,
          format: (value: number) => value.toLocaleString()
        },

        // Y-axis
        {
          type: 'axis',
          orientation: 'left',
          length: chartHeight,
          values: [yMin, yMin + (yMax - yMin) * 0.25, yMin + (yMax - yMin) * 0.5, yMin + (yMax - yMin) * 0.75, yMax],
          transform: 'translate(0, 0)',
          title: yField,
          format: (value: number) => value.toLocaleString()
        },

        // Points
        ...data.map((d, i, array) => {
            const xScale = (value: number) => (value - xMin_padded) / (xMax_padded - xMin_padded) * chartWidth;
            const yScale = (value: number) => chartHeight - (value - yMin_padded) / (yMax_padded - yMin_padded) * chartHeight;

            const cx = xScale(d[xField]);
            const cy = yScale(d[yField]);

            let pointColor;
            if (typeof props.color === 'string') {
              pointColor = props.color;
            } else if (colorField) {
              const categoryIndex = categories.indexOf(d[colorField]);
              pointColor = colors[categoryIndex % colors.length];
            } else {
              pointColor = '#3366CC';
            }

            let pointSize;
            if (typeof props.size === 'number') {
              pointSize = props.size;
            } else if (sizeField) {
              const normalized = (d[sizeField] - sizeMin) / (sizeMax - sizeMin);
              pointSize = sizeRange[0] + normalized * (sizeRange[1] - sizeRange[0]);
            } else {
              pointSize = 5;
            }

            return {
              type: 'circle',
              cx,
              cy,
              r: pointSize,
              fill: pointColor,
              stroke: '#fff',
              strokeWidth: 1,
              opacity: 0.7,
              data: d,
              tooltip: props.tooltip
            };
        }),

        // Title (conditionally included)
        props.title ? {
          type: 'text',
          x: chartWidth / 2,
          y: -10,
          text: props.title,
          fontSize: '16px',
          fontFamily: 'Arial',
          fontWeight: 'bold',
          fill: '#333',
          textAnchor: 'middle'
        } : null,

        // Legend (conditionally included)
        colorField && categories.length > 0 ? {
          type: 'legend',
          orientation: 'vertical',
          transform: `translate(${chartWidth - 120}, 0)`,
          items: categories.map((category, i) => ({
            label: category,
            color: colors[i % colors.length]
          }))
        } : null
      ].filter(Boolean)
    };

    const renderableGroup = buildViz(groupSpec);
    return createRenderableVisualization(
      'scatterPlot',
      props,
      (container: SVGElement) => renderableGroup.renderToSvg(container),
      (ctx: CanvasRenderingContext2D) => renderableGroup.renderToCanvas(ctx)
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
  x: { field: string },
  y: { field: string },
  color?: string | { field: string },
  size?: number,
  margin?: { top: number, right: number, bottom: number, left: number },
  tooltip?: boolean,
  title?: string,
  width?: number,
  height?: number
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
    width: options.width || 800,
    height: options.height || 400
  });
}
