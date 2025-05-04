// Bar chart implementation using a declarative approach
import { VizSpec, VizInstance, DataField } from '../core/types';
import { createViz } from '../core/devize';
import { registerType } from '../core/registry';
import { applyTransforms } from '../data/transforms';

/**
 * Register the barChart visualization type
 */
export function registerBarChartType(): void {
  registerType({
    name: 'barChart',
    requiredProps: ['data', 'x', 'y'],
    optionalProps: {
      color: '#3366CC',
      margin: { top: 40, right: 30, bottom: 60, left: 60 },
      tooltip: false,
      title: ''
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

      // Create scales
      const xScale = (index: number) => index * (chartWidth / data.length) + (chartWidth / data.length) * 0.5;
      const yValues = data.map(d => d[yField]);
      const yMax = Math.max(...yValues, 0);
      const yScale = (value: number) => chartHeight - (value / yMax * chartHeight);

      // Create color scale
      let colorScale: (d: any, i: number) => string;
      let colorField: string | undefined;
      let categories: any[] = [];
      const colors = ["#3366CC", "#DC3912", "#FF9900", "#109618", "#990099"];

      if (typeof spec.color === 'string') {
        // Single color for all bars
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

      // Draw bars
      data.forEach((d, i) => {
        const barWidth = (chartWidth / data.length) * 0.8;
        const barHeight = chartHeight - yScale(d[yField]);
        const barX = xScale(i) - barWidth / 2;
        const barY = yScale(d[yField]);

        // Add bar
        chartSpec.children!.push({
          type: 'rectangle',
          x: barX,
          y: barY,
          width: barWidth,
          height: barHeight,
          fill: colorScale(d, i),
          stroke: '#fff',
          strokeWidth: 1,
          data: d,
          tooltip: spec.tooltip ? true : false
        });

        // Add x-axis tick
        chartSpec.children!.push({
          type: 'line',
          x1: xScale(i),
          y1: chartHeight,
          x2: xScale(i),
          y2: chartHeight + 5,
          stroke: '#333',
          strokeWidth: 1
        });

        // Add x-axis label
        chartSpec.children!.push({
          type: 'text',
          x: xScale(i),
          y: chartHeight + 20,
          text: d[xField],
          fontSize: '12px',
          fontFamily: 'Arial',
          fill: '#333',
          textAnchor: 'middle'
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
          // Add legend color rectangle
          legendGroup.children!.push({
            type: 'rectangle',
            x: 0,
            y: i * 20,
            width: 12,
            height: 12,
            fill: colors[i % colors.length]
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
 * Create a bar chart
 * @param spec The bar chart specification
 * @param container The container element
 * @returns The bar chart instance
 */
export function createBarChart(spec: VizSpec, container: HTMLElement): VizInstance {
  // Make sure the bar chart type is registered
  registerBarChartType();

  // Create the visualization using the registered type
  return createViz(spec, container);
}
