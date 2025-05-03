// Register the axis visualization type using a fully declarative implementation with functions
createViz({
  type: "define",
  name: "axis",
  properties: {
    orientation: { default: 'bottom' }, // 'bottom', 'top', 'left', 'right'
    length: { required: true },
    values: { required: true },
    scale: { default: null }, // Optional scale function
    tickSize: { default: 6 },
    tickPadding: { default: 3 },
    stroke: { default: '#333' },
    strokeWidth: { default: 1 },
    tickStroke: { default: '#333' },
    tickStrokeWidth: { default: 1 },
    fontSize: { default: '12px' },
    fontFamily: { default: 'Arial' },
    fontColor: { default: '#333' },
    format: { default: null }, // Optional format function
    title: { default: '' },
    titleFontSize: { default: '14px' },
    titleFontFamily: { default: 'Arial' },
    titleFontWeight: { default: 'bold' },
    titleFontColor: { default: '#333' },
    labelOffset: { default: { x: 0, y: 0 } },
    titleOffset: { default: { x: 0, y: 0 } }
  },
  implementation: {
    type: "group",
    transform: props => props.transform,
    children: [
      // Main axis line
      {
        type: "line",
        x1: 0,
        y1: 0,
        x2: props => (props.orientation === 'bottom' || props.orientation === 'top') ? props.length : 0,
        y2: props => (props.orientation === 'bottom' || props.orientation === 'top') ? 0 : props.length,
        stroke: props => props.stroke,
        strokeWidth: props => props.strokeWidth
      },

      // Ticks and labels using dataMap
      {
        type: "dataMap",
        data: props => props.values,
        map: (value, index, array, props) => {
          const isHorizontal = props.orientation === 'bottom' || props.orientation === 'top';
          const x = isHorizontal
            ? (props.scale ? props.scale(value) : index * (props.length / (array.length - 1)))
            : 0;
          const y = isHorizontal
            ? 0
            : (props.scale ? props.scale(value) : index * (props.length / (array.length - 1)));

          return {
            type: "group",
            children: [
              // Tick mark
              {
                type: "axisTick",
                x,
                y,
                length: props.tickSize,
                orientation: props.orientation === 'bottom' ? 'down' :
                             props.orientation === 'top' ? 'up' :
                             props.orientation === 'left' ? 'left' : 'right',
                stroke: props.tickStroke,
                strokeWidth: props.tickStrokeWidth
              },

              // Label
              {
                type: "axisLabel",
                x: isHorizontal
                  ? x + props.labelOffset.x
                  : (props.orientation === 'left' ? -props.tickSize - props.tickPadding : props.tickSize + props.tickPadding) + props.labelOffset.x,
                y: isHorizontal
                  ? (props.orientation === 'bottom' ? props.tickSize + props.tickPadding : -props.tickSize - props.tickPadding) + props.labelOffset.y
                  : y + props.labelOffset.y,
                text: props.format ? props.format(value) : value.toString(),
                fontSize: props.fontSize,
                fontFamily: props.fontFamily,
                fill: props.fontColor,
                textAnchor: isHorizontal ? 'middle' : (props.orientation === 'left' ? 'end' : 'start'),
                dominantBaseline: props.orientation === 'bottom' ? 'hanging' : props.orientation === 'top' ? 'alphabetic' : 'middle'
              }
            ]
          };
        }
      },

      // Title (conditionally included)
      {
        type: "text",
        x: props => {
          const isHorizontal = props.orientation === 'bottom' || props.orientation === 'top';
          return isHorizontal
            ? (props.length / 2) + props.titleOffset.x
            : (props.orientation === 'left' ? -30 - props.tickSize : 30 + props.tickSize) + props.titleOffset.x;
        },
        y: props => {
          const isHorizontal = props.orientation === 'bottom' || props.orientation === 'top';
          return isHorizontal
            ? (props.orientation === 'bottom' ? props.tickSize + props.tickPadding + 20 : -props.tickSize - props.tickPadding - 20) + props.titleOffset.y
            : (props.length / 2) + props.titleOffset.y;
        },
        text: props => props.title,
        fontSize: props => props.titleFontSize,
        fontFamily: props => props.titleFontFamily,
        fontWeight: props => props.titleFontWeight,
        fill: props => props.titleFontColor,
        textAnchor: "middle",
        transform: props => {
          if (props.orientation === 'left') {
            return `rotate(-90, ${-30 - props.tickSize + props.titleOffset.x}, ${(props.length / 2) + props.titleOffset.y})`;
          } else if (props.orientation === 'right') {
            return `rotate(90, ${30 + props.tickSize + props.titleOffset.x}, ${(props.length / 2) + props.titleOffset.y})`;
          }
          return '';
        },
        visible: props => props.title !== ''
      }
    ]
  }
});

// Define the axisTick component
createViz({
  type: "define",
  name: "axisTick",
  properties: {
    x: { required: true },
    y: { required: true },
    length: { default: 6 },
    orientation: { default: 'down' }, // 'up', 'down', 'left', 'right'
    stroke: { default: '#333' },
    strokeWidth: { default: 1 }
  },
  implementation: {
    type: "line",
    x1: props => props.x,
    y1: props => props.y,
    x2: props => {
      if (props.orientation === 'left') return props.x - props.length;
      if (props.orientation === 'right') return props.x + props.length;
      return props.x;
    },
    y2: props => {
      if (props.orientation === 'up') return props.y - props.length;
      if (props.orientation === 'down') return props.y + props.length;
      return props.y;
    },
    stroke: props => props.stroke,
    strokeWidth: props => props.strokeWidth
  }
});

// Define the axisLabel component
createViz({
  type: "define",
  name: "axisLabel",
  properties: {
    x: { required: true },
    y: { required: true },
    text: { required: true },
    fontSize: { default: '12px' },
    fontFamily: { default: 'Arial' },
    fill: { default: '#333' },
    textAnchor: { default: 'middle' },
    dominantBaseline: { default: 'middle' }
  },
  implementation: {
    type: "text",
    x: props => props.x,
    y: props => props.y,
    text: props => props.text,
    fontSize: props => props.fontSize,
    fontFamily: props => props.fontFamily,
    fill: props => props.fill,
    textAnchor: props => props.textAnchor,
    dominantBaseline: props => props.dominantBaseline
  }
});
