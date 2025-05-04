import { createViz } from '../core/devize';

// Define the legend component using the define type
createViz({
  type: "define",
  name: "legend",
  properties: {
    items: { required: true },
    orientation: { default: 'vertical' },
    transform: { default: '' },
    itemSpacing: { default: 20 },
    symbolSize: { default: 12 },
    fontSize: { default: '12px' },
    fontFamily: { default: 'Arial' },
    fontColor: { default: '#333' },
    title: { default: '' },
    titleFontSize: { default: '14px' },
    titleFontFamily: { default: 'Arial' },
    titleFontWeight: { default: 'bold' },
    titleFontColor: { default: '#333' },
    padding: { default: 5 },
    border: { default: false },
    borderStroke: { default: '#ccc' },
    borderStrokeWidth: { default: 1 },
    borderRadius: { default: 3 },
    background: { default: 'white' },
    backgroundOpacity: { default: 0.8 }
  },
  implementation: {
    type: "group",
    transform: "{{transform}}",
    children: [
      // Background (conditionally included)
      {
        type: "rectangle",
        x: "{{-padding}}",
        y: "{{-padding}}",
        width: props => props.orientation === 'vertical'
          ? 120
          : props.items.length * props.itemSpacing + props.padding * 2,
        height: props => props.orientation === 'vertical'
          ? props.items.length * props.itemSpacing + props.padding * 2
          : 30,
        rx: "{{borderRadius}}",
        ry: "{{borderRadius}}",
        fill: "{{background}}",
        fillOpacity: "{{backgroundOpacity}}",
        stroke: "{{border ? borderStroke : 'none'}}",
        strokeWidth: "{{border ? borderStrokeWidth : 0}}",
        visible: "{{border || background !== 'none'}}"
      },

      // Title (conditionally included)
      {
        type: "text",
        x: 0,
        y: -10,
        text: "{{title}}",
        fontSize: "{{titleFontSize}}",
        fontFamily: "{{titleFontFamily}}",
        fontWeight: "{{titleFontWeight}}",
        fill: "{{titleFontColor}}",
        visible: "{{title !== ''}}"
      },

      // Legend items
      {
        type: "dataMap",
        data: "{{items}}",
        map: (item, index, array, props) => {
          const isVertical = props.orientation === 'vertical';
          const x = isVertical ? 0 : index * props.itemSpacing;
          const y = isVertical ? index * props.itemSpacing : 0;

          return {
            type: "group",
            children: [
              // Symbol (circle or square)
              item.symbol === 'square' ? {
                type: "rectangle",
                x: x,
                y: y,
                width: props.symbolSize,
                height: props.symbolSize,
                fill: item.color
              } : {
                type: "circle",
                cx: x + props.symbolSize / 2,
                cy: y + props.symbolSize / 2,
                r: props.symbolSize / 2,
                fill: item.color
              },

              // Label
              {
                type: "text",
                x: x + props.symbolSize + 5,
                y: y + props.symbolSize / 2,
                text: item.label,
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
}, document.createElement('div')); // We need a container, but it won't be used for rendering
