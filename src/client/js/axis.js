    // Register the axis visualization type using define with functional implementation
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
      implementation: function(props) {
        // Determine if this is a horizontal or vertical axis
        const isHorizontal = props.orientation === 'bottom' || props.orientation === 'top';

        // Create the implementation spec
        const axisSpec = {
          type: "group",
          transform: props.transform || '',
          children: [
            // Main axis line
            {
              type: "line",
              x1: 0,
              y1: 0,
              x2: isHorizontal ? props.length : 0,
              y2: isHorizontal ? 0 : props.length,
              stroke: props.stroke,
              strokeWidth: props.strokeWidth
            }
          ]
        };

        // Add ticks and labels
        props.values.forEach((value, i) => {
          // Calculate position
          let x = 0, y = 0;

          if (isHorizontal) {
            x = props.scale ? props.scale(value) : (i * (props.length / (props.values.length - 1)));
          } else {
            y = props.scale ? props.scale(value) : (i * (props.length / (props.values.length - 1)));
          }

          // Add tick mark
          let tickSpec = {
            type: "line",
            stroke: props.tickStroke,
            strokeWidth: props.tickStrokeWidth
          };

          if (props.orientation === 'bottom') {
            tickSpec.x1 = x;
            tickSpec.y1 = 0;
            tickSpec.x2 = x;
            tickSpec.y2 = props.tickSize;
          } else if (props.orientation === 'top') {
            tickSpec.x1 = x;
            tickSpec.y1 = 0;
            tickSpec.x2 = x;
            tickSpec.y2 = -props.tickSize;
          } else if (props.orientation === 'left') {
            tickSpec.x1 = 0;
            tickSpec.y1 = y;
            tickSpec.x2 = -props.tickSize;
            tickSpec.y2 = y;
          } else if (props.orientation === 'right') {
            tickSpec.x1 = 0;
            tickSpec.y1 = y;
            tickSpec.x2 = props.tickSize;
            tickSpec.y2 = y;
          }

          axisSpec.children.push(tickSpec);

          // Add label
          let labelSpec = {
            type: "text",
            text: props.format ? props.format(value) : value.toString(),
            fontSize: props.fontSize,
            fontFamily: props.fontFamily,
            fill: props.fontColor
          };

          if (props.orientation === 'bottom') {
            labelSpec.x = x + props.labelOffset.x;
            labelSpec.y = props.tickSize + props.tickPadding + props.labelOffset.y;
            labelSpec.textAnchor = 'middle';
            labelSpec.dominantBaseline = 'hanging';
          } else if (props.orientation === 'top') {
            labelSpec.x = x + props.labelOffset.x;
            labelSpec.y = -props.tickSize - props.tickPadding + props.labelOffset.y;
            labelSpec.textAnchor = 'middle';
            labelSpec.dominantBaseline = 'alphabetic';
          } else if (props.orientation === 'left') {
            labelSpec.x = -props.tickSize - props.tickPadding + props.labelOffset.x;
            labelSpec.y = y + props.labelOffset.y;
            labelSpec.textAnchor = 'end';
            labelSpec.dominantBaseline = 'middle';
          } else if (props.orientation === 'right') {
            labelSpec.x = props.tickSize + props.tickPadding + props.labelOffset.x;
            labelSpec.y = y + props.labelOffset.y;
            labelSpec.textAnchor = 'start';
            labelSpec.dominantBaseline = 'middle';
          }

          axisSpec.children.push(labelSpec);
        });

        // Add axis title if specified
        if (props.title) {
          let titleSpec = {
            type: "text",
            text: props.title,
            fontSize: props.titleFontSize,
            fontFamily: props.titleFontFamily,
            fontWeight: props.titleFontWeight,
            fill: props.titleFontColor
          };

          if (props.orientation === 'bottom') {
            titleSpec.x = (props.length / 2) + props.titleOffset.x;
            titleSpec.y = props.tickSize + props.tickPadding + 20 + props.titleOffset.y;
            titleSpec.textAnchor = 'middle';
          } else if (props.orientation === 'top') {
            titleSpec.x = (props.length / 2) + props.titleOffset.x;
            titleSpec.y = -props.tickSize - props.tickPadding - 20 + props.titleOffset.y;
            titleSpec.textAnchor = 'middle';
          } else if (props.orientation === 'left') {
            titleSpec.x = -30 - props.tickSize + props.titleOffset.x;
            titleSpec.y = (props.length / 2) + props.titleOffset.y;
            titleSpec.textAnchor = 'middle';
            titleSpec.transform = `rotate(-90, ${-30 - props.tickSize + props.titleOffset.x}, ${(props.length / 2) + props.titleOffset.y})`;
          } else if (props.orientation === 'right') {
            titleSpec.x = 30 + props.tickSize + props.titleOffset.x;
            titleSpec.y = (props.length / 2) + props.titleOffset.y;
            titleSpec.textAnchor = 'middle';
            titleSpec.transform = `rotate(90, ${30 + props.tickSize + props.titleOffset.x}, ${(props.length / 2) + props.titleOffset.y})`;
          }

          axisSpec.children.push(titleSpec);
        }

        return axisSpec;
      }
    });
    // The createAxis function is now just a wrapper that uses the defined type
    function createAxis(spec, container) {
      return createViz({
        type: "axis",
        ...spec
      }, container);
    }
