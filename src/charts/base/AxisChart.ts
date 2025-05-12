/**
 * Axis Chart Base Component
 *
 * Purpose: Provides common functionality for axis-based charts
 * Author: Devize Team
 * Creation Date: 2023-12-05
 */

import { createScale } from '../../components/scales/scale';
import { createColorMapping, createLegend } from '../utils/axisChartUtils';
import { calculateChartDimensions, processChartData } from './Chart';

// Process data specifically for axis-based charts
export function processAxisChartData(data: any[], options: any) {
  let processedData = processChartData(data, options);

  // Sort data if needed
  if (options.sort) {
    const sortField = options.sortField || options.valueField;
    const sortOrder = options.sortOrder || 'descending';

    processedData = [...processedData].sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];
      const comparison = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
      return sortOrder === 'ascending' ? comparison : -comparison;
    });
  }

  return processedData;
}

// Create scales for axis-based charts
export function createChartScales(data: any[], options: any, dimensions: any) {
  const { categoryField, valueField, scaleType = 'linear' } = options;

  // Extract values
  const categoryValues = data.map(d => d[categoryField]);
  const valueValues = data.map(d => d[valueField]);

  // Calculate value domain
  const valueMin = Math.min(0, ...valueValues); // Include 0 for most chart types
  const valueMax = Math.max(...valueValues);
  const valueRange = valueMax - valueMin;
  const valuePadding = valueRange * 0.05; // 5% padding

  // Create category scale
  const categoryScale = createScale('band', {
    domain: categoryValues,
    range: [0, dimensions.chartWidth],
    padding: 0.2
  });

  // Create value scale
  const valueScale = createScale(scaleType, {
    domain: [valueMin, valueMax + valuePadding],
    range: [dimensions.chartHeight, 0]
  });

  return {
    categoryScale,
    valueScale
  };
}

// Create a color mapping for an axis chart
export function createAxisChartColorMapping(data: any[], colorField: string) {
  if (!colorField || !data || data.length === 0) {
    return null;
  }

  // Get unique values for the color field
  const uniqueValues = [...new Set(data.map(d => d[colorField]))];

  // Default color palette
  const defaultColors = ["#3366CC", "#DC3912", "#FF9900", "#109618", "#990099", "#0099C6", "#DD4477"];

  // Create color mapping
  return uniqueValues.map((value, index) => ({
    value,
    color: defaultColors[index % defaultColors.length]
  }));
}

// Create legend for axis-based charts
export function createAxisChartLegend(colorMapping: any, legendOptions: any, dimensions: any) {
  if (!colorMapping || !legendOptions || legendOptions.enabled === false) {
    return null;
  }

  return createLegend(colorMapping, legendOptions, dimensions);
}
