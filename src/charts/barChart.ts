// Bar chart implementation using a declarative approach
import { VizSpec, VizInstance, DataField } from '../core/types';
import { createViz } from '../core/devize';
import { applyTransforms } from '../data/transforms';

// Import direct dependencies only
import '../primitives/shapes'; // For rectangle, text, etc.
import '../primitives/containers'; // For group
import '../core/define'; // For the define component
import '../components/axis'; // For axis component
import '../components/legend'; // For legend component
import '../components/scales/linearScale'; // For y-axis scaling
import '../components/scales/bandScale'; // For x-axis scaling
import '../components/data/dataMap'; // For data mapping
import '../components/data/dataExtract'; // For extracting data
import '../components/data/dataStats'; // For calculating statistics
import '../components/utils/compute'; // For computing derived values

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
  implementation: {
    type: 'group',
    transform: props => `translate(${props.margin.left}, ${props.margin.top})`,
    children: [
      // Data preparation components
      {
        type: 'dataExtract',
        data: props => props.data,
        field: props => props.x.field,
        as: 'xValues'
      },
      {
        type: 'dataStats',
        data: props => props.data,
        field: props => props.y.field,
        stats: ['min', 'max'],
        as: 'yStats'
      },
      {
        type: 'compute',
        input: props => props.yStats.max,
        fn: yMax => [0, yMax * 0.25, yMax * 0.5, yMax * 0.75, yMax],
        as: 'yAxisValues'
      },
      {
        type: 'compute',
        input: props => ({
          width: props.width,
          height: props.height,
          margin: props.margin
        }),
        fn: ({ width, height, margin }) => ({
          chartWidth: width - margin.left - margin.right,
          chartHeight: height - margin.top - margin.bottom
        }),
        as: 'dimensions'
      },

      // X-axis
      {
        type: 'axis',
        orientation: 'bottom',
        length: props => props.dimensions.chartWidth,
        values: props => props.xValues,
        transform: props => `translate(0, ${props.dimensions.chartHeight})`,
        title: props => props.x.field
      },

      // Y-axis
      {
        type: 'axis',
        orientation: 'left',
        length: props => props.dimensions.chartHeight,
        values: props => props.yAxisValues,
        transform: 'translate(0, 0)',
        title: props => props.y.field,
        format: value => value.toLocaleString()
      },

      // Bars
      {
        type: 'dataMap',
        data: props => props.data,
        map: (d, i, array, props) => {
          const xField = props.x.field;
          const yField = props.y.field;
          const chartWidth = props.dimensions.chartWidth;
          const chartHeight = props.dimensions.chartHeight;
          const yMax = props.yStats.max;

          // Calculate scales
          const barWidth = (chartWidth / array.length) * 0.8;
          const xScale = (index) => index * (chartWidth / array.length) + (chartWidth / array.length) * 0.5;
          const yScale = (value) => chartHeight - (value / yMax * chartHeight);

          // Calculate bar position and dimensions
          const barHeight = chartHeight - yScale(d[yField]);
          const barX = xScale(i) - barWidth / 2;
          const barY = yScale(d[yField]);

          // Determine bar color
          let barColor;
          if (typeof props.color === 'string') {
            barColor = props.color;
          } else if (props.color && props.color.field) {
            const colorField = props.color.field;
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
            tooltip: props.tooltip
          };
        }
      },

      // Title (conditionally included)
      {
        type: 'text',
        x: props => props.dimensions.chartWidth / 2,
        y: -10,
        text: props => props.title,
        fontSize: '16px',
        fontFamily: 'Arial',
        fontWeight: 'bold',
        fill: '#333',
        textAnchor: 'middle',
        visible: props => props.title !== ''
      },

      // Legend (conditionally included)
      {
        type: 'legend',
        orientation: 'vertical',
        transform: props => `translate(${props.dimensions.chartWidth - 120}, 0)`,
        items: props => {
          if (typeof props.color === 'string' || !props.color || !props.color.field) {
            return [];
          }

          const colorField = props.color.field;
          const categories = [...new Set(props.data.map(d => d[colorField]))];
          const colors = ["#3366CC", "#DC3912", "#FF9900", "#109618", "#990099"];

          return categories.map((category, i) => ({
            label: category,
            color: colors[i % colors.length]
          }));
        },
        visible: props => {
          return typeof props.color !== 'string' && props.color && props.color.field;
        }
      }
    ]
  }
}, document.createElement('div')); // We need a container, but it won't be used for rendering

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
    type: 'barChart'
  }, container);
}
