/**
 * Mandala Chart Component
 *
 * Purpose: Creates a recursive mandala chart with a central circle and surrounding smaller circles
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
    data: { required: false, default: [] },
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

    // Recursive function to create a mandala of a specific level
    function createMandala(level, cx, cy, containerRadius, rotationOffset = 0) {
      // Base case: level 0 just draws the central circle
      if (level === 0) {
        return {
          containerCircle: {
            type: 'circle',
            cx: cx,
            cy: cy,
            r: containerRadius / 2, // * (baseCentralRadius / chartRadius), // Scale proportionally
            fill: centralColor,
            stroke: centralStroke,
            strokeWidth: strokeWidth
          },
          rings: [{
            type: 'circle',
            cx: cx,
            cy: cy,
            r: containerRadius / 2, // * (baseCentralRadius / chartRadius), // Scale proportionally
            fill: centralColor,
            stroke: centralStroke,
            strokeWidth: strokeWidth
          }],
          nestedMandalas: []
        };
      } else {

        const outerRingRadius = containerRadius;

        // Compute the inner ring radius so the small circles fit tangentially.
        const wedgeAngle = (2 * Math.PI) / numPositions;
        const sinHalfWedge = Math.sin(wedgeAngle / 2);
        const orbitRadius = outerRingRadius / (1 + sinHalfWedge);
        const smallCircleRadius = orbitRadius * sinHalfWedge;
        const innerRingRadius = orbitRadius - smallCircleRadius;

        // Create the ring for this level
        const ring = {
          containerCircle: {
            type: 'circle',
            cx: cx,
            cy: cy,
            r: outerRingRadius,
            fill: containerCircleColor,
            stroke: containerCircleStroke,
            strokeWidth: containerStrokeWidth
          },
          smallCircles: []
        };

        // Create the small circles for this ring
        const nestedMandalas = [];

        for (let i = 0; i < numPositions; i++) {
          // Skip the 0th position if hideZeroPosition is true
          if (hideZeroPosition && i === 0) {
            continue;
          }

          // Calculate angle for this position (in radians)
          // We're going clockwise starting from the bottom (π/2)
          // Apply the rotation offset
          const angle = (wedgeAngle * i) + (Math.PI / 2) + rotationOffset;

          // Calculate position
          const x = cx + orbitRadius * Math.cos(angle);
          const y = cy + orbitRadius * Math.sin(angle);

          // Get color for this circle
          const color = smallCircleColors[i % smallCircleColors.length];

          // Create the small circle
          ring.smallCircles.push({
            type: 'circle',
            cx: x,
            cy: y,
            r: smallCircleRadius,
            fill: color,
            stroke: smallCircleStroke,
            strokeWidth: strokeWidth
          });

          // Create a nested mandala inside this small circle
          // The nested mandala should be the entire lower level (level-1)
          // Calculate the rotation offset for the nested mandala
          const nestedRotationOffset = angle - (Math.PI / 2);

          // Recursively create the nested mandala within this small circle
          const nestedMandala = createMandala(level - 1, x, y, smallCircleRadius, nestedRotationOffset);
          nestedMandalas.push(nestedMandala);
        }

        // For levels > 0, recursively create the lower level mandala
        const lowerLevel = createMandala(level - 1, cx, cy, innerRingRadius, rotationOffset);

        // Add this ring to the rings array
        lowerLevel.rings.push(ring);

        // Add the nested mandalas
        lowerLevel.nestedMandalas.push(...nestedMandalas);

        return lowerLevel;
      }
    }

    // Create the mandala starting from the specified recursion level
    const mandala = createMandala(
      recursionLevels,
      dimensions.chartWidth / 2,
      dimensions.chartHeight / 2,
      chartRadius
    );

    // Flatten the mandala structure into an array of elements in the correct order
    const mandalaElements = [];

    // First add all container circles from innermost to outermost
    mandalaElements.push(mandala.containerCircle);

    // Add rings from innermost to outermost
    for (let i = 0; i < mandala.rings.length; i++) {
      const ring = mandala.rings[i];
      mandalaElements.push(ring.containerCircle);
      if (ring.smallCircles) {
        mandalaElements.push(...ring.smallCircles);
      }
    }

    // Now add all nested mandalas
    // We need to flatten the nested structure
    function flattenNestedMandalas(mandala) {
      const elements = [];

      // Add rings
      for (const ring of mandala.rings) {
        elements.push(ring.containerCircle);
        if (ring.smallCircles) {
          elements.push(...ring.smallCircles);
        }
      }

      // Add central circle
      elements.push(mandala.containerCircle);

      // Recursively add nested mandalas
      for (const nested of mandala.nestedMandalas) {
        elements.push(...flattenNestedMandalas(nested));
      }

      return elements;
    }

    // Add all nested mandalas
    for (const nestedMandala of mandala.nestedMandalas) {
      mandalaElements.push(...flattenNestedMandalas(nestedMandala));
    }

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
