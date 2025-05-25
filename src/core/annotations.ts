/**
 * Annotations System
 *
 * Provides functionality for adding annotations to visualizations
 */

import { CartesianCoordinateSystem } from '../components/coordinates/cartesianCoordinateSystem';
import { buildViz } from './builder';

// Types for annotations
export interface AnnotationCoordinate {
  x: number | string | Date;
  y: number | string | Date;
}

export interface AnnotationComponentPosition {
  offset?: { x: number | string; y: number | string };
  anchor?: 'center' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
}

export interface AnnotationComponent {
  component: any; // Any valid Devize component specification
  position?: AnnotationComponentPosition;
}

export interface Annotation {
  coordinates: AnnotationCoordinate;
  components: AnnotationComponent[];
}

/**
 * Process template variables in component properties
 *
 * @param component The component specification
 * @param context Variables to use for template replacement
 * @returns A new component with template variables replaced
 */
function processTemplateVariables(component: any, context: Record<string, any>): any {
  if (!component) return component;

  // Create a new object to avoid modifying the original
  const result: any = {};

  // Process each property
  for (const [key, value] of Object.entries(component)) {
    if (typeof value === 'string' && value.includes('{') && value.includes('}')) {
      // Replace template variables in strings
      result[key] = value.replace(/\{([^}]+)\}/g, (match, expr) => {
        try {
          // Support simple expressions
          if (expr.includes('/') || expr.includes('+') || expr.includes('-')) {
            // Create a function that evaluates the expression using the context
            const fn = new Function(...Object.keys(context), `return ${expr};`);
            return fn(...Object.values(context));
          }
          // Simple variable lookup
          return context[expr] !== undefined ? context[expr] : match;
        } catch (e) {
          console.warn(`Error processing template variable: ${match}`, e);
          return match;
        }
      });
    } else if (typeof value === 'number' || typeof value === 'boolean') {
      // Pass through primitive values
      result[key] = value;
    } else if (Array.isArray(value)) {
      // Process arrays recursively
      result[key] = value.map(item =>
        typeof item === 'object' ? processTemplateVariables(item, context) : item
      );
    } else if (typeof value === 'object' && value !== null) {
      // Process nested objects recursively
      result[key] = processTemplateVariables(value, context);
    } else {
      // Pass through other values
      result[key] = value;
    }
  }

  return result;
}

/**
 * Calculate the actual position for an annotation component
 *
 * @param basePosition The base position (from coordinates)
 * @param componentPosition The component's relative position
 * @param context Context for template variable processing
 * @returns The calculated position
 */
function calculateComponentPosition(
  basePosition: { x: number; y: number },
  componentPosition: AnnotationComponentPosition | undefined,
  context: Record<string, any>
): { x: number; y: number } {
  if (!componentPosition) {
    return basePosition;
  }

  const result = { ...basePosition };

  // Apply offset if specified
  if (componentPosition.offset) {
    const offsetX = componentPosition.offset.x;
    const offsetY = componentPosition.offset.y;

    // Process offset values
    if (typeof offsetX === 'string') {
      const processedX = processTemplateVariables({ value: offsetX }, context).value;
      result.x += parseFloat(processedX);
    } else if (typeof offsetX === 'number') {
      result.x += offsetX;
    }

    if (typeof offsetY === 'string') {
      const processedY = processTemplateVariables({ value: offsetY }, context).value;
      result.y += parseFloat(processedY);
    } else if (typeof offsetY === 'number') {
      result.y += offsetY;
    }
  }

  // Apply anchor adjustments if needed
  // (This would adjust position based on the component's dimensions)

  return result;
}

/**
 * Render annotations for a visualization
 *
 * @param annotations The annotations to render
 * @param coordSystem The coordinate system to use
 * @param dimensions The dimensions of the visualization
 * @returns An array of rendered annotation components
 */
export function renderAnnotations(
  annotations: Annotation[],
  coordSystem: CartesianCoordinateSystem,
  dimensions: { chartWidth: number; chartHeight: number }
): any[] {
  if (!annotations || annotations.length === 0) {
    return [];
  }

  const renderedAnnotations = [];

  // Create context for template variables
  const baseContext = {
    width: dimensions.chartWidth,
    height: dimensions.chartHeight,
    xRange: coordSystem.getXScale().domain()[1] - coordSystem.getXScale().domain()[0],
    yRange: coordSystem.getYScale().domain()[1] - coordSystem.getYScale().domain()[0]
  };

  // Process each annotation
  for (const annotation of annotations) {
    // Convert coordinates to screen space
    const screenPosition = coordSystem.toScreen({
      x: annotation.coordinates.x,
      y: annotation.coordinates.y
    });

    // Create context for this annotation
    const context = {
      ...baseContext,
      x: screenPosition.x,
      y: screenPosition.y
    };

    // Process each component
    for (const annotationComponent of annotation.components) {
      // Calculate the component's position
      const componentPosition = calculateComponentPosition(
        screenPosition,
        annotationComponent.position,
        context
      );

      // Process template variables in the component
      const processedComponent = processTemplateVariables(
        annotationComponent.component,
        {
          ...context,
          // Add component-specific position
          compX: componentPosition.x,
          compY: componentPosition.y
        }
      );

      // Add position properties if the component doesn't already have them
      if (processedComponent.type === 'circle' && processedComponent.cx === undefined) {
        processedComponent.cx = componentPosition.x;
        processedComponent.cy = componentPosition.y;
      } else if (processedComponent.type === 'text' && processedComponent.x === undefined) {
        processedComponent.x = componentPosition.x;
        processedComponent.y = componentPosition.y;
      } else if (processedComponent.type === 'rect' && processedComponent.x === undefined) {
        processedComponent.x = componentPosition.x;
        processedComponent.y = componentPosition.y;
      }

      // Build the component
      const renderedComponent = buildViz(processedComponent);
      renderedAnnotations.push(renderedComponent);
    }
  }

  return renderedAnnotations;
}
