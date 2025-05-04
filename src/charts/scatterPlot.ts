// Scatter plot implementation using a declarative approach
import { VizSpec, VizInstance, DataField } from '../core/types';
import { createViz } from '../core/devize';
import { registerType } from '../core/registry';
import { applyTransforms } from '../data/transforms';

/**
 * Register the scatterPlot visualization type
 */
export function registerScatterPlotType(): void {
  registerType({
    name: 'scatterPlot',
    requiredProps: ['data', 'x', 'y'],
    optionalProps: {
      color: '#3366CC',
      size: 5,
      margin: { top: 40, right: 30, bottom: 60, left: 60 },
      tooltip: false,
      title: '',
      grid: false
    },
    generateConstraints(_spec, context) {
      return [{ type: 'fitToContainer', container: context.container }];
    },
    decompose(spec, solvedConstraints) {
      // Ensure margin exists with defaults
      const margin = spec.margin || { top: 40, right: 30, bottom: 60, left: 60 };

      // Create the chart group
      const chartSpec: VizSpec = {
        type: 'group',
        transform: `translate(${margin.left}, ${margin.top})`,
        children: []
      };

      // Get data and apply transformations
      let data = Array.isArray(spec.data) ? [...spec.data] : [];

      // Apply transforms if specified
      if (spec.transforms && Array.isArray(spec.transforms)) {
        data = applyTransforms(data, spec.transforms);
      }

      const xField = (spec.x as DataField).field;
      const yField = (spec.y as DataField).field;

      // Calculate dimensions
      const width = solvedConstraints.width || 800;
      const height = solvedConstraints.height || 400;
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

      const xScale = (value: number) => (value - xMin_padded) / (xMax_padded - xMin_padded) * chartWidth;
      const yScale = (value: number) => chartHeight - (value - yMin_padded) / (yMax_padded - yMin_padded) * chartHeight;

      // Create color scale
      let colorScale: (d: any, i: number) => string;
      let colorField: string | undefined;
      let categories: any[] = [];
      const colors = ["#3366CC", "#DC3912", "#FF9900", "#109618", "#990099"];

      if (typeof spec.color === 'string') {
        // Single color for all points
        colorScale = () => spec.color as string;
      } else if (spec.color && (spec.color as DataField).field) {
        // Color based on a field
        colorField = (spec.color as DataField).field;
        categories = [...new Set(data.map(d => d[colorField!]))];
        const colorMap: Record<string, string> = {};
        categories.forEach((category, i) => {
          colorMap[category] = colors[i % colors.length];
        });
        colorScale = (d) => colorMap[d[colorField!]];
      } else {
        // Default color
        colorScale = () => '#3366CC';
      }

      // Create size scale
      let sizeScale: (d: any, i: number) => number;
      let sizeField: string | undefined;

      if (typeof spec.size === 'number') {
        // Fixed size for all points
        sizeScale = () => spec.size as number;
      } else if (spec.size && (spec.size as DataField).field) {
        // Size based on a field
        sizeField = (spec.size as DataField).field;
        const sizeValues = data.map(d => d[sizeField!]);
        const sizeMin = Math.min(...sizeValues);
        const sizeMax = Math.max(...sizeValues);
        const sizeRange = (spec.size as DataField).range || [5, 20];

        sizeScale = (d) => {
          const normalized = (d[sizeField!] - sizeMin) / (sizeMax - sizeMin);
          return sizeRange[0] + normalized * (sizeRange[1] - sizeRange[0]);
        };
      } else {
        // Default size
        sizeScale = () => 5;
      }

      // Add grid if requested
      if (spec.grid) {
        // Horizontal grid lines
        for (let i = 0; i <= 5; i++) {
          const y = i * chartHeight / 5;
          chartSpec.children!.push({
            type: 'line',
            x1: 0,
            y1: y,
            x2: chartWidth,
            y2: y,
            stroke: '#ddd',
            strokeWidth: 1,
            strokeDasharray: '3,3'
          });

          // Y-axis tick label
          const tickValue = yMin + (5 - i) * (yMax - yMin) / 5;
          chartSpec.children!.push({
            type: 'text',
            x: -10,
            y: y,
            text: tickValue.toLocaleString(),
            fontSize: '10px',
            fontFamily: 'Arial',
            fill: '#666',
            textAnchor: 'end',
            dominantBaseline: 'middle'
          });
        }

        // Vertical grid lines
        for (let i = 0; i <= 5; i++) {
          const x = i * chartWidth / 5;
          chartSpec.children!.push({
            type: 'line',
            x1: x,
            y1: 0,
            x2: x,
            y2: chartHeight,
            stroke: '#ddd',
            strokeWidth: 1,
            strokeDasharray: '3,3'
          });

          // X-axis tick label
          const tickValue = xMin + i * (xMax - xMin) / 5;
          chartSpec.children!.push({
            type: 'text',
            x: x,
            y: chartHeight + 15,
            text: tickValue.toLocaleString(),
            fontSize: '10px',
            fontFamily: 'Arial',
            fill: '#666',
            textAnchor: 'middle'
          });
        }
      }

      // Draw axes
      // X-axis
      chartSpec.children!.push({
        type: 'line',
        x1: 0,
        y1: chartHeight,
        x2: chartWidth,
        y2: chartHeight,
        stroke: '#333',
        strokeWidth: 1
      });

      // X-axis label
      chartSpec.children!.push({
        type: 'text',
        x: chartWidth / 2,
        y: chartHeight + 40,
        text: xField,
        fontSize: '14px',
        fontFamily: 'Arial',
        fill: '#333',
        textAnchor: 'middle'
      });

      // Y-axis
      chartSpec.children!.push({
        type: 'line',
        x1: 0,
        y1: 0,
        x2: 0,
        y2: chartHeight,
        stroke: '#333',
        strokeWidth: 1
      });

      // Y-axis label
      chartSpec.children!.push({
        type: 'text',
        x: -chartHeight / 2,
        y: -40,
        text: yField,
        fontSize: '14px',
        fontFamily: 'Arial',
        fill: '#333',
        textAnchor: 'middle',
        transform: 'rotate(-90)'
      });

      // Draw points
      data.forEach((d, i) => {
        const cx = xScale(d[xField]);
        const cy = yScale(d[yField]);
        const r = sizeScale(d, i);

        // Add point
        chartSpec.children!.push({
          type: 'circle',
          cx,
          cy,
          r,
          fill: colorScale(d, i),
          stroke: '#fff',
          strokeWidth: 1,
          opacity: 0.7,
          data: d,
          tooltip: spec.tooltip ? true : false
        });
      });

      // Add title
      if (spec.title) {
        chartSpec.children!.push({
          type: 'text',
          x: chartWidth / 2,
          y: -10,
          text: spec.title,
          fontSize: '16px',
          fontFamily: 'Arial',
          fontWeight: 'bold',
          fill: '#333',
          textAnchor: 'middle'
        });
      }

      // Add legend if using categorical colors
      if (colorField && categories.length > 0) {
        const legendGroup: VizSpec = {
          type: 'group',
          transform: `translate(${chartWidth - 120}, 0)`,
          children: []
        };

        categories.forEach((category, i) => {
          // Add legend color circle
          legendGroup.children!.push({
            type: 'circle',
            cx: 6,
            cy: i * 20 + 6,
            r: 6,
            fill: colors[i % colors.length],
            opacity: 0.7
          });

          // Add legend text
          legendGroup.children!.push({
            type: 'text',
            x: 20,
            y: i * 20 + 10,
            text: category,
            fontSize: '12px',
            fontFamily: 'Arial',
            fill: '#333'
          });
        });

        chartSpec.children!.push(legendGroup);
      }

      return chartSpec;
    }
  });
}

/**
 * Create a scatter plot
 * @param spec The scatter plot specification
 * @param container The container element
 * @returns The scatter plot instance
 */
export function createScatterPlot(spec: VizSpec, container: HTMLElement): VizInstance {
  // Make sure the scatter plot type is registered
  registerScatterPlotType();

  // Create the visualization using the registered type
  return createViz(spec, container);
}
