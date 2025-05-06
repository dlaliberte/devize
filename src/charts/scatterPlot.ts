// Scatter plot implementation using a declarative approach
import { VizSpec, VizInstance, DataField } from '../core/types';
import { createViz } from '../core/devize';
import { applyTransforms } from '../data/transforms';

// Import direct dependencies only
import '../primitives/shapes'; // For circle, text, etc.
import '../primitives/containers'; // For group
import '../core/obsolete-define'; // For the define component
import '../components/axis'; // For axis component
import '../components/legend'; // For legend component

// Define the scatterPlot visualization type using the define type
createViz({
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
    grid: { default: false }
  },
  implementation: (props) => {
    // Get data and apply transformations
    let data = Array.isArray(props.data) ? [...props.data] : [];

    // Apply transforms if specified
    if (props.transforms && Array.isArray(props.transforms)) {
      data = applyTransforms(data, props.transforms);
    }

    const xField = (props.x as DataField).field;
    const yField = (props.y as DataField).field;
    const margin = props.margin;

    // Calculate dimensions - these will be filled in by constraints
    const width = props.width || 800;
    const height = props.height || 400;
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
    return {
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
        {
          type: 'dataMap',
          data: data,
          map: (d, i, array) => {
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
          }
        },

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
      ].filter(Boolean) // Remove null items
    };
  }
}, document.createElement('div')); // We need a container, but it won't be used for rendering

/**
 * Create a scatter plot
 * @param spec The scatter plot specification
 * @param container The container element
 * @returns The scatter plot instance
 */
export function createScatterPlot(spec: VizSpec): VizInstance {
  // Make sure the scatter plot type is registered
  registerScatterPlotType();

  // Create the visualization using the registered type
  return createViz(spec, container);
}
