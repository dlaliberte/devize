/**
 * Linear Gauge Chart Component
 *
 * Purpose: Visualizes a single value on a linear scale with color-coded regions
 * Author: Devize Team
 * Creation Date: 2023-12-22
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

import { createColorBarLegend } from '../components/colorBarLegend';

import '../primitives/group';
import '../primitives/rectangle';
import '../primitives/text';
import '../primitives/path';
import '../primitives/circle';
import '../primitives/line';
import '../components/colorBarLegend';

import { createRenderableVisualizationEnhanced } from '../core/componentUtils';

// Make sure define type is registered
registerDefineType();

// Define the linearGaugeChart component
export const linearGaugeChartDefinition = {
  type: "define",
  name: "linearGaugeChart",
  properties: {
    ...commonChartProperties,
    data: { required: false, default: [] },
    value: { required: true },
    scale: {
      required: true,
      validate: (scale: { min: number; max: number }) => {
        if (typeof scale.min !== 'number' || typeof scale.max !== 'number') {
          throw new Error('Scale must include numeric min and max values');
        }
        if (scale.min >= scale.max) {
          throw new Error('Scale min must be less than scale max');
        }
      }
    },
    regions: { required: false, default: [] },
    categories: { required: false, default: [] },
    colorMode: { default: 'discrete' }, // 'discrete' or 'gradient'
    showCategoryLabels: { default: false },
    showScaleLabels: { default: true },
    showRegionBoundaries: { default: false },
    units: { default: '' },
    barHeight: { default: 30 },
    indicatorSize: { default: { width: 60, height: 30 } },
    indicatorType: { default: 'box' } // 'box', 'needle', 'arrow', or 'dot'
  },
  validate: function(props: any) {
    // Validate common chart properties
    validateCommonChartProps(props);

    // Validate value field
    if (typeof props.value !== 'number' && (!props.value.field && !props.value.value)) {
      throw new Error('Value must be a number or an object with field or value property');
    }

    // Validate scale
    if (!props.scale || typeof props.scale.min !== 'number' || typeof props.scale.max !== 'number') {
      throw new Error('Scale must include numeric min and max values');
    }

    // Validate regions or categories
    if (props.regions.length === 0 && props.categories.length === 0) {
      throw new Error('Either regions or categories must be provided');
    }

    // Validate regions if provided
    if (props.regions.length > 0) {
      // Check that each region has a value and color
      props.regions.forEach((region: any, index: number) => {
        if (typeof region.value !== 'number') {
          throw new Error(`Region at index ${index} must have a numeric value`);
        }
        if (!region.color) {
          throw new Error(`Region at index ${index} must have a color`);
        }
      });

      // Check that regions are in ascending order
      for (let i = 1; i < props.regions.length; i++) {
        if (props.regions[i].value <= props.regions[i-1].value) {
          throw new Error('Region values must be in ascending order');
        }
      }

      // Check that first region value matches scale.min and last region value matches scale.max
      if (props.regions[0].value !== props.scale.min) {
        throw new Error('First region value must match scale.min');
      }
      if (props.regions[props.regions.length - 1].value !== props.scale.max) {
        throw new Error('Last region value must match scale.max');
      }
    }

    // Validate categories if provided
    if (props.categories.length > 0) {
      // Check that each category has min, max, and color
      props.categories.forEach((category: any, index: number) => {
        if (typeof category.min !== 'number' || typeof category.max !== 'number') {
          throw new Error(`Category at index ${index} must have numeric min and max values`);
        }
        if (!category.color) {
          throw new Error(`Category at index ${index} must have a color`);
        }
        if (category.min >= category.max) {
          throw new Error(`Category at index ${index} must have min less than max`);
        }
      });

      // Check that categories cover the entire scale without gaps or overlaps
      const sortedCategories = [...props.categories].sort((a: any, b: any) => a.min - b.min);

      if (sortedCategories[0].min !== props.scale.min) {
        throw new Error('Categories must start at scale.min');
      }

      if (sortedCategories[sortedCategories.length - 1].max !== props.scale.max) {
        throw new Error('Categories must end at scale.max');
      }

      for (let i = 1; i < sortedCategories.length; i++) {
        if (sortedCategories[i].min !== sortedCategories[i-1].max) {
          throw new Error('Categories must not have gaps or overlaps');
        }
      }
    }

    // Validate colorMode
    if (props.colorMode !== 'discrete' && props.colorMode !== 'gradient') {
      throw new Error('colorMode must be either "discrete" or "gradient"');
    }

    // Validate indicatorType
    const validIndicatorTypes = ['box', 'needle', 'arrow', 'dot'];
    if (!validIndicatorTypes.includes(props.indicatorType)) {
      throw new Error(`indicatorType must be one of: ${validIndicatorTypes.join(', ')}`);
    }
  },
  implementation: function(props: any) {
    // Extract properties from props
    const {
      data, value, scale, regions, categories, colorMode,
      showCategoryLabels, showScaleLabels, showRegionBoundaries,
      margin, title, width, height,
      units, barHeight, indicatorSize, indicatorType
    } = props;

    // Calculate dimensions
    const dimensions = calculateChartDimensions(width, height, margin);
    const chartWidth = dimensions.chartWidth;
    const chartHeight = dimensions.chartHeight;

    // Get the actual value
    let actualValue;
    if (typeof value === 'number') {
      actualValue = value;
    } else if (value.value !== undefined) {
      actualValue = value.value;
    } else if (value.field && data && data.length > 0) {
      actualValue = data[0][value.field];
    } else {
      throw new Error('Could not determine value');
    }

    // Clamp value to scale
    const clampedValue = Math.max(scale.min, Math.min(scale.max, actualValue));

    // Calculate positions
    const padding = chartWidth * 0.05;
    const barWidth = chartWidth - (padding * 2);
    const barY = chartHeight * 0.5;

    // Map value to position
    const valueToPosition = (val: number) => {
      // Linear mapping from value range to position range
      const ratio = (val - scale.min) / (scale.max - scale.min);
      return padding + (ratio * barWidth);
    };

    const valueX = valueToPosition(clampedValue);

    // Create chart elements
    const elements = [];

    // Create color bar legend
    const colorBar = createColorBarLegend({
      scale,
      regions,
      categories,
      colorMode,
      showCategoryLabels,
      showScaleLabels: false, // We'll handle scale labels separately
      showRegionBoundaries,
      barHeight,
      width: chartWidth,
      height: barHeight
    });

    // Add the color bar to elements
    elements.push({
      type: 'group',
      transform: `translate(0, ${barY})`,
      children: [colorBar]
    });

    // Draw scale labels if enabled
    if (showScaleLabels) {
      // Min value
      elements.push({
        type: 'text',
        x: padding,
        y: barY + barHeight + 20,
        text: scale.min.toString(),
        fontSize: 12,
        fontWeight: 'normal',
        fill: '#333333',
        textAnchor: 'start'
      });

      // Max value
      elements.push({
        type: 'text',
        x: padding + barWidth,
        y: barY + barHeight + 20,
        text: scale.max.toString(),
        fontSize: 12,
        fontWeight: 'normal',
        fill: '#333333',
        textAnchor: 'end'
      });

      // Middle value
      const middleValue = (scale.min + scale.max) / 2;
      elements.push({
        type: 'text',
        x: padding + barWidth / 2,
        y: barY + barHeight + 20,
        text: middleValue.toString(),
        fontSize: 12,
        fontWeight: 'normal',
        fill: '#333333',
        textAnchor: 'middle'
      });
    }

    // Determine indicator color based on where the value falls
    let indicatorColor = '#333333'; // Default color

    // Use the colorBarLegend's getColorForValue function to determine the color
    if (regions.length > 0) {
      for (let i = 0; i < regions.length - 1; i++) {
        if (clampedValue >= regions[i].value && clampedValue <= regions[i+1].value) {
          if (colorMode === 'gradient') {
            // Simple approximation for gradient color
            const ratio = (clampedValue - regions[i].value) / (regions[i+1].value - regions[i].value);
            indicatorColor = ratio < 0.5 ? regions[i].color : regions[i+1].color;
          } else {
            indicatorColor = regions[i].color;
          }
          break;
        }
      }
    } else if (categories.length > 0) {
      for (const category of categories) {
        if (clampedValue >= category.min && clampedValue <= category.max) {
          indicatorColor = category.color;
          break;
        }
      }
    }

    // Draw value indicator based on indicatorType
    const valueText = units ? `${clampedValue} ${units}` : clampedValue.toString();

    switch (indicatorType) {
      case 'box':
        // Box with triangle pointer
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
          fill: indicatorColor,
          stroke: '#000',
          strokeWidth: 1,
          rx: 4,
          ry: 4
        });

        // Triangle pointer
        elements.push({
          type: 'path',
          d: `M ${valueX} ${barY} L ${valueX - 8} ${barY - triangleHeight} L ${valueX + 8} ${barY - triangleHeight} Z`,
          fill: indicatorColor,
          stroke: '#000',
          strokeWidth: 1
        });

        // Value text
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
        break;

      case 'needle':
        // Needle indicator
        const needleHeight = barHeight * 2;

        // Needle line
        elements.push({
          type: 'line',
          x1: valueX,
          y1: barY - needleHeight,
          x2: valueX,
          y2: barY + barHeight,
          stroke: indicatorColor,
          strokeWidth: 2
        });

        // Needle triangle top
        elements.push({
          type: 'path',
          d: `M ${valueX} ${barY - needleHeight - 5} L ${valueX - 5} ${barY - needleHeight} L ${valueX + 5} ${barY - needleHeight} Z`,
          fill: indicatorColor,
          stroke: '#000',
          strokeWidth: 1
        });

        // Value text
        elements.push({
          type: 'text',
          x: valueX,
          y: barY - needleHeight - 15,
          text: valueText,
          fontSize: 14,
          fontWeight: 'bold',
          fill: '#333333',
          textAnchor: 'middle'
        });
        break;

      case 'arrow':
        // Arrow indicator
        const arrowSize = 15;

        // Arrow
        elements.push({
          type: 'path',
          d: `M ${valueX} ${barY - arrowSize} L ${valueX - arrowSize} ${barY} L ${valueX + arrowSize} ${barY} Z`,
          fill: indicatorColor,
          stroke: '#000',
          strokeWidth: 1
        });

        // Value text
        elements.push({
          type: 'text',
          x: valueX,
          y: barY - arrowSize - 10,
          text: valueText,
          fontSize: 14,
          fontWeight: 'bold',
          fill: '#333333',
          textAnchor: 'middle'
        });
        break;

      case 'dot':
        // Dot indicator
        const dotRadius = 8;

        // Dot
        elements.push({
          type: 'circle',
          cx: valueX,
          cy: barY + barHeight / 2,
          r: dotRadius,
          fill: indicatorColor,
          stroke: '#000',
          strokeWidth: 1
        });

        // Value text
        elements.push({
          type: 'text',
          x: valueX,
          y: barY - 10,
          text: valueText,
          fontSize: 14,
          fontWeight: 'bold',
          fill: '#333333',
          textAnchor: 'middle'
        });
        break;
    }

    // Create chart title
    const chartTitle = createChartTitleElement(title, dimensions);

    // Combine all elements into a group specification
    const groupSpec = {
      type: 'group',
      transform: `translate(${margin.left}, ${margin.top})`,
      children: [
        // Chart elements
        ...elements,

        // Title
        chartTitle
      ].filter(Boolean) // Remove null items
    };

    // Process the group specification to create a renderable visualization
    const renderableGroup = buildViz(groupSpec);

    // Create and return a renderable visualization
    return createChartVisualization('linearGaugeChart', props, renderableGroup);
  }
};

// Register the linearGaugeChart component
buildViz(linearGaugeChartDefinition);

/**
 * Create a linear gauge chart directly
 *
 * @param options Linear gauge chart configuration options
 * @returns A renderable linear gauge chart visualization
 */
export function createLinearGaugeChart(options: {
  data?: any[],
  value: number | { field: string, value?: number },
  scale: { min: number, max: number },
  regions?: { value: number, color: string, label?: string }[],
  categories?: { min: number, max: number, color: string, label?: string }[],
  colorMode?: 'discrete' | 'gradient',
  showCategoryLabels?: boolean,
  showScaleLabels?: boolean,
  margin?: { top: number, right: number, bottom: number, left: number },
  title?: string | object,
  width?: number,
  height?: number,
  units?: string,
  barHeight?: number,
  indicatorSize?: { width: number, height: number },
  indicatorType?: 'box' | 'needle' | 'arrow' | 'dot'
}) {
  return buildViz({
    type: 'linearGaugeChart',
    ...options
  });
}
