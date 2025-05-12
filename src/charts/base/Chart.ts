/**
 * Base Chart Component
 *
 * Purpose: Provides common functionality for all chart types
 * Author: Devize Team
 * Creation Date: 2023-12-05
 */

import { buildViz } from '../../core/builder';
import { registerDefineType } from '../../core/define';
import { createRenderableVisualization } from '../../core/componentUtils';
import { createChartTitle } from '../utils/axisChartUtils';

// Common chart properties that apply to all chart types
export const commonChartProperties = {
  data: { required: true },
  title: { default: '' },
  margin: { default: { top: 40, right: 30, bottom: 40, left: 30 } },
  tooltip: { default: false },
  width: { default: 600 },
  height: { default: 400 },
  legend: {
    default: {
      enabled: true,
      position: 'top-right',
      orientation: 'vertical'
    }
  }
};

// Common validation logic for all charts
export function validateCommonChartProps(props: any) {
  // Validate data is an array
  if (!Array.isArray(props.data)) {
    throw new Error('Data must be an array');
  }

  // Validate dimensions
  if (props.width <= 0 || props.height <= 0) {
    throw new Error('Width and height must be positive');
  }
}

// Create a chart title element
export function createChartTitleElement(title: string | object, dimensions: { chartWidth: number, chartHeight: number }) {
  if (!title) return null;

  const titleText = typeof title === 'string' ? title : title.text;
  const titleConfig = typeof title === 'object' ? title : {};

  return {
    type: 'text',
    x: dimensions.chartWidth / 2,
    y: -10,
    text: titleText,
    fontSize: titleConfig.fontSize || '16px',
    fontFamily: titleConfig.fontFamily || 'Arial',
    fontWeight: titleConfig.fontWeight || 'bold',
    fill: titleConfig.color || '#333',
    textAnchor: 'middle'
  };
}

// Create a renderable chart visualization
export function createChartVisualization(
  chartType: string,
  props: any,
  renderableGroup: any
) {
  return createRenderableVisualization(
    chartType,
    props,
    // SVG rendering function - delegates to the group's renderToSvg
    (container: SVGElement): SVGElement => {
      if (renderableGroup && renderableGroup.renderToSvg) {
        return renderableGroup.renderToSvg(container);
      }
      throw new Error(`Failed to render ${chartType} as SVG`);
    },
    // Canvas rendering function - delegates to the group's renderToCanvas
    (ctx: CanvasRenderingContext2D): boolean => {
      if (renderableGroup && renderableGroup.renderToCanvas) {
        return renderableGroup.renderToCanvas(ctx);
      }
      return false;
    }
  );
}

// Calculate dimensions based on margins and container size
export function calculateChartDimensions(width: number, height: number, margin: any) {
  return {
    chartWidth: width - margin.left - margin.right,
    chartHeight: height - margin.top - margin.bottom
  };
}

// Process data for visualization
export function processChartData(data: any[], options: any) {
  // This function can be extended to handle common data processing tasks
  // such as filtering, sorting, aggregation, etc.

  // For now, just return a copy of the data
  return [...data];
}

// Register the base chart components
export function registerChartComponents() {
  // Make sure define type is registered
  registerDefineType();

  // Import required primitives and components
  import('../../primitives/path');
  import('../../primitives/text');
  import('../../primitives/group');
  import('../../components/legend');
}
