/**
 * Mandala Chart Component
 *
 * Purpose: Creates a recursive mandala chart with a central circle and surrounding smaller circles
 * Author: Devize Team
 * Creation Date: 2023-12-20
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

import '../primitives/group';
import '../primitives/circle';

// Make sure define type is registered
registerDefineType();

// Register required components
registerChartComponents();

// Define the mandalaChart component
export const mandalaChartDefinition = {
  type: "define",
  name: "mandalaChart",
  properties: {
    ...commonChartProperties,
    data: { default: [] },
    centralRadius: { default: '30%' },
    centralColor: { default: '#f0f0f0' },
    smallCircleColors: { default: ['#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd', '#8c564b', '#e377c2', '#7f7f7f', '#bcbd22'] },
    containerCircleColor: { default: 'rgba(0,0,0,0.05)' },
    centralStroke: { default: '#333' },
    smallCircleStroke: { default: '#333' },
    containerCircleStroke: { default: '#999' },
    strokeWidth: { default: 1 },
    containerStrokeWidth: { default: 1 },
    numPositions: { default: 10 },
    recursionLevels: { default: 1 },
    innerPadding: { default: 0.1 }, // Padding inside small circles (as a percentage of radius)
    ringGap: { default: 0.05 },     // Gap between rings as a fraction of the chart radius
    hideZeroPosition: { default: true } // Whether to hide the 0th position
  },
  validate: function(props: any) {
    // Validate common chart properties
    validateCommonChartProps(props);

    if (props.numPositions < 3) {
      throw new Error('Number of positions must be at least 3');
    }

    if (props.recursionLevels < 0) {
      throw new Error('Recursion levels must be a non-negative integer');
    }

    if (props.innerPadding < 0 || props.innerPadding >= 1) {
      throw new Error('Inner padding must be between 0 and 1 (exclusive)');
    }

    if (props.ringGap < 0 || props.ringGap >= 0.5) {
      throw new Error('Ring gap must be between 0 and 0.5 (exclusive)');
    }
  },
  implementation: function(props: any) {
    // Extract properties from props
    const {
      margin, title, width, height,
      centralRadius,
      centralColor, smallCircleColors, containerCircleColor,
      centralStroke, smallCircleStroke, containerCircleStroke,
      strokeWidth, containerStrokeWidth,
      numPositions, recursionLevels, innerPadding, ringGap,
      hideZeroPosition
    } = props;

    // Calculate dimensions
    const dimensions = calculateChartDimensions(width, height, margin);

    // Calculate base sizes
    const minDimension = Math.min(dimensions.chartWidth, dimensions.chartHeight);
    const chartRadius = minDimension / 2;

    // Calculate the central circle radius
    const baseCentralRadius = typeof centralRadius === 'string' && centralRadius.endsWith('%')
      ? (parseFloat(centralRadius) / 100) * chartRadius
      : centralRadius;

    // Function to create a mandala at a specific level
    function createMandala(level, cx, cy, containerRadius, rotationOffset = 0) {
      const elements = [];

      // For nested levels, we calculate the central radius based on the container radius
      // and the same proportions as the top level
      const topLevelCentralRatio = 2 * baseCentralRadius / chartRadius;
      const scaledCentralRadius = containerRadius * topLevelCentralRatio;

      // Add the central circle
      elements.push({
        type: 'circle',
        cx: cx,
        cy: cy,
        r: scaledCentralRadius,
        fill: centralColor,
        stroke: centralStroke,
        strokeWidth: strokeWidth
      });

      // If this is level 0, we're done - just the center circle
      if (level === 0) {
        return elements;
      }

      // For levels > 0, we need to add rings of small circles
      // Each level adds one more ring

      // Start with the central radius as the inner boundary of the first ring
      let innerRingRadius = scaledCentralRadius;

      for (let ring = 1; ring <= level; ring++) {
        // Calculate the angular width of each wedge/slice
        const wedgeAngle = (2 * Math.PI) / numPositions;

        // Calculate the radius of the small circles in this ring
        const sinHalfWedge = Math.sin(wedgeAngle / 2);
        const orbitRadius = innerRingRadius / (1 - sinHalfWedge);
        const smallCircleRadius = orbitRadius * sinHalfWedge;
        const outerRingRadius = orbitRadius + smallCircleRadius;

        // Add the container circle for this ring
        elements.push({
          type: 'circle',
          cx: cx,
          cy: cy,
          r: outerRingRadius,
          fill: containerCircleColor,
          stroke: containerCircleStroke,
          strokeWidth: containerStrokeWidth
        });

        // Create the small circles for this ring
        for (let i = 0; i < numPositions; i++) {
          // Skip the 0th position if hideZeroPosition is true
          if (hideZeroPosition && i === 0) {
            continue;
          }

          // Calculate angle for this position (in radians)
          // We're going clockwise starting from the bottom (π/2)
          // Apply the rotation offset to align with parent
          const angle = (wedgeAngle * i) + (Math.PI / 2) + rotationOffset;

          // Calculate position
          const x = cx + orbitRadius * Math.cos(angle);
          const y = cy + orbitRadius * Math.sin(angle);

          // Get color for this circle
          const color = smallCircleColors[(i) % smallCircleColors.length];

          // Create the small circle
          elements.push({
            type: 'circle',
            cx: x,
            cy: y,
            r: smallCircleRadius,
            fill: color,
            stroke: smallCircleStroke,
            strokeWidth: strokeWidth
          });

          // Add a nested mandala inside this small circle if we're not at the lowest level
          if (level > 1) {
            // Calculate the rotation offset for the nested mandala
            // This makes the 0th position of the nested mandala align with the position of this circle
            const nestedRotationOffset = angle - (Math.PI / 2);

            // Create a nested mandala with level-1 recursion
            // The container radius is the small circle radius
            // This ensures the nested mandala's outer container circle aligns perfectly with the small circle
            const nestedElements = createMandala(
              level - 1,
              x,
              y,
              smallCircleRadius,
              nestedRotationOffset
            );
            elements.push(...nestedElements);
          }
        }

        // Update the inner ring radius for the next iteration
        // Add a small gap between rings
        innerRingRadius = outerRingRadius; // * (1 + ringGap); not needed, and not enough
      }

      return elements;
    }

    // Create the top-level mandala
    const mandalaElements = createMandala(
      recursionLevels,
      dimensions.chartWidth / 2,
      dimensions.chartHeight / 2,
      chartRadius
    );

    // Create chart title
    const chartTitle = createChartTitleElement(title, dimensions);

    // Combine all elements into a group specification
    const groupSpec = {
      type: 'group',
      transform: `translate(${margin.left}, ${margin.top})`,
      children: [
        // Mandala elements
        ...mandalaElements,

        // Title
        chartTitle
      ].filter(Boolean) // Remove null items
    };

    // Process the group specification to create a renderable visualization
    const renderableGroup = buildViz(groupSpec);

    // Create and return a renderable visualization
    return createChartVisualization('mandalaChart', props, renderableGroup);
  }
};

// Register the mandalaChart component
buildViz(mandalaChartDefinition);

/**
 * Create a mandala chart directly
 *
 * @param options Mandala chart configuration options
 * @returns A renderable mandala chart visualization
 */
export function createMandalaChart(options: {
  margin?: { top: number, right: number, bottom: number, left: number },
  title?: string | object,
  width?: number,
  height?: number,
  centralRadius?: number | string,
  centralColor?: string,
  smallCircleColors?: string[],
  containerCircleColor?: string,
  centralStroke?: string,
  smallCircleStroke?: string,
  containerCircleStroke?: string,
  strokeWidth?: number,
  containerStrokeWidth?: number,
  numPositions?: number,
  recursionLevels?: number,
  innerPadding?: number,
  ringGap?: number,
  hideZeroPosition?: boolean
}) {
  return buildViz({
    type: 'mandalaChart',
    ...options
  });
}
