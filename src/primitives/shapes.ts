// Primitive shape implementations
import { VizSpec, VizInstance } from '../core/types';
import { createViz } from '../core/devize';

// Obsolete, but possibly useful.

// Define shape primitives
export function defineShapePrimitives() {
  // Define rectangle primitive
  createViz({
    type: "define",
    name: "rectangle",
    properties: {
      x: { default: 0 },
      y: { default: 0 },
      width: { required: true },
      height: { required: true },
      fill: { default: "none" },
      stroke: { default: "black" },
      strokeWidth: { default: 1 },
      rx: { default: 0 },
      ry: { default: 0 },
      opacity: { default: 1 }
    },
    implementation: props => {
      const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      rect.setAttribute('x', String(props.x || 0));
      rect.setAttribute('y', String(props.y || 0));
      rect.setAttribute('width', String(props.width));
      rect.setAttribute('height', String(props.height));

      if (props.fill) rect.setAttribute('fill', props.fill);
      if (props.stroke) rect.setAttribute('stroke', props.stroke);
      if (props.strokeWidth) rect.setAttribute('stroke-width', String(props.strokeWidth));
      if (props.rx) rect.setAttribute('rx', String(props.rx));
      if (props.ry) rect.setAttribute('ry', String(props.ry));
      if (props.opacity) rect.setAttribute('opacity', String(props.opacity));

      return {
        element: rect,
        spec: props
      };
    }
  });

  // Define circle primitive
  createViz({
    type: "define",
    name: "circle",
    properties: {
      cx: { default: 0 },
      cy: { default: 0 },
      r: { required: true },
      fill: { default: "none" },
      stroke: { default: "black" },
      strokeWidth: { default: 1 },
      opacity: { default: 1 }
    },
    implementation: props => {
      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('cx', String(props.cx || 0));
      circle.setAttribute('cy', String(props.cy || 0));
      circle.setAttribute('r', String(props.r));

      if (props.fill) circle.setAttribute('fill', props.fill);
      if (props.stroke) circle.setAttribute('stroke', props.stroke);
      if (props.strokeWidth) circle.setAttribute('stroke-width', String(props.strokeWidth));
      if (props.opacity) circle.setAttribute('opacity', String(props.opacity));

      return {
        element: circle,
        spec: props
      };
    }
  });

  // Define line primitive
  createViz({
    type: "define",
    name: "line",
    properties: {
      x1: { required: true },
      y1: { required: true },
      x2: { required: true },
      y2: { required: true },
      stroke: { default: "black" },
      strokeWidth: { default: 1 },
      strokeDasharray: { default: "" },
      opacity: { default: 1 }
    },
    implementation: props => {
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', String(props.x1));
      line.setAttribute('y1', String(props.y1));
      line.setAttribute('x2', String(props.x2));
      line.setAttribute('y2', String(props.y2));

      if (props.stroke) line.setAttribute('stroke', props.stroke);
      if (props.strokeWidth) line.setAttribute('stroke-width', String(props.strokeWidth));
      if (props.strokeDasharray) line.setAttribute('stroke-dasharray', props.strokeDasharray);
      if (props.opacity) line.setAttribute('opacity', String(props.opacity));

      return {
        element: line,
        spec: props
      };
    }
  });

  // Define path primitive
  createViz({
    type: "define",
    name: "path",
    properties: {
      d: { required: true },
      fill: { default: "none" },
      stroke: { default: "black" },
      strokeWidth: { default: 1 },
      strokeDasharray: { default: "" },
      opacity: { default: 1 }
    },
    implementation: props => {
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', props.d);

      if (props.fill) path.setAttribute('fill', props.fill);
      if (props.stroke) path.setAttribute('stroke', props.stroke);
      if (props.strokeWidth) path.setAttribute('stroke-width', String(props.strokeWidth));
      if (props.strokeDasharray) path.setAttribute('stroke-dasharray', props.strokeDasharray);
      if (props.opacity) path.setAttribute('opacity', String(props.opacity));

      return {
        element: path,
        spec: props
      };
    }
  });
}
