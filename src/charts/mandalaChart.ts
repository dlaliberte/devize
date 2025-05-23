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
    numPositions: { default: 8 },
    recursionLevels: { default: 1 },
    innerPadding: { default: 0.1 }, // Padding inside small circles (as a percentage of radius)
    ringGap: { default: 0.05 }      // Gap between rings as a fraction of the chart radius
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
      numPositions, recursionLevels, innerPadding, ringGap
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
    function createMandala(level, cx, cy, containerRadius) {
      const elements = [];

      // Calculate the central circle radius for this mandala
      const scaledCentralRadius = level === recursionLevels
        ? baseCentralRadius
        : containerRadius * (1 - innerPadding) / 3; // Make central circle 1/3 of container

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
        // For circles to touch each other at their orbit radius:
        // r = orbit_radius * sin(wedgeAngle/2)

        // First, we need to determine the orbit radius and outer ring radius
        // such that the small circles touch both the inner and outer ring

        // Let's call:
        // R1 = inner ring radius
        // R2 = orbit radius (where circle centers are placed)
        // R3 = outer ring radius
        // r = small circle radius

        // For circles to touch each other: r = R2 * sin(wedgeAngle/2)
        // For circles to touch inner ring: R2 - r = R1
        // For circles to touch outer ring: R2 + r = R3

        // From these equations:
        // R2 - R2 * sin(wedgeAngle/2) = R1
        // R2 = R1 / (1 - sin(wedgeAngle/2))

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
          // Calculate angle for this position (in radians)
          // We're going clockwise starting from the top (3π/2)
          const angle = (wedgeAngle * i) + (3 * Math.PI / 2);

          // Calculate position
          const x = cx + orbitRadius * Math.cos(angle);
          const y = cy + orbitRadius * Math.sin(angle);

          // Get color for this circle
          const color = smallCircleColors[(i + (ring - 1) * numPositions) % smallCircleColors.length];

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

          // Add a nested mandala inside this small circle
          // The nested mandala should be level (ring - 1)
          if (ring > 0) {
            const nestedElements = createMandala(ring - 1, x, y, smallCircleRadius);
            elements.push(...nestedElements);
          }
        }

        // Update the inner ring radius for the next iteration
        // Add a small gap between rings
        innerRingRadius = outerRingRadius * (1 + ringGap);
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
  ringGap?: number
}) {
  return buildViz({
    type: 'mandalaChart',
    ...options
  });
}
