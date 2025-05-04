// Primitive shape implementations
import { VizSpec, VizInstance } from '../core/types';
import { ensureSvg } from '../core/devize';

/**
 * Create a rectangle
 * @param spec The rectangle specification
 * @param container The container element
 * @returns The rectangle instance
 */
export function createRectangle(spec: VizSpec, container: HTMLElement): VizInstance {
  const svg = ensureSvg(container);

  // Create rectangle element
  const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');

  // Set attributes from spec
  rect.setAttribute('x', spec.x?.toString() || '0');
  rect.setAttribute('y', spec.y?.toString() || '0');
  rect.setAttribute('width', spec.width?.toString() || '0');
  rect.setAttribute('height', spec.height?.toString() || '0');

  // Set style attributes
  if (spec.fill) rect.setAttribute('fill', spec.fill);
  if (spec.stroke) rect.setAttribute('stroke', spec.stroke);
  if (spec.strokeWidth) rect.setAttribute('stroke-width', spec.strokeWidth.toString());
  if (spec.rx) rect.setAttribute('rx', spec.rx.toString());
  if (spec.ry) rect.setAttribute('ry', spec.ry.toString());
  if (spec.opacity) rect.setAttribute('opacity', spec.opacity.toString());

  // Add to SVG
  svg.appendChild(rect);

  // Return the visualization instance
  return {
    element: rect,
    spec: spec
  };
}

/**
 * Create a circle
 * @param spec The circle specification
 * @param container The container element
 * @returns The circle instance
 */
export function createCircle(spec: VizSpec, container: HTMLElement): VizInstance {
  const svg = ensureSvg(container);

  // Create circle element
  const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');

  // Set attributes from spec
  circle.setAttribute('cx', spec.cx?.toString() || '0');
  circle.setAttribute('cy', spec.cy?.toString() || '0');
  circle.setAttribute('r', spec.r?.toString() || '0');

  // Set style attributes
  if (spec.fill) circle.setAttribute('fill', spec.fill);
  if (spec.stroke) circle.setAttribute('stroke', spec.stroke);
  if (spec.strokeWidth) circle.setAttribute('stroke-width', spec.strokeWidth.toString());
  if (spec.opacity) circle.setAttribute('opacity', spec.opacity.toString());

  // Add to SVG
  svg.appendChild(circle);

  // Return the visualization instance
  return {
    element: circle,
    spec: spec
  };
}

/**
 * Create a line
 * @param spec The line specification
 * @param container The container element
 * @returns The line instance
 */
export function createLine(spec: VizSpec, container: HTMLElement): VizInstance {
  const svg = ensureSvg(container);

  // Create line element
  const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');

  // Set attributes from spec
  line.setAttribute('x1', spec.x1?.toString() || '0');
  line.setAttribute('y1', spec.y1?.toString() || '0');
  line.setAttribute('x2', spec.x2?.toString() || '0');
  line.setAttribute('y2', spec.y2?.toString() || '0');

  // Set style attributes
  if (spec.stroke) line.setAttribute('stroke', spec.stroke);
  if (spec.strokeWidth) line.setAttribute('stroke-width', spec.strokeWidth.toString());
  if (spec.strokeDasharray) line.setAttribute('stroke-dasharray', spec.strokeDasharray);
  if (spec.opacity) line.setAttribute('opacity', spec.opacity.toString());

  // Add to SVG
  svg.appendChild(line);

  // Return the visualization instance
  return {
    element: line,
    spec: spec
  };
}

/**
 * Create a text element
 * @param spec The text specification
 * @param container The container element
 * @returns The text instance
 */
export function createText(spec: VizSpec, container: HTMLElement): VizInstance {
  const svg = ensureSvg(container);

  // Create text element
  const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');

  // Set attributes from spec
  text.setAttribute('x', spec.x?.toString() || '0');
  text.setAttribute('y', spec.y?.toString() || '0');

  // Set style attributes
  if (spec.fill) text.setAttribute('fill', spec.fill);
  if (spec.fontSize) text.setAttribute('font-size', spec.fontSize);
  if (spec.fontFamily) text.setAttribute('font-family', spec.fontFamily);
  if (spec.fontWeight) text.setAttribute('font-weight', spec.fontWeight);
  if (spec.textAnchor) text.setAttribute('text-anchor', spec.textAnchor);
  if (spec.dominantBaseline) text.setAttribute('dominant-baseline', spec.dominantBaseline);
  if (spec.opacity) text.setAttribute('opacity', spec.opacity.toString());
  if (spec.transform) text.setAttribute('transform', spec.transform);

  // Set the text content
  text.textContent = spec.text || '';

  // Add to SVG
  svg.appendChild(text);

  // Return the visualization instance
  return {
    element: text,
    spec: spec
  };
}

/**
 * Create a path
 * @param spec The path specification
 * @param container The container element
 * @returns The path instance
 */
export function createPath(spec: VizSpec, container: HTMLElement): VizInstance {
  const svg = ensureSvg(container);

  // Create path element
  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');

  // Set attributes from spec
  if (spec.d) path.setAttribute('d', spec.d);

  // Set style attributes
  if (spec.fill) path.setAttribute('fill', spec.fill);
  if (spec.stroke) path.setAttribute('stroke', spec.stroke);
  if (spec.strokeWidth) path.setAttribute('stroke-width', spec.strokeWidth.toString());
  if (spec.strokeDasharray) path.setAttribute('stroke-dasharray', spec.strokeDasharray);
  if (spec.opacity) path.setAttribute('opacity', spec.opacity.toString());

  // Add to SVG
  svg.appendChild(path);

  // Return the visualization instance
  return {
    element: path,
    spec: spec
  };
}
