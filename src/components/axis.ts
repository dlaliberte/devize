import { createViz } from '../core/devize';

// Define the axis component
createViz({
  type: "define",
  name: "axis",
  properties: {
    orientation: { required: true },
    length: { required: true },
    values: { required: true },
    positions: { default: null }, // Add support for custom positions
    title: { default: '' },
    format: { default: value => value.toString() },
    transform: { default: '' }
  },
  implementation: function(props) {
    const { orientation, length, values, positions, title, format, transform } = props;

    const isHorizontal = orientation === 'bottom' || orientation === 'top';
    const isBottom = orientation === 'bottom';
    const isRight = orientation === 'right';

    // Calculate tick positions if not provided
    const tickPositions = positions || values.map((_, i) =>
      i * (length / (values.length - 1 || 1))
    );

    // Create ticks
    const ticks = values.map((value, i) => {
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
            strokeWidth: 1
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
            dominantBaseline: isHorizontal ? (isBottom ? 'hanging' : 'auto') : 'middle'
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
      strokeWidth: 1
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
      transform: !isHorizontal ? `rotate(${isRight ? 90 : -90} ${isRight ? 40 : -40} ${length / 2})` : ''
    } : null;

    // Combine all elements
    return {
      type: 'group',
      transform: transform,
      children: [
        axisLine,
        ...ticks,
        axisTitle
      ].filter(Boolean)
    };
  }
});
