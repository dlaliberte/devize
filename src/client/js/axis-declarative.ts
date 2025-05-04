import { registerType } from '../../core/registry';

// Register the axis visualization type
registerType({
  name: "axis",
  requiredProps: ['orientation', 'length', 'values'],
  optionalProps: {
    scale: null,
    tickSize: 6,
    tickPadding: 3,
    stroke: '#333',
    strokeWidth: 1,
    tickStroke: '#333',
    tickStrokeWidth: 1,
    fontSize: '12px',
    fontFamily: 'Arial',
    fontColor: '#333',
    format: null,
    title: '',
    titleFontSize: '14px',
    titleFontFamily: 'Arial',
    titleFontWeight: 'bold',
    titleFontColor: '#333',
    labelOffset: { x: 0, y: 0 },
    titleOffset: { x: 0, y: 0 }
  },
  generateConstraints(spec, context) {
    return [];
  },
  decompose(spec, solvedConstraints) {
    const isHorizontal = spec.orientation === 'bottom' || spec.orientation === 'top';

    // Create the axis group
    const axisGroup = {
      type: "group",
      transform: spec.transform,
      children: [
        // Main axis line
        {
          type: "line",
          x1: 0,
          y1: 0,
          x2: isHorizontal ? spec.length : 0,
          y2: isHorizontal ? 0 : spec.length,
          stroke: spec.stroke,
          strokeWidth: spec.strokeWidth
        }
      ]
    };

    // Add ticks and labels
    spec.values.forEach((value, index, array) => {
      const x = isHorizontal
        ? (spec.scale ? spec.scale(value) : index * (spec.length / (array.length - 1)))
        : 0;
      const y = isHorizontal
        ? 0
        : (spec.scale ? spec.scale(value) : index * (spec.length / (array.length - 1)));

      // Add tick
      axisGroup.children.push({
        type: "line",
        x1: x,
        y1: y,
        x2: isHorizontal ? x : (spec.orientation === 'left' ? x - spec.tickSize : x + spec.tickSize),
        y2: isHorizontal ? (spec.orientation === 'bottom' ? y + spec.tickSize : y - spec.tickSize) : y,
        stroke: spec.tickStroke,
        strokeWidth: spec.tickStrokeWidth
      });

      // Add label
      axisGroup.children.push({
        type: "text",
        x: isHorizontal
          ? x + spec.labelOffset.x
          : (spec.orientation === 'left' ? -spec.tickSize - spec.tickPadding : spec.tickSize + spec.tickPadding) + spec.labelOffset.x,
        y: isHorizontal
          ? (spec.orientation === 'bottom' ? spec.tickSize + spec.tickPadding : -spec.tickSize - spec.tickPadding) + spec.labelOffset.y
          : y + spec.labelOffset.y,
        text: spec.format ? spec.format(value) : value.toString(),
        fontSize: spec.fontSize,
        fontFamily: spec.fontFamily,
        fill: spec.fontColor,
        textAnchor: isHorizontal ? 'middle' : (spec.orientation === 'left' ? 'end' : 'start'),
        dominantBaseline: spec.orientation === 'bottom' ? 'hanging' : spec.orientation === 'top' ? 'alphabetic' : 'middle'
      });
    });

    // Add title if specified
    if (spec.title) {
      axisGroup.children.push({
        type: "text",
        x: isHorizontal
          ? (spec.length / 2) + spec.titleOffset.x
          : (spec.orientation === 'left' ? -30 - spec.tickSize : 30 + spec.tickSize) + spec.titleOffset.x,
        y: isHorizontal
          ? (spec.orientation === 'bottom' ? spec.tickSize + spec.tickPadding + 20 : -spec.tickSize - spec.tickPadding - 20) + spec.titleOffset.y
          : (spec.length / 2) + spec.titleOffset.y,
        text: spec.title,
        fontSize: spec.titleFontSize,
        fontFamily: spec.titleFontFamily,
        fontWeight: spec.titleFontWeight,
        fill: spec.titleFontColor,
        textAnchor: "middle",
        transform: spec.orientation === 'left'
          ? `rotate(-90, ${-30 - spec.tickSize + spec.titleOffset.x}, ${(spec.length / 2) + spec.titleOffset.y})`
          : spec.orientation === 'right'
            ? `rotate(90, ${30 + spec.tickSize + spec.titleOffset.x}, ${(spec.length / 2) + spec.titleOffset.y})`
            : ''
      });
    }

    return axisGroup;
  }
});
