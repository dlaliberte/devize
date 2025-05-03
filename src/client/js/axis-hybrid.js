// Define reusable sub-components first
createViz({
  type: "define",
  name: "axisTick",
  properties: {
    x: { required: true },
    y: { required: true },
    length: { required: true },
    orientation: { default: 'vertical' },
    stroke: { default: '#333' },
    strokeWidth: { default: 1 }
  },
  implementation: {
    type: "line",
    x1: "{{x}}",
    y1: "{{y}}",
    x2: "{{orientation === 'vertical' ? x : x + length}}",
    y2: "{{orientation === 'vertical' ? y + length : y}}",
    stroke: "{{stroke}}",
    strokeWidth: "{{strokeWidth}}"
  }
});

createViz({
  type: "define",
  name: "axisLabel",
  properties: {
    x: { required: true },
    y: { required: true },
    text: { required: true },
    fontSize: { default: '12px' },
    textAnchor: { default: 'middle' }
  },
  implementation: {
    type: "text",
    x: "{{x}}",
    y: "{{y}}",
    text: "{{text}}",
    fontSize: "{{fontSize}}",
    textAnchor: "{{textAnchor}}"
  }
});

// Then use functional implementation to compose these components
createViz({
  type: "define",
  name: "axis",
  properties: {
    // ... axis properties
  },
  implementation: function(props) {
    const { orientation, length, values, tickSize } = props;
    const isHorizontal = orientation === 'bottom' || orientation === 'top';

    // Create the base structure
    const axisSpec = {
      type: "group",
      transform: props.transform || '',
      children: [
        // Main axis line
        {
          type: "line",
          x1: 0,
          y1: 0,
          x2: isHorizontal ? length : 0,
          y2: isHorizontal ? 0 : length,
          stroke: props.stroke,
          strokeWidth: props.strokeWidth
        }
      ]
    };

    // Add ticks and labels using our defined components
    values.forEach((value, i) => {
      let x = 0, y = 0;

      if (isHorizontal) {
        x = props.scale ? props.scale(value) : (i * (length / (values.length - 1)));
      } else {
        y = props.scale ? props.scale(value) : (i * (length / (values.length - 1)));
      }

      // Add tick using axisTick component
      axisSpec.children.push({
        type: "axisTick",
        x: isHorizontal ? x : 0,
        y: isHorizontal ? 0 : y,
        length: tickSize,
        orientation: isHorizontal ? 'vertical' : 'horizontal',
        stroke: props.tickStroke,
        strokeWidth: props.tickStrokeWidth
      });

      // Add label using axisLabel component
      axisSpec.children.push({
        type: "axisLabel",
        x: isHorizontal ? x : -tickSize - 5,
        y: isHorizontal ? tickSize + 15 : y,
        text: props.format ? props.format(value) : value.toString(),
        fontSize: props.fontSize,
        textAnchor: isHorizontal ? 'middle' : 'end'
      });
    });

    // Add title if specified
    if (props.title) {
      axisSpec.children.push({
        type: "text",
        x: isHorizontal ? length / 2 : -30,
        y: isHorizontal ? tickSize + 40 : length / 2,
        text: props.title,
        fontSize: props.titleFontSize,
        fontWeight: props.titleFontWeight,
        textAnchor: 'middle',
        transform: isHorizontal ? '' : `rotate(-90, -30, ${length / 2})`
      });
    }

    return axisSpec;
  }
});
