// Register the legend visualization type using a fully declarative implementation with functions
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
  implementation: {
    type: "group",
    transform: props => props.transform,
    children: [
      {
        type: "dataMap",
        data: props => props.items,
        map: (item, index, array, props) => {
          const spacing = props.itemSpacing || (props.orientation === 'vertical' ? 20 : 80);
          const x = props.orientation === 'vertical' ? 0 : index * spacing;
          const y = props.orientation === 'vertical' ? index * spacing : 0;

          return {
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
                dominantBaseline: "middle"
              }
            ]
          };
        }
      }
    ]
  }
});
