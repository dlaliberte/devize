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
  createChartTitleElement,
  createChartVisualization
} from './base/Chart';

import '../primitives/group';
import '../primitives/rectangle';
import '../primitives/text';
import '../primitives/path';

// Make sure define type is registered
registerDefineType();

// Define the medicalTestChart component
export const medicalTestChartDefinition = {
  type: "define",
  name: "medicalTestChart",
  properties: {
    ...commonChartProperties,
    data: { required: false, data: [] },
    value: { required: false, default: [] },
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

    // Calculate dimensions
    const dimensions = calculateChartDimensions(width, height, margin);
    const chartWidth = dimensions.chartWidth;
    const chartHeight = dimensions.chartHeight;

    // Get the actual test value
    let testValue;
    if (typeof value === 'number') {
      testValue = value;
    } else if (value.value !== undefined) {
      testValue = value.value;
    } else if (value.field && data && data.length > 0) {
      testValue = data[0][value.field];
    } else {
      throw new Error('Could not determine test value');
    }

    // Calculate positions
    const padding = chartWidth * 0.05;
    const barWidth = chartWidth - (padding * 2);
    const barY = chartHeight * 0.5;

    // Determine the actual min and max values for the scale
    const scaleMin = min !== null ? min : range.low - (range.high - range.low) * 0.3;
    const scaleMax = max !== null ? max : range.high + (range.high - range.low) * 0.3;

    // Map value to position
    const valueToPosition = (val: number) => {
      // Handle edge cases
      if (val <= scaleMin) return padding;
      if (val >= scaleMax) return padding + barWidth;

      // Linear mapping from value range to position range
      const ratio = (val - scaleMin) / (scaleMax - scaleMin);
      return padding + (ratio * barWidth);
    };

    const lowX = valueToPosition(range.low);
    const highX = valueToPosition(range.high);
    const valueX = valueToPosition(testValue);

    // Determine result color based on where it falls
    const resultColor = (testValue < range.low || testValue > range.high)
      ? colors.caution
      : colors.normal;

    // Create chart elements
    const elements = [];

    // 1. Draw caution areas (yellow)
    elements.push({
      type: 'rectangle',
      x: padding,
      y: barY,
      width: Math.max(10, lowX - padding),
      height: barHeight,
      fill: colors.caution,
      stroke: '#000',
      strokeWidth: 1
    });

    elements.push({
      type: 'rectangle',
      x: highX,
      y: barY,
      width: Math.max(10, padding + barWidth - highX),
      height: barHeight,
      fill: colors.caution,
      stroke: '#000',
      strokeWidth: 1
    });

    // 2. Draw normal range (green)
    elements.push({
      type: 'rectangle',
      x: lowX,
      y: barY,
      width: highX - lowX,
      height: barHeight,
      fill: colors.normal,
      stroke: '#000',
      strokeWidth: 1
    });

    // 3. Draw range labels
    elements.push({
      type: 'text',
      x: lowX,
      y: barY + barHeight + 20,
      text: range.low.toString(),
      fontSize: 12,
      fontWeight: 'normal',
      fill: colors.text,
      textAnchor: 'middle'
    });

    elements.push({
      type: 'text',
      x: highX,
      y: barY + barHeight + 20,
      text: range.high.toString(),
      fontSize: 12,
      fontWeight: 'normal',
      fill: colors.text,
      textAnchor: 'middle'
    });

    // 4. Draw min and max labels if they're different from range values
    if (min !== null) {
      elements.push({
        type: 'text',
        x: padding,
        y: barY + barHeight + 20,
        text: min.toString(),
        fontSize: 12,
        fontWeight: 'normal',
        fill: colors.text,
        textAnchor: 'start'
      });
    }

    if (max !== null) {
      elements.push({
        type: 'text',
        x: padding + barWidth,
        y: barY + barHeight + 20,
        text: max.toString(),
        fontSize: 12,
        fontWeight: 'normal',
        fill: colors.text,
        textAnchor: 'end'
      });
    }

    // 5. Draw result indicator (box with triangle pointer)
    const boxWidth = indicatorSize.width;
    const boxHeight = indicatorSize.height;
    const triangleHeight = 10;

    // Box
    elements.push({
      type: 'rectangle',
      x: valueX - boxWidth/2,
      y: barY - boxHeight - triangleHeight,
      width: boxWidth,
      height: boxHeight,
      fill: resultColor,
      stroke: '#000',
      strokeWidth: 1,
      rx: 4,
      ry: 4
    });

    // Triangle pointer
    elements.push({
      type: 'path',
      d: `M ${valueX} ${barY} L ${valueX - 8} ${barY - triangleHeight} L ${valueX + 8} ${barY - triangleHeight} Z`,
      fill: resultColor,
      stroke: '#000',
      strokeWidth: 1
    });

    // Value text
    const valueText = units ? `${testValue} ${units}` : testValue.toString();
    elements.push({
      type: 'text',
      x: valueX,
      y: barY - boxHeight/2 - triangleHeight + 5,
      text: valueText,
      fontSize: 14,
      fontWeight: 'bold',
      fill: '#FFFFFF',
      textAnchor: 'middle'
    });

    // Create chart title
    const chartTitle = createChartTitleElement(title, dimensions);
    if (chartTitle) {
      elements.push(chartTitle);
    }

    // Combine all elements into a group specification
    const groupSpec = {
      type: 'group',
      transform: `translate(${margin.left}, ${margin.top})`,
      children: elements
    };

    // Process the group specification to create a renderable visualization
    const renderableGroup = buildViz(groupSpec);

    // Create and return a renderable visualization
    return createChartVisualization('medicalTestChart', props, renderableGroup);
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
