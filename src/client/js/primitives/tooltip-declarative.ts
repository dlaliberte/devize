import { registerType } from '../../../core/registry';
import { createViz } from '../../../core/devize';

// Register the tooltip visualization type
registerType({
  name: "tooltip",
  requiredProps: ['x', 'y', 'content'],
  optionalProps: {
    fill: "white",
    stroke: "#ccc",
    strokeWidth: 1,
    cornerRadius: 3,
    padding: 5,
    fontSize: "12px",
    fontFamily: "Arial",
    textColor: "#333",
    shadow: true,
    shadowColor: "rgba(0,0,0,0.2)",
    shadowBlur: 3,
    shadowOffset: { x: 2, y: 2 },
    arrow: true,
    arrowSize: 5,
    arrowPosition: "bottom",
    maxWidth: 200,
    width: null,
    height: null,
    visible: true
  },
  generateConstraints(spec, context) {
    return [];
  },
  decompose(spec, solvedConstraints) {
    // If not visible, return empty group
    if (spec.visible === false) {
      return { type: "group", children: [] };
    }

    // Calculate dimensions
    const width = spec.width || spec.maxWidth;
    const height = spec.height || 50;

    // Create tooltip group
    const tooltipGroup = {
      type: "group",
      children: []
    };

    // Add shadow if enabled
    if (spec.shadow) {
      tooltipGroup.children.push({
        type: "rectangle",
        x: spec.x + spec.shadowOffset.x,
        y: spec.y + spec.shadowOffset.y,
        width: width,
        height: height,
        rx: spec.cornerRadius,
        ry: spec.cornerRadius,
        fill: spec.shadowColor,
        filter: `blur(${spec.shadowBlur}px)`
      });
    }

    // Add background
    tooltipGroup.children.push({
      type: "rectangle",
      x: spec.x,
      y: spec.y,
      width: width,
      height: height,
      rx: spec.cornerRadius,
      ry: spec.cornerRadius,
      fill: spec.fill,
      stroke: spec.stroke,
      strokeWidth: spec.strokeWidth
    });

    // Add arrow if enabled
    if (spec.arrow) {
      const arrowSize = spec.arrowSize;
      let points = '';

      if (spec.arrowPosition === 'bottom') {
        points = `${spec.x + width/2 - arrowSize/2},${spec.y + height} ${spec.x + width/2 + arrowSize/2},${spec.y + height} ${spec.x + width/2},${spec.y + height + arrowSize}`;
      } else if (spec.arrowPosition === 'top') {
        points = `${spec.x + width/2 - arrowSize/2},${spec.y} ${spec.x + width/2 + arrowSize/2},${spec.y} ${spec.x + width/2},${spec.y - arrowSize}`;
      } else if (spec.arrowPosition === 'left') {
        points = `${spec.x},${spec.y + height/2 - arrowSize/2} ${spec.x},${spec.y + height/2 + arrowSize/2} ${spec.x - arrowSize},${spec.y + height/2}`;
      } else if (spec.arrowPosition === 'right') {
        points = `${spec.x + width},${spec.y + height/2 - arrowSize/2} ${spec.x + width},${spec.y + height/2 + arrowSize/2} ${spec.x + width + arrowSize},${spec.y + height/2}`;
      }

      tooltipGroup.children.push({
        type: "polygon",
        points: points,
        fill: spec.fill,
        stroke: spec.stroke,
        strokeWidth: spec.strokeWidth
      });
    }

    // Add content
    if (typeof spec.content === 'string') {
      tooltipGroup.children.push({
        type: "text",
        x: spec.x + spec.padding,
        y: spec.y + spec.padding,
        text: spec.content,
        fontSize: spec.fontSize,
        fontFamily: spec.fontFamily,
        fill: spec.textColor
      });
    } else {
      // Add custom content
      const contentGroup = {
        type: "group",
        transform: `translate(${spec.x + spec.padding}, ${spec.y + spec.padding})`,
        children: spec.content
      };

      tooltipGroup.children.push(contentGroup);
    }

    return tooltipGroup;
  }
});

// Helper function to create a tooltip
export function createTooltip(props, container) {
  return createViz({
    type: "tooltip",
    ...props
  }, container);
}

// Helper function to update tooltip position
export function updateTooltipPosition(tooltip, x, y) {
  if (tooltip) {
    tooltip.update({
      x,
      y
    });
  }
}

// Helper function to show tooltip
export function showTooltip(tooltip) {
  if (tooltip) {
    tooltip.update({
      visible: true
    });
  }
}

// Helper function to hide tooltip
export function hideTooltip(tooltip) {
  if (tooltip) {
    tooltip.update({
      visible: false
    });
  }
}
