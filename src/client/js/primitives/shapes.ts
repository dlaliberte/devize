import { registerType } from '../../../core/registry';

// Register the rectangle visualization type if not already registered
registerType({
  name: "rectangle",
  requiredProps: ['x', 'y', 'width', 'height'],
  optionalProps: {
    fill: 'none',
    stroke: 'none',
    strokeWidth: 1,
    rx: 0,
    ry: 0
  },
  generateConstraints(spec, context) {
    return [];
  },
  decompose(spec, solvedConstraints) {
    return {
      type: "svgElement",
      tagName: "rect",
      attributes: {
        x: spec.x,
        y: spec.y,
        width: spec.width,
        height: spec.height,
        fill: spec.fill,
        stroke: spec.stroke,
        'stroke-width': spec.strokeWidth,
        rx: spec.rx,
        ry: spec.ry
      }
    };
  }
});

// Register the polygon visualization type
registerType({
  name: "polygon",
  requiredProps: ['points'],
  optionalProps: {
    fill: 'none',
    stroke: 'none',
    strokeWidth: 1
  },
  generateConstraints(spec, context) {
    return [];
  },
  decompose(spec, solvedConstraints) {
    return {
      type: "svgElement",
      tagName: "polygon",
      attributes: {
        points: spec.points,
        fill: spec.fill,
        stroke: spec.stroke,
        'stroke-width': spec.strokeWidth
      }
    };
  }
});
