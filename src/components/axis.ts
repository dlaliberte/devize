/**
 * Axis Component
 *
 * Purpose: Provides axis visualization for charts
 * Author: [Author Name]
 * Creation Date: [Date]
 * Last Modified: [Date]
 */

import { buildViz } from '../core/builder';
import { createScale, Scale } from './scales/scale';

// Import required primitives
import '../primitives/group';
import '../primitives/line';
import '../primitives/text';

// Define the axis component
buildViz({
  type: "define",
  name: "axis",
  properties: {
    orientation: { required: true },
    length: { required: true },
    values: { required: true },
    positions: { default: null },
    scale: { default: null },
    scaleType: { default: null },
    domain: { default: null },
    title: { default: '' },
    format: { default: value => value.toString() },
    transform: { default: '' },
    tickCount: { default: 5 }
  },
  implementation: function(props) {
    const { orientation, length, values, positions, scale, scaleType, domain, title, format, transform, tickCount } = props;

    const isHorizontal = orientation === 'bottom' || orientation === 'top';
    const isBottom = orientation === 'bottom';
    const isRight = orientation === 'right';

    // Determine tick positions based on the provided information
    let tickPositions;
    let tickValues = values;

    if (positions) {
      // Use provided positions directly
      tickPositions = positions;
    } else if (scale) {
      // Use provided scale object
      if (scale.bandwidth) {
        // For band scales, position ticks at the center of each band
        tickPositions = values.map(v => scale.scale(v) + scale.bandwidth() / 2);
      } else {
        // For other scales, use the scale directly
        tickPositions = values.map(v => scale.scale(v));
      }

      // If no values were provided but the scale has a ticks method, use that
      if (!values.length && scale.ticks) {
        tickValues = scale.ticks(tickCount);
        tickPositions = tickValues.map(v => scale.scale(v));
      }
    } else if (scaleType && domain) {
      // Create a scale on the fly
      const scaleObj = createScale(scaleType, {
        domain: domain,
        range: isHorizontal ? [0, length] : [length, 0]
      });

      // If no values were provided but the scale has a ticks method, use that
      if (!values.length && scaleObj.ticks) {
        tickValues = scaleObj.ticks(tickCount);
      }

      if (scaleObj.bandwidth) {
        // For band scales, position ticks at the center of each band
        tickPositions = tickValues.map(v => scaleObj.scale(v) + scaleObj.bandwidth() / 2);
      } else {
        // For other scales, use the scale directly
        tickPositions = tickValues.map(v => scaleObj.scale(v));
      }
    } else {
      // Default: distribute evenly
      tickPositions = tickValues.map((_, i) =>
        i * (length / (tickValues.length - 1 || 1))
      );
    }

    // Create ticks
    const ticks = tickValues.map((value, i) => {
      const pos = tickPositions[i];
      const tickLength = 6;

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
            stroke: '#000',
            strokeWidth: 1,
            class: 'tick'
          },
          // Tick label
          {
            type: 'text',
            x: isHorizontal ? pos : (isRight ? tickLength + 5 : -tickLength - 5),
            y: isHorizontal ? (isBottom ? tickLength + 15 : -tickLength - 5) : pos,
            text: format(value),
            fontSize: '12px',
            fontFamily: 'Arial',
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
      stroke: '#000',
      strokeWidth: 1,
      class: 'axis-line'
    };

    // Create axis title
    const axisTitle = title ? {
      type: 'text',
      x: isHorizontal ? length / 2 : (isRight ? 40 : -40),
      y: isHorizontal ? (isBottom ? 50 : -40) : length / 2,
      text: title,
      fontSize: '14px',
      fontFamily: 'Arial',
      fontWeight: 'bold',
      textAnchor: 'middle',
      class: 'axis-title',
      transform: !isHorizontal ? `rotate(${isRight ? 90 : -90} ${isRight ? 40 : -40} ${length / 2})` : ''
    } : null;

    // Combine all elements
    return {
      type: 'group',
      transform: transform,
      class: 'axis',
      children: [
        axisLine,
        ...ticks,
        axisTitle
      ].filter(Boolean)
    };
  }
});
