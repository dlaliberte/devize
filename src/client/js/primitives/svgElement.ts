import { registerType } from '../../../core/registry';

// Register the svgElement visualization type
registerType({
  name: "svgElement",
  requiredProps: ['tagName'],
  optionalProps: {
    attributes: {},
    children: []
  },
  generateConstraints(spec, context) {
    return [];
  },
  decompose(spec, solvedConstraints) {
    // For SVG elements, we'll return the spec directly
    // since it will be handled by the renderer
    return spec;
  }
});
