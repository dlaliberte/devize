/**
 * Axis Component
 *
 * Purpose: Provides axis visualization for charts
 * Author: [Author Name]
 * Creation Date: [Date]
 * Last Modified: [Date]
 */

import { buildViz } from '../core/builder';
import { registerDefineType } from '../core/define';
import { createScale } from './scales/scale';
import { Scale } from './scales/scale-interface';

import { createRenderableVisualization } from '../core/componentUtils';

// Import required primitives
import '../primitives/group';
import '../primitives/line';
import '../primitives/text';

// Make sure define type is registered
registerDefineType();

// Define the axis component
export const axisDefinition = {
  type: "define",
  name: "axis",
  properties: {
    orientation: { default: 'bottom', required: true },
    length: { required: true },
    values: { default: [], required: true },
    positions: { default: null },
    scale: { default: null },
    scaleType: { default: null },
    domain: { default: null },
    title: { default: '' },
    format: { default: (value: any) => value.toString() },
    transform: { default: '' },
    tickCount: { default: 5 },
    tickLength: { default: 6 },
    tickLabelOffset: { default: 5 },
    stroke: { default: '#000' },
    strokeWidth: { default: 1 },
    fontSize: { default: '12px' },
    fontFamily: { default: 'Arial' },
    titleFontSize: { default: '14px' },
    titleFontWeight: { default: 'bold' },
    className: { default: 'axis' }
  },
  validate: function(props) {
    // Validate orientation
    const validOrientations = ['top', 'right', 'bottom', 'left'];
    if (!validOrientations.includes(props.orientation)) {
      throw new Error(`Invalid orientation: ${props.orientation}. Must be one of: ${validOrientations.join(', ')}`);
    }

    // Validate length
    if (props.length <= 0) {
      throw new Error('Axis length must be positive');
    }

    // Validate scale type if provided
    if (props.scaleType && !['linear', 'band', 'ordinal', 'log', 'time'].includes(props.scaleType)) {
      throw new Error(`Invalid scale type: ${props.scaleType}. Must be one of: linear, band, ordinal, log, time`);
    }

    // Validate domain if scale type is provided
    if (props.scaleType && !props.domain) {
      throw new Error('Domain is required when scale type is provided');
    }

    // Validate format is a function
    if (typeof props.format !== 'function') {
      throw new Error('Format must be a function');
    }
  },
  implementation: function(props) {
    const {
      orientation, length, values, positions, scale, scaleType, domain,
      title, format, transform, tickCount, tickLength, tickLabelOffset,
      stroke, strokeWidth, fontSize, fontFamily, titleFontSize, titleFontWeight,
      className
    } = props;

    const isHorizontal = orientation === 'bottom' || orientation === 'top';
    const isBottom = orientation === 'bottom';
    const isRight = orientation === 'right';

    // Determine tick positions based on the provided information
    let tickPositions;
    let tickValues = values || [];
    let scaleObj = scale;

    try {
      if (positions) {
        // Use provided positions directly
        tickPositions = positions;
      } else if (scale) {
        // Use provided scale object
        if (typeof scale.scale !== 'function') {
          console.warn('Provided scale does not have a scale() method');
          throw new Error('Invalid scale object');
        }

        if (scale.bandwidth && typeof scale.bandwidth === 'function') {
          // For band scales, position ticks at the center of each band
          tickPositions = tickValues.map(v => scale.scale(v) + scale.bandwidth() / 2);
        } else {
          // For other scales, use the scale directly
          tickPositions = tickValues.map(v => scale.scale(v));
        }

        // If no values were provided but the scale has a ticks method, use that
        if (!tickValues.length && scale.ticks && typeof scale.ticks === 'function') {
          tickValues = scale.ticks(tickCount);
          tickPositions = tickValues.map(v => scale.scale(v));
        }
      } else if (scaleType && domain) {
        // Create a scale on the fly
        try {
          scaleObj = createScale(scaleType, {
            domain: domain,
            range: isHorizontal ? [0, length] : [length, 0]
          });

          // If no values were provided but the scale has a ticks method, use that
          if (!tickValues.length && scaleObj.ticks && typeof scaleObj.ticks === 'function') {
            tickValues = scaleObj.ticks(tickCount);
          }

          if (scaleObj.bandwidth && typeof scaleObj.bandwidth === 'function') {
            // For band scales, position ticks at the center of each band
            tickPositions = tickValues.map(v => scaleObj.scale(v) + scaleObj.bandwidth() / 2);
          } else {
            // For other scales, use the scale directly
            tickPositions = tickValues.map(v => scaleObj.scale(v));
          }
        } catch (error) {
          console.error('Error creating scale:', error);
          // Fall back to even distribution
          tickPositions = tickValues.map((_, i) =>
            i * (length / (tickValues.length - 1 || 1))
          );
        }
      } else {
        // Default: distribute evenly
        tickPositions = tickValues.map((_, i) =>
          i * (length / (tickValues.length - 1 || 1))
        );
      }
    } catch (error) {
      console.error('Error determining tick positions:', error);
      // Fall back to even distribution
      tickPositions = tickValues.map((_, i) =>
        i * (length / (tickValues.length - 1 || 1))
      );
    }

    // Ensure we have valid tick positions
    if (!tickPositions || !tickPositions.length) {
      console.warn('No tick positions determined, using default');
      tickPositions = [0, length];
      tickValues = [0, 100];
    }

    // Create ticks
    const ticks = tickValues.map((value, i) => {
      const pos = tickPositions[i];

      // Format the tick label safely
      let formattedValue;
      try {
        formattedValue = format(value);
      } catch (error) {
        console.warn('Error formatting tick value:', error);
        formattedValue = String(value);
      }

      return {
        type: 'group',
        children: [
          // Tick line
          {
            type: 'line',
            x1: isHorizontal ? pos : 0,
            y1: isHorizontal ? 0 : pos,
            x2: isHorizontal ? pos : (isRight ? tickLength : -tickLength),
            y2: isHorizontal ? (isBottom ? tickLength : -tickLength) : pos,
            stroke: stroke,
            strokeWidth: strokeWidth,
            class: 'tick'
          },
          // Tick label
          {
            type: 'text',
            x: isHorizontal ? pos : (isRight ? tickLength + tickLabelOffset : -tickLength - tickLabelOffset),
            y: isHorizontal ? (isBottom ? tickLength + tickLabelOffset + 10 : -tickLength - tickLabelOffset) : pos,
            text: formattedValue,
            fontSize: fontSize,
            fontFamily: fontFamily,
            textAnchor: isHorizontal ? 'middle' : (isRight ? 'start' : 'end'),
            dominantBaseline: isHorizontal ? (isBottom ? 'hanging' : 'auto') : 'middle',
            class: 'tick-label'
          }
        ]
      };
    });

    // Create axis line
    const axisLine = {
      type: 'line',
      x1: 0,
      y1: 0,
      x2: isHorizontal ? length : 0,
      y2: isHorizontal ? 0 : length,
      stroke: stroke,
      strokeWidth: strokeWidth,
      class: 'axis-line'
    };

    // Create axis title
    const axisTitle = title ? {
      type: 'text',
      x: isHorizontal ? length / 2 : (isRight ? 40 : -40),
      y: isHorizontal ? (isBottom ? 50 : -40) : length / 2,
      text: title,
      fontSize: titleFontSize,
      fontFamily: fontFamily,
      fontWeight: titleFontWeight,
      textAnchor: 'middle',
      class: 'axis-title',
      transform: !isHorizontal ? `rotate(${isRight ? 90 : -90} ${isRight ? 40 : -40} ${length / 2})` : ''
    } : null;

    // Combine all elements into a group
    const groupSpec = {
      type: 'group',
      transform: transform,
      class: className,
      children: [
        axisLine,
        ...ticks,
        axisTitle
      ].filter(Boolean),
      // Add ARIA attributes for accessibility
      'aria-label': `${orientation} axis ${title ? 'for ' + title : ''}`
    };

    // Process the group specification to create a renderable visualization
    const renderableGroup = buildViz(groupSpec);

    // Return a specification with rendering functions that delegate to the group
    const renderable = {
      renderableType: "axis",
      orientation,
      length,
      transform,
      scale: scaleObj,

      // SVG rendering function - delegates to the group's renderToSvg
      renderToSvg: (container) => {
        if (renderableGroup && renderableGroup.renderToSvg) {
          return renderableGroup.renderToSvg(container);
        }
        return null;
      },

      // Canvas rendering function - delegates to the group's renderToCanvas
      renderToCanvas: (ctx) => {
        if (renderableGroup && renderableGroup.renderToCanvas) {
          return renderableGroup.renderToCanvas(ctx);
        }
        return false;
      },

      // Get a property value
      getProperty: (name) => {
        if (name === 'type') return 'axis';
        if (name === 'orientation') return orientation;
        if (name === 'length') return length;
        if (name === 'transform') return transform;
        if (name === 'values') return tickValues;
        if (name === 'positions') return tickPositions;
        if (name === 'title') return title;
        if (name === 'scale') return scaleObj;
        return props[name];
      }
    };

    // Create and return a renderable visualization using the utility function
    return createRenderableVisualization('axis', props, renderable.renderToSvg, renderable.renderToCanvas);
  }
};

// Register the axis component
buildViz(axisDefinition);

/**
 * Create an axis directly
 *
 * @param options Axis configuration options
 * @returns A renderable axis visualization
 */
export function createAxis(options: {
  orientation: 'top' | 'right' | 'bottom' | 'left',
  length: number,
  values?: any[],
  positions?: number[],
  scale?: Scale,
  scaleType?: string,
  domain?: any[],
  title?: string,
  format?: (value: any) => string,
  transform?: string,
  tickCount?: number,
  tickLength?: number,
  tickLabelOffset?: number,
  stroke?: string,
  strokeWidth?: number,
  fontSize?: string,
  fontFamily?: string,
  titleFontSize?: string,
  titleFontWeight?: string,
  className?: string
}) {
  return buildViz({
    type: 'axis',
    orientation: options.orientation,
    length: options.length,
    values: options.values || [],
    positions: options.positions || null,
    scale: options.scale || null,
    scaleType: options.scaleType || null,
    domain: options.domain || null,
    title: options.title || '',
    format: options.format || (value => value.toString()),
    transform: options.transform || '',
    tickCount: options.tickCount || 5,
    tickLength: options.tickLength || 6,
    tickLabelOffset: options.tickLabelOffset || 5,
    stroke: options.stroke || '#000',
    strokeWidth: options.strokeWidth || 1,
    fontSize: options.fontSize || '12px',
    fontFamily: options.fontFamily || 'Arial',
    titleFontSize: options.titleFontSize || '14px',
    titleFontWeight: options.titleFontWeight || 'bold',
    className: options.className || 'axis'
  });
}
