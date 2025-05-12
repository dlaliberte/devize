/**
 * Pie Chart Component
 *
 * Purpose: Provides a pie chart visualization for showing proportional data
 * Author: Devize Team
 * Creation Date: 2023-12-05
 */

import { buildViz } from '../core/builder';
import { registerDefineType } from '../core/define';
import { createRenderableVisualization } from '../core/componentUtils';
import {
  commonChartProperties,
  validateCommonChartProps,
  calculateChartDimensions,
  createChartTitleElement,
  createChartVisualization,
  registerChartComponents
} from './base/Chart';
import {
  createAxisChartColorMapping,
  createAxisChartLegend
} from './base/AxisChart';
import {
  processPolarChartData,
  createPolarChartCoordinateSystem,
  generateSlicePath,
  calculateSliceLabelPosition
} from './base/PolarChart';

import '../primitives/group';
import '../primitives/path';
import '../components/legend';

// Make sure define type is registered
registerDefineType();

// Register required components
registerChartComponents();
import '../components/coordinates/polarCoordinateSystem';

// Define the pieChart component
export const pieChartDefinition = {
  type: "define",
  name: "pieChart",
  properties: {
    ...commonChartProperties,
    value: { required: true },
    category: { required: true },
    color: { default: 'auto' },
    innerRadius: { default: 0 },
    outerRadius: { default: '90%' },
    cornerRadius: { default: 0 },
    padAngle: { default: 0 },
    startAngle: { default: 0 },
    endAngle: { default: Math.PI * 2 },
    sort: { default: true },
    // Add the new property for grouping small slices
    groupSmallSlices: { default: false },
    smallSliceThreshold: { default: 0.05 }, // 5% threshold
    smallSliceLabel: { default: 'Others' },
    labels: {
      default: {
        enabled: true,
        type: 'percent',
        position: 'inside',
        fontSize: 12,
        fontWeight: 'normal',
        fontFamily: 'Arial',
        color: '#ffffff',
        minSliceAngle: 15
      }
    }
  },
  validate: function(props: any) {
    // Validate common chart properties
    validateCommonChartProps(props);

    // Validate value and category fields
    if (!props.value || !props.value.field) {
      throw new Error('Value field must be specified');
    }

    if (!props.category || !props.category.field) {
      throw new Error('Category field must be specified');
    }

    // Validate angles
    if (props.endAngle - props.startAngle <= 0) {
      throw new Error('End angle must be greater than start angle');
    }

    // Validate inner and outer radius
    const parseRadius = (radius: any) => {
      if (typeof radius === 'string' && radius.endsWith('%')) {
        const percentage = parseFloat(radius) / 100;
        if (isNaN(percentage) || percentage < 0 || percentage > 1) {
          return false;
        }
        return true;
      }
      return typeof radius === 'number' && radius >= 0;
    };

    if (!parseRadius(props.innerRadius)) {
      throw new Error('Inner radius must be a non-negative number or percentage string');
    }

    if (!parseRadius(props.outerRadius)) {
      throw new Error('Outer radius must be a non-negative number or percentage string');
    }
  },
  implementation: function(props: any) {
    // Extract properties from props
    const {
      data, value, category, color, margin, tooltip, title, width, height,
      innerRadius, outerRadius, cornerRadius, padAngle, startAngle, endAngle,
      sort, labels, legend: legendOptions,
      // Extract the new properties
      groupSmallSlices, smallSliceThreshold, smallSliceLabel
    } = props;

    // Handle empty data case
    if (!data || data.length === 0) {
      // Return an empty group
      return createChartVisualization('pieChart', props, buildViz({
        type: 'group',
        children: []
      }));
    }

    // Calculate dimensions
    const dimensions = calculateChartDimensions(width, height, margin);

    // Process data for the pie chart
    let processedData = processPolarChartData(data, {
      valueField: value.field,
      categoryField: category.field,
      sort: sort
    });

    // Group small slices if enabled
    if (groupSmallSlices && smallSliceThreshold > 0) {
      // Find slices below the threshold
      const smallSlices = processedData.filter(d => d._percentage < smallSliceThreshold);
      const largeSlices = processedData.filter(d => d._percentage >= smallSliceThreshold);

      // If we have small slices, group them
      if (smallSlices.length > 0) {
        // Calculate the total value of small slices
        const smallSlicesTotal = smallSlices.reduce((sum, d) => sum + d[value.field], 0);
        const smallSlicesPercentage = smallSlices.reduce((sum, d) => sum + d._percentage, 0);

        // Create an "Others" slice
        const othersSlice = {
          [category.field]: smallSliceLabel,
          [value.field]: smallSlicesTotal,
          _percentage: smallSlicesPercentage
        };

        // Replace the processed data with large slices plus the "Others" slice
        processedData = [...largeSlices, othersSlice];
      }
    }

    // Create a polar coordinate system
    const coordSystem = createPolarChartCoordinateSystem(dimensions, {
      innerRadius,
      outerRadius,
      startAngle,
      endAngle
    });

    // Determine color mapping
    const colorField = typeof color === 'object' && color.field ? color.field : category.field;
    const colorMapping = createAxisChartColorMapping(processedData, colorField);

    // Create legend
    const legend = createAxisChartLegend(colorMapping, legendOptions, dimensions);

    // Generate slices
    let currentAngle = startAngle;
    const slices = processedData.map((d: any, i: number) => {
      // Calculate angles for this slice
      const sliceAngle = d._percentage * (endAngle - startAngle);
      const sliceStartAngle = currentAngle;
      const sliceEndAngle = currentAngle + sliceAngle - (padAngle || 0);

      // Update current angle for next slice
      currentAngle = sliceEndAngle + (padAngle || 0);

      // Determine slice color
      let sliceColor;
      if (typeof color === 'string' && color !== 'auto') {
        // Direct color string provided
        sliceColor = color;
      } else if (colorMapping) {
        const categoryValue = d[category.field];
        const colorItem = colorMapping.find((item: any) => item.value === categoryValue);
        sliceColor = colorItem ? colorItem.color : `hsl(${(i * 137) % 360}, 70%, 50%)`;
      } else {
        // Default color based on index
        sliceColor = `hsl(${(i * 137) % 360}, 70%, 50%)`;
      }

      // Generate slice path
      const slicePath = generateSlicePath(
        coordSystem,
        sliceStartAngle,
        sliceEndAngle,
        coordSystem.radiusScale.scale(0),
        coordSystem.radiusScale.scale(1)
      );

      // Create slice element
      const slice = {
        type: 'path',
        d: slicePath,
        fill: sliceColor,
        stroke: '#fff',
        strokeWidth: 1,
        data: d,
        tooltip: tooltip
      };

      // Create label if enabled and slice is large enough
      let label = null;
      if (labels && labels.enabled) {
        // Calculate angle in degrees for comparison with minSliceAngle
        const sliceAngleDegrees = (sliceEndAngle - sliceStartAngle) * (180 / Math.PI);

        if (sliceAngleDegrees >= (labels.minSliceAngle || 0)) {
          // Determine label position
          const labelPosition = labels.position || 'inside';
          const labelRadius = labelPosition === 'inside'
            ? coordSystem.radiusScale.scale(0.5) // Middle of the slice
            : coordSystem.radiusScale.scale(1.1); // Just outside the slice

          const labelPos = calculateSliceLabelPosition(
            coordSystem,
            sliceStartAngle,
            sliceEndAngle,
            labelRadius
          );

          // Determine label text
          let labelText;
          const labelType = labels.type || 'percent';
          if (labelType === 'percent') {
            labelText = `${Math.round(d._percentage * 100)}%`;
          } else if (labelType === 'value') {
            labelText = d[value.field].toString();
          } else if (labelType === 'category') {
            labelText = d[category.field].toString();
          } else if (labelType === 'all') {
            labelText = `${d[category.field]}: ${d[value.field]} (${Math.round(d._percentage * 100)}%)`;
          }

          // Create label element
          label = {
            type: 'text',
            x: labelPos.x,
            y: labelPos.y,
            text: labelText,
            fontSize: labels.fontSize || 12,
            fontWeight: labels.fontWeight || 'normal',
            fontFamily: labels.fontFamily || 'Arial',
            fill: labels.color || (labelPosition === 'inside' ? '#ffffff' : '#333333'),
            textAnchor: 'middle',
            dominantBaseline: 'middle'
          };
        }
      }

      return { slice, label };
    });

    // Create chart title
    const chartTitle = createChartTitleElement(title, dimensions);

    // Combine all elements into a group specification
    const groupSpec = {
      type: 'group',
      transform: `translate(${margin.left}, ${margin.top})`,
      children: [
        // Slices
        ...slices.map(s => s.slice),

        // Labels
        ...slices.filter(s => s.label).map(s => s.label),

        // Title
        chartTitle,

        // Legend
        legend
      ].filter(Boolean) // Remove null items
    };

    // Process the group specification to create a renderable visualization
    const renderableGroup = buildViz(groupSpec);

    // Create and return a renderable visualization
    return createChartVisualization('pieChart', props, renderableGroup);
  }
};

// Register the pieChart component
buildViz(pieChartDefinition);

/**
 * Create a pie chart directly
 *
 * @param options Pie chart configuration options
 * @returns A renderable pie chart visualization
 */
export function createPieChart(options: {
  data: any[],
  value: { field: string, format?: (value: any) => string },
  category: { field: string, title?: string },
  color?: string | { field: string },
  margin?: { top: number, right: number, bottom: number, left: number },
  tooltip?: boolean | object,
  title?: string | object,
  width?: number,
  height?: number,
  innerRadius?: number | string,
  outerRadius?: number | string,
  cornerRadius?: number,
  padAngle?: number,
  startAngle?: number,
  endAngle?: number,
  sort?: boolean | ((a: any, b: any) => number),
  labels?: {
    enabled?: boolean,
    type?: 'percent' | 'value' | 'category' | 'all',
    position?: 'inside' | 'outside',
    fontSize?: number,
    fontWeight?: string,
    fontFamily?: string,
    color?: string,
    minSliceAngle?: number
  },
  legend?: {
    enabled?: boolean,
    position?: string | { x: number, y: number },
    orientation?: 'vertical' | 'horizontal'
  }
}) {
  return buildViz({
    type: 'pieChart',
    ...options
  });
}
