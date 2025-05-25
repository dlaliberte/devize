/**
 * Color Bar Legend Component
 *
 * Purpose: Displays a color-coded bar with regions and scale
 * Author: Devize Team
 * Creation Date: 2023-12-22
 */

import { buildViz } from '../core/builder';
import { registerDefineType } from '../core/define';

import '../primitives/group';
import '../primitives/rectangle';
import '../primitives/text';
import '../primitives/linearGradient';

// Make sure define type is registered
registerDefineType();

// Define the colorBarLegend component
export const colorBarLegendDefinition = {
  type: "define",
  name: "colorBarLegend",
  properties: {
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
    showRegionBoundaries: { default: true }, // New option to show region boundaries
    barHeight: { default: 30 },
    width: { default: 400 },
    height: { default: 80 }
  },
  validate: function(props: any) {
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
  },
  implementation: function(props: any) {
    // Extract properties from props
    const {
      scale, regions, categories, colorMode,
      showCategoryLabels, showScaleLabels, showRegionBoundaries,
      barHeight, width, height
    } = props;

    // Calculate positions
    const padding = width * 0.05;
    const barWidth = width - (padding * 2);
    const barY = height * 0.5 - barHeight / 2;

    // Map value to position
    const valueToPosition = (val: number) => {
      // Linear mapping from value range to position range
      const ratio = (val - scale.min) / (scale.max - scale.min);
      return padding + (ratio * barWidth);
    };

    // Create chart elements
    const elements = [];

    // Process regions or categories to create color segments
    let colorSegments = [];
    let boundaryValues = []; // Store boundary values for labels

    if (regions.length > 0) {
      // Add all region values to boundary values
      boundaryValues = regions.map((r: any) => r.value);

      // Convert regions to segments
      for (let i = 0; i < regions.length - 1; i++) {
        colorSegments.push({
          min: regions[i].value,
          max: regions[i+1].value,
          startColor: regions[i].color,
          endColor: colorMode === 'gradient' ? regions[i+1].color : regions[i].color,
          label: regions[i].label
        });
      }
    } else if (categories.length > 0) {
      // Add all category boundaries to boundary values
      categories.forEach((cat: any) => {
        boundaryValues.push(cat.min);
        boundaryValues.push(cat.max);
      });
      // Remove duplicates
      boundaryValues = [...new Set(boundaryValues)];

      // Use categories directly
      colorSegments = categories.map((cat: any) => ({
        min: cat.min,
        max: cat.max,
        startColor: cat.color,
        endColor: cat.color,
        label: cat.label
      }));
    }

    // Draw color segments
    colorSegments.forEach((segment: any, index: number) => {
      const startX = valueToPosition(segment.min);
      const endX = valueToPosition(segment.max);
      const segmentWidth = endX - startX;

      if (colorMode === 'gradient' && segment.startColor !== segment.endColor) {
        // Create a unique ID for this gradient
        const gradientId = `gradient-${index}-${segment.min}-${segment.max}`;

        // Add linearGradient component
        elements.push({
          type: 'linearGradient',
          id: gradientId,
          x1: '0%',
          y1: '0%',
          x2: '100%',
          y2: '0%',
          stops: [
            { offset: '0%', color: segment.startColor },
            { offset: '100%', color: segment.endColor }
          ]
        });

        // Add rectangle with gradient fill
        elements.push({
          type: 'rectangle',
          x: startX,
          y: barY,
          width: segmentWidth,
          height: barHeight,
          fill: `url(#${gradientId})`,
          stroke: '#000',
          strokeWidth: 1
        });
      } else {
        // Create a solid color rectangle
        elements.push({
          type: 'rectangle',
          x: startX,
          y: barY,
          width: segmentWidth,
          height: barHeight,
          fill: segment.startColor,
          stroke: '#000',
          strokeWidth: 1
        });
      }

      // Add category label if enabled
      if (showCategoryLabels && segment.label) {
        elements.push({
          type: 'text',
          x: startX + segmentWidth / 2,
          y: barY + barHeight / 2,
          text: segment.label,
          fontSize: 12,
          fontWeight: 'normal',
          fill: '#FFFFFF',
          textAnchor: 'middle',
          dominantBaseline: 'middle'
        });
      }
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

    // Draw region boundary labels if enabled
    if (showRegionBoundaries) {
      // Sort and filter boundary values (exclude min and max if already shown)
      const filteredBoundaries = boundaryValues
        .filter(val => showScaleLabels ? (val !== scale.min && val !== scale.max) : true)
        .sort((a, b) => a - b);

      // Add tick marks and labels for each boundary
      filteredBoundaries.forEach(value => {
        const x = valueToPosition(value);

        // Add tick mark
        elements.push({
          type: 'line',
          x1: x,
          y1: barY + barHeight,
          x2: x,
          y2: barY + barHeight + 5,
          stroke: '#333333',
          strokeWidth: 1
        });

        // Add label
        elements.push({
          type: 'text',
          x: x,
          y: barY + barHeight + 20,
          text: value.toString(),
          fontSize: 12,
          fontWeight: 'normal',
          fill: '#333333',
          textAnchor: 'middle'
        });
      });
    }

    // Combine all elements into a group specification
    const groupSpec = {
      type: 'group',
      children: elements
    };

    // Return the renderable group
    return buildViz(groupSpec);
  }
};

// Register the colorBarLegend component
buildViz(colorBarLegendDefinition);

/**
 * Create a color bar legend directly
 *
 * @param options Color bar legend configuration options
 * @returns A renderable color bar legend visualization
 */
export function createColorBarLegend(options: {
  scale: { min: number, max: number },
  regions?: { value: number, color: string, label?: string }[],
  categories?: { min: number, max: number, color: string, label?: string }[],
  colorMode?: 'discrete' | 'gradient',
  showCategoryLabels?: boolean,
  showScaleLabels?: boolean,
  showRegionBoundaries?: boolean,
  barHeight?: number,
  width?: number,
  height?: number
}) {
  return buildViz({
    type: 'colorBarLegend',
    ...options
  });
}

/**
 * Get the color for a specific value based on the color bar configuration
 *
 * @param value The value to get the color for
 * @param options The color bar configuration
 * @returns The color for the value
 */
export function getColorForValue(value: number, options: {
  scale: { min: number, max: number },
  regions?: { value: number, color: string }[],
  categories?: { min: number, max: number, color: string }[],
  colorMode?: 'discrete' | 'gradient'
}): string {
  const { scale, regions, categories, colorMode = 'discrete' } = options;

  // Clamp value to scale
  const clampedValue = Math.max(scale.min, Math.min(scale.max, value));

  // Process regions or categories to create color segments
  let colorSegments = [];

  if (regions && regions.length > 0) {
    // Convert regions to segments
    for (let i = 0; i < regions.length - 1; i++) {
      colorSegments.push({
        min: regions[i].value,
        max: regions[i+1].value,
        startColor: regions[i].color,
        endColor: colorMode === 'gradient' ? regions[i+1].color : regions[i].color
      });
    }
  } else if (categories && categories.length > 0) {
    // Use categories directly
    colorSegments = categories.map(cat => ({
      min: cat.min,
      max: cat.max,
      startColor: cat.color,
      endColor: cat.color
    }));
  }

  // Find the segment containing the value
  for (const segment of colorSegments) {
    if (clampedValue >= segment.min && clampedValue <= segment.max) {
      if (colorMode === 'gradient' && segment.startColor !== segment.endColor) {
        // Calculate position within segment for gradient color
        const segmentRatio = (clampedValue - segment.min) / (segment.max - segment.min);
        // Simple linear interpolation between colors
        // In a real implementation, you'd want to use proper color interpolation
        return segmentRatio < 0.5 ? segment.startColor : segment.endColor;
      } else {
        return segment.startColor;
      }
    }
  }

  // Default color if no segment matches (shouldn't happen with proper validation)
  return '#333333';
}
