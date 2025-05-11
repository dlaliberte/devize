/**
 * Axis Chart Utilities
 *
 * Shared utilities for axis-based charts (bar, line, scatter, etc.)
 */

// Helper function to calculate legend position
export function calculateLegendPosition(position, dimensions, margin) {
  if (typeof position === 'object' && position.x !== undefined && position.y !== undefined) {
    // Use explicit coordinates
    return { x: position.x, y: position.y };
  }

  // Handle named positions
  switch(position) {
    case 'top-right':
      return { x: dimensions.chartWidth - 150, y: 20 };
    case 'top-left':
      return { x: 20, y: 20 };
    case 'bottom-right':
      return { x: dimensions.chartWidth - 150, y: dimensions.chartHeight - 100 };
    case 'bottom-left':
      return { x: 20, y: dimensions.chartHeight - 100 };
    default:
      return { x: dimensions.chartWidth - 150, y: 20 }; // Default to top-right
  }
}

// Create a color mapping from data
export function createColorMapping(data, colorField) {
  if (!colorField) return null;

  const categories = [...new Set(data.map(d => d[colorField]))];
  const colors = ["#3366CC", "#DC3912", "#FF9900", "#109618", "#990099"];

  return categories.map((category, index) => ({
    value: category,
    color: colors[index % colors.length]
  }));
}

// Create a legend specification
export function createLegend(colorMapping, legendOptions, dimensions, margin) {
  if (!colorMapping || !legendOptions || legendOptions.enabled === false) {
    return null;
  }

  const legendPosition = legendOptions.position || 'top-right';
  const calculatedPosition = calculateLegendPosition(legendPosition, dimensions, margin);

  return {
    type: 'legend',
    legendType: 'color',
    items: colorMapping,
    position: calculatedPosition,
    itemSpacing: 25,
    symbolSize: 15,
    orientation: legendOptions.orientation || 'vertical',
    class: 'legend',
    transform: `translate(${calculatedPosition.x},${calculatedPosition.y})`
  };
}

// Create grid lines
export function createGridLines(dimensions, yAxisValues, xValues, xScale, yScale, xType) {
  const gridLines = [];

  // Horizontal grid lines (based on y-axis ticks)
  yAxisValues.forEach((value) => {
    const yPos = yScale.scale(value);
    gridLines.push({
      type: 'path',
      d: `M 0 ${yPos} H ${dimensions.chartWidth}`,
      stroke: '#e0e0e0',
      strokeWidth: 1,
      strokeDasharray: '3,3'
    });
  });

  // Vertical grid lines (based on x-axis)
  if (xType === 'band') {
    // For categorical data, draw lines at each band
    xValues.forEach((value) => {
      const xPos = xScale.scale(value) + (xScale.bandwidth ? xScale.bandwidth() / 2 : 0);
      gridLines.push({
        type: 'path',
        d: `M ${xPos} 0 V ${dimensions.chartHeight}`,
        stroke: '#e0e0e0',
        strokeWidth: 1,
        strokeDasharray: '3,3'
      });
    });
  } else {
    // For numeric/time data, create reasonable divisions
    const numDivisions = 10;
    for (let i = 0; i <= numDivisions; i++) {
      const xPos = (dimensions.chartWidth / numDivisions) * i;
      gridLines.push({
        type: 'path',
        d: `M ${xPos} 0 V ${dimensions.chartHeight}`,
        stroke: '#e0e0e0',
        strokeWidth: 1,
        strokeDasharray: '3,3'
      });
    }
  }

  return gridLines;
}

// Create chart title
export function createChartTitle(title, dimensions) {
  if (!title) return null;

  return {
    type: 'text',
    x: dimensions.chartWidth / 2,
    y: -10,
    text: title,
    fontSize: '16px',
    fontFamily: 'Arial',
    fontWeight: 'bold',
    fill: '#333',
    textAnchor: 'middle'
  };
}

// Determine the type of x values (linear, time, or band)
export function determineXType(xValues) {
  if (xValues.length === 0) return 'band';

  const firstVal = xValues[0];
  if (typeof firstVal === 'number') {
    return 'linear';
  } else if (firstVal instanceof Date) {
    return 'time';
  }
  return 'band';
}
