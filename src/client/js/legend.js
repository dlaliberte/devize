    // Register the legend visualization type using define
    createViz({
      type: "define",
      name: "legend",
      properties: {
        orientation: { default: 'vertical' }, // 'vertical' or 'horizontal'
        itemSpacing: { default: null }, // If null, will be calculated based on orientation
        symbolSize: { default: 12 },
        items: { required: true },
        fontSize: { default: '12px' },
        fontFamily: { default: 'Arial' },
        fontColor: { default: '#333' }
      },
      implementation: function(props) {
        // Calculate item spacing if not provided
        const itemSpacing = props.itemSpacing || (props.orientation === 'vertical' ? 20 : 80);

        // Create the implementation spec
        const legendSpec = {
          type: "group",
          transform: props.transform || '',
          children: []
        };

        // Add legend items
        props.items.forEach((item, i) => {
          const x = props.orientation === 'vertical' ? 0 : i * itemSpacing;
          const y = props.orientation === 'vertical' ? i * itemSpacing : 0;

          // Create a group for each legend item
          const itemGroup = {
            type: "group",
            transform: `translate(${x}, ${y})`,
            children: [
              // Symbol (rectangle)
              {
                type: "rectangle",
                x: 0,
                y: 0,
                width: props.symbolSize,
                height: props.symbolSize,
                fill: item.color || '#333',
                stroke: item.stroke,
                strokeWidth: item.strokeWidth
              },
              // Label
              {
                type: "text",
                x: props.symbolSize + 8,
                y: props.symbolSize / 2,
                text: item.label || '',
                fontSize: props.fontSize,
                fontFamily: props.fontFamily,
                fill: props.fontColor,
                dominantBaseline: 'middle'
              }
            ]
          };

          legendSpec.children.push(itemGroup);
        });

        return legendSpec;
      }
    });

    // The createLegend function is now just a wrapper that uses the defined type
    function createLegend(spec, container) {
      return createViz({
        type: "legend",
        ...spec
      }, container);
    }
