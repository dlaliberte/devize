/**
 * Annotation Renderer
 *
 * Provides functions to render different types of annotations on charts
 */

import { CartesianCoordinateSystem } from '../../components/coordinates/cartesianCoordinateSystem';
import { Annotation, AnnotationType } from './annotationTypes';

/**
 * Renders an annotation on a chart
 *
 * @param annotation The annotation to render
 * @param coordSystem The coordinate system to use for rendering
 * @param dimensions The dimensions of the chart
 * @returns An object representing the rendered annotation
 */
export function renderAnnotation(
  annotation: Annotation,
  coordSystem: CartesianCoordinateSystem,
  dimensions: { chartWidth: number, chartHeight: number }
) {
  switch (annotation.type) {
    case 'point':
      return renderPointAnnotation(annotation, coordSystem);
    case 'line':
      return renderLineAnnotation(annotation, coordSystem, dimensions);
    case 'area':
      return renderAreaAnnotation(annotation, coordSystem, dimensions);
    default:
      console.warn(`Unknown annotation type: ${(annotation as any).type}`);
      return null;
  }
}

/**
 * Renders a point annotation
 */
function renderPointAnnotation(annotation: Annotation, coordSystem: CartesianCoordinateSystem) {
  const { coordinates, style, content } = annotation;

  if (!coordinates.x || !coordinates.y) {
    console.warn('Point annotation requires both x and y coordinates');
    return null;
  }

  // Convert coordinates to screen space
  const screenPoint = coordSystem.toScreen({
    x: coordinates.x as any,
    y: coordinates.y as any
  });

  // Default styles
  const defaultStyle = {
    fill: '#ff0000',
    stroke: '#ffffff',
    strokeWidth: 1,
    radius: 5
  };

  const mergedStyle = { ...defaultStyle, ...style };

  // Create the point element
  const pointElement = {
    type: 'circle',
    cx: screenPoint.x,
    cy: screenPoint.y,
    r: mergedStyle.radius,
    fill: mergedStyle.fill,
    stroke: mergedStyle.stroke,
    strokeWidth: mergedStyle.strokeWidth,
    class: 'annotation-point'
  };

  // If there's content, create a text element
  const elements = [pointElement];

  if (content?.text) {
    const textPosition = getTextPosition(screenPoint, content, mergedStyle.radius || 5);

    elements.push({
      type: 'text',
      x: textPosition.x,
      y: textPosition.y,
      text: content.text,
      fontSize: content.style?.fontSize || 12,
      fontFamily: content.style?.fontFamily || 'sans-serif',
      fontWeight: content.style?.fontWeight || 'normal',
      fill: content.style?.fill || '#000000',
      textAnchor: getTextAnchor(content.position || 'top'),
      dominantBaseline: getDominantBaseline(content.position || 'top'),
      class: 'annotation-text'
    });
  }

  return {
    type: 'group',
    class: 'annotation',
    children: elements
  };
}

/**
 * Renders a line annotation (horizontal or vertical)
 */
function renderLineAnnotation(
  annotation: Annotation,
  coordSystem: CartesianCoordinateSystem,
  dimensions: { chartWidth: number, chartHeight: number }
) {
  const { coordinates, style, content } = annotation;

  // Default styles
  const defaultStyle = {
    stroke: '#ff0000',
    strokeWidth: 1,
    strokeDasharray: ''
  };

  const mergedStyle = { ...defaultStyle, ...style };

  let lineElement;
  let contentPosition;

  // Horizontal line (y coordinate specified)
  if (coordinates.y !== undefined && coordinates.x === undefined) {
    const y = coordSystem.toScreen({ x: 0, y: coordinates.y as any }).y;

    lineElement = {
      type: 'path',
      d: `M 0 ${y} H ${dimensions.chartWidth}`,
      stroke: mergedStyle.stroke,
      strokeWidth: mergedStyle.strokeWidth,
      strokeDasharray: mergedStyle.strokeDasharray,
      class: 'annotation-line horizontal'
    };

    contentPosition = { x: dimensions.chartWidth - 5, y };
  }
  // Vertical line (x coordinate specified)
  else if (coordinates.x !== undefined && coordinates.y === undefined) {
    const x = coordSystem.toScreen({ x: coordinates.x as any, y: 0 }).x;

    lineElement = {
      type: 'path',
      d: `M ${x} 0 V ${dimensions.chartHeight}`,
      stroke: mergedStyle.stroke,
      strokeWidth: mergedStyle.strokeWidth,
      strokeDasharray: mergedStyle.strokeDasharray,
      class: 'annotation-line vertical'
    };

    contentPosition = { x, y: 5 };
  }
  else {
    console.warn('Line annotation requires either x or y coordinate (but not both)');
    return null;
  }

  // Create elements array with the line
  const elements = [lineElement];

  // Add text content if specified
  if (content?.text && contentPosition) {
    const position = content.position || (coordinates.y !== undefined ? 'right' : 'top');
    const textPosition = getTextPosition(contentPosition, {
      ...content,
      position
    }, 0);

    elements.push({
      type: 'text',
      x: textPosition.x,
      y: textPosition.y,
      text: content.text,
      fontSize: content.style?.fontSize || 12,
      fontFamily: content.style?.fontFamily || 'sans-serif',
      fontWeight: content.style?.fontWeight || 'normal',
      fill: content.style?.fill || '#000000',
      textAnchor: getTextAnchor(position),
      dominantBaseline: getDominantBaseline(position),
      class: 'annotation-text'
    });
  }

  return {
    type: 'group',
    class: 'annotation',
    children: elements
  };
}

/**
 * Renders an area annotation (box or band)
 */
function renderAreaAnnotation(
  annotation: Annotation,
  coordSystem: CartesianCoordinateSystem,
  dimensions: { chartWidth: number, chartHeight: number }
) {
  const { coordinates, style, content } = annotation;

  // Default styles
  const defaultStyle = {
    fill: 'rgba(255, 0, 0, 0.1)',
    stroke: 'none',
    strokeWidth: 0
  };

  const mergedStyle = { ...defaultStyle, ...style };

  let areaElement;
  let contentPosition;

  // Handle different area types based on coordinates

  // Horizontal band (y range)
  if (Array.isArray(coordinates.y) && !Array.isArray(coordinates.x)) {
    const y1 = coordSystem.toScreen({ x: 0, y: coordinates.y[0] as any }).y;
    const y2 = coordSystem.toScreen({ x: 0, y: coordinates.y[1] as any }).y;

    areaElement = {
      type: 'rect',
      x: 0,
      y: Math.min(y1, y2),
      width: dimensions.chartWidth,
      height: Math.abs(y2 - y1),
      fill: mergedStyle.fill,
      stroke: mergedStyle.stroke,
      strokeWidth: mergedStyle.strokeWidth,
      class: 'annotation-area horizontal-band'
    };

    contentPosition = {
      x: dimensions.chartWidth / 2,
      y: Math.min(y1, y2) + Math.abs(y2 - y1) / 2
    };
  }
  // Vertical band (x range)
  else if (Array.isArray(coordinates.x) && !Array.isArray(coordinates.y)) {
    const x1 = coordSystem.toScreen({ x: coordinates.x[0] as any, y: 0 }).x;
    const x2 = coordSystem.toScreen({ x: coordinates.x[1] as any, y: 0
