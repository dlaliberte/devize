/**
 * Medical Test Chart Component
 *
 * Purpose: Visualizes medical test results with normal ranges and caution zones
 * Author: Devize Team
 * Creation Date: 2023-12-20
 */

import { buildViz } from '../core/builder';
import { registerDefineType } from '../core/define';

import {
  commonChartProperties,
  validateCommonChartProps,
  calculateChartDimensions,
  createChartVisualization
} from './base/Chart';

import { createLinearGaugeChart } from './linearGaugeChart';

// Make sure define type is registered
registerDefineType();

// Define the medicalTestChart component
export const medicalTestChartDefinition = {
  type: "define",
  name: "medicalTestChart",
  properties: {
    ...commonChartProperties,
    data: { required: false, default: [] },
    value: { required: true },
    range: {
      required: true,
      validate: (range: { low: number; high: number }) => {
        if (!range.low || !range.high) {
          throw new Error('Range must include low and high values');
        }
        if (range.low >= range.high) {
          throw new Error('Range low must be less than range high');
        }
      }
    },
    // Add min and max properties to define the full scale range
    min: { required: false, default: null },
    max: { required: false, default: null },
    colors: {
      default: {
        normal: '#4CAF50',   // Green
        caution: '#FFC107',  // Yellow/Amber
        text: '#333333',     // Dark gray
        background: '#FFFFFF' // White
      }
    },
    units: { default: '' },
    barHeight: { default: 30 },
    indicatorSize: { default: { width: 60, height: 30 } }
  },
  validate: function(props: any) {
    // Validate common chart properties
    validateCommonChartProps(props);

    // Validate value field
    if (typeof props.value !== 'number' && (!props.value.field && !props.value.value)) {
      throw new Error('Value must be a number or an object with field or value property');
    }

    // Validate range
    if (!props.range || typeof props.range.low !== 'number' || typeof props.range.high !== 'number') {
      throw new Error('Range must include numeric low and high values');
    }

    // Validate min and max if provided
    if (props.min !== null && typeof props.min !== 'number') {
      throw new Error('Min value must be a number');
    }
    if (props.max !== null && typeof props.max !== 'number') {
      throw new Error('Max value must be a number');
    }

    // Ensure min is less than range.low if provided
    if (props.min !== null && props.min >= props.range.low) {
      throw new Error('Min value must be less than range.low');
    }

    // Ensure max is greater than range.high if provided
    if (props.max !== null && props.max <= props.range.high) {
      throw new Error('Max value must be greater than range.high');
    }
  },
  implementation: function(props: any) {
    // Extract properties from props
    const {
      data, value, range, min, max, colors, margin, title, width, height,
      units, barHeight, indicatorSize
    } = props;

    // Determine the actual min and max values for the scale
    const scaleMin = min !== null ? min : range.low - (range.high - range.low) * 0.3;
    const scaleMax = max !== null ? max : range.high + (range.high - range.low) * 0.3;

    // Create regions for the linear gauge
    const regions = [
      { value: scaleMin, color: colors.caution, label: "Low" },
      { value: range.low, color: colors.normal, label: "Normal" },
      { value: range.high, color: colors.caution, label: "High" },
      { value: scaleMax, color: colors.caution }
    ];

    // Create a linear gauge chart with the appropriate configuration
    const linearGauge = createLinearGaugeChart({
      data,
      value,
      scale: { min: scaleMin, max: scaleMax },
      regions,
      colorMode: 'discrete',
      showCategoryLabels: false,
      showScaleLabels: true,
      showRegionBoundaries: true,
      margin,
      title,
      width,
      height,
      units,
      barHeight,
      indicatorSize,
      indicatorType: 'box'
    });

    // Create and return a renderable visualization
    return createChartVisualization('medicalTestChart', props, linearGauge);
  }
};

// Register the medicalTestChart component
buildViz(medicalTestChartDefinition);

/**
 * Create a medical test chart directly
 *
 * @param options Medical test chart configuration options
 * @returns A renderable medical test chart visualization
 */
export function createMedicalTestChart(options: {
  data?: any[],
  value: number | { field: string, value?: number },
  range: { low: number, high: number },
  min?: number,
  max?: number,
  colors?: {
    normal?: string,
    caution?: string,
    text?: string,
    background?: string
  },
  margin?: { top: number, right: number, bottom: number, left: number },
  title?: string | object,
  width?: number,
  height?: number,
  units?: string,
  barHeight?: number,
  indicatorSize?: { width: number, height: number }
}) {
  return buildViz({
    type: 'medicalTestChart',
    ...options
  });
}
