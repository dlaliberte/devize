import { registerType } from '../../core/registry';

// Register the legend visualization type
registerType({
  name: "legend",
  requiredProps: ['items'],
  optionalProps: {
    orientation: 'vertical',
    itemSpacing: null,
    symbolSize: 12,
    fontSize: '12px',
    fontFamily: 'Arial',
    fontColor: '#333'
  },
  generateConstraints(spec, context) {
    return [];
  },
  decompose(spec, solvedConstraints) {
    const spacing = spec.itemSpacing || (spec.orientation === 'vertical' ? 20 : 80);

    // Create the legend group
    const legendGroup = {
      type: "group",
      transform: spec.transform,
      children: []
    };

    // Add items
    spec.items.forEach((item, index) => {
      const x = spec.orientation === 'vertical' ? 0 : index * spacing;
      const y = spec.orientation === 'vertical' ? index * spacing : 0;

      // Add item group
      const itemGroup = {
        type: "group",
        transform: `translate(${x}, ${y})`,
        children: [
          // Symbol (rectangle)
          {
            type: "rectangle",
            x: 0,
            y: 0,
            width: spec.symbolSize,
            height: spec.symbolSize,
            fill: item.color || '#333',
            stroke: item.stroke,
            strokeWidth: item.strokeWidth
          },
          // Label
          {
            type: "text",
            x: spec.symbolSize + 8,
            y: spec.symbolSize / 2,
            text: item.label || '',
            fontSize: spec.fontSize,
            fontFamily: spec.fontFamily,
            fill: spec.fontColor,
            dominantBaseline: "middle"
          }
        ]
      };

      legendGroup.children.push(itemGroup);
    });

    return legendGroup;
  }
});
