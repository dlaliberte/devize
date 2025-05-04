import { createViz } from '../core/devize';

import { createViz } from '../core/devize';

// Define the axis component
createViz({
  type: "define",
  name: "axis",
  properties: {
    orientation: { required: true },
    values: { required: true },
    length: { required: true },
    transform: { default: 'translate(0, 0)' },
    title: { default: '' },
    format: { default: (value) => value.toString() },
    tickSize: { default: 6 },
    labelOffset: { default: 9 }
  },
  implementation: {
    type: 'group',
    transform: props => props.transform,
    children: props => {
      const { orientation, values, length, title, format, tickSize, labelOffset } = props;
      const isHorizontal = orientation === 'bottom' || orientation === 'top';
      const isBottom = orientation === 'bottom';
      const isRight = orientation === 'right';

      // Create ticks and labels
      const ticks = [];
      const valueArray = Array.isArray(values) ? values : [values];

      // Main axis line
      ticks.push({
        type: 'line',
        x1: 0,
        y1: 0,
        x2: isHorizontal ? length : 0,
        y2: isHorizontal ? 0 : length,
        stroke: '#333',
        strokeWidth: 1
      });

      // Calculate tick positions
      valueArray.forEach((value, i) => {
        const position = i / (valueArray.length - 1 || 1) * length;

        // Tick mark
        ticks.push({
          type: 'line',
          x1: isHorizontal ? position : (isRight ? 0 : -tickSize),
          y1: isHorizontal ? (isBottom ? 0 : -tickSize) : position,
          x2: isHorizontal ? position : (isRight ? tickSize : 0),
          y2: isHorizontal ? (isBottom ? tickSize : 0) : position,
          stroke: '#333',
          strokeWidth: 1
        });

        // Tick label
        ticks.push({
          type: 'text',
          x: isHorizontal ? position : (isRight ? labelOffset : -labelOffset),
          y: isHorizontal ? (isBottom ? labelOffset : -labelOffset) : position,
          text: format(value),
          fontSize: '10px',
          fontFamily: 'Arial',
          fill: '#333',
          textAnchor: isHorizontal ? 'middle' : (isRight ? 'start' : 'end'),
          dominantBaseline: isHorizontal ? (isBottom ? 'hanging' : 'auto') : 'middle'
        });
      });

      // Axis title
      if (title) {
        ticks.push({
          type: 'text',
          x: isHorizontal ? length / 2 : (isRight ? labelOffset + 25 : -labelOffset - 25),
          y: isHorizontal ? (isBottom ? labelOffset + 25 : -labelOffset - 25) : length / 2,
          text: title,
          fontSize: '12px',
          fontFamily: 'Arial',
          fontWeight: 'bold',
          fill: '#333',
          textAnchor: 'middle',
          transform: isHorizontal ? '' : `rotate(${isRight ? 90 : -90}, ${isRight ? labelOffset + 25 : -labelOffset - 25}, ${length / 2})`
        });
      }

      return ticks;
    }
  }
}, document.createElement('div'));
// Register the dataMap component if it doesn't exist yet
createViz({
  type: "define",
  name: "dataMap",
  properties: {
    data: { required: true },
    map: { required: true }
  },
  implementation: (props) => {
    const data = props.data || [];
    const mapFn = props.map;

    if (!Array.isArray(data) || typeof mapFn !== 'function') {
      return { type: 'group', children: [] };
    }

    return {
      type: 'group',
      children: data.map((item, index, array) => mapFn(item, index, array, props))
    };
  }
}, document.createElement('div'));
