/**
 * Annotation Types for Charts
 *
 * Defines the interfaces and types for chart annotations
 */

export type AnnotationType = 'point' | 'line' | 'area';

export type CoordinateValue = number | string | Date;
export type CoordinateRange = [CoordinateValue, CoordinateValue];

export interface AnnotationCoordinates {
  x?: CoordinateValue | CoordinateRange;
  y?: CoordinateValue | CoordinateRange;
}

export interface AnnotationStyle {
  stroke?: string;
  strokeWidth?: number;
  strokeDasharray?: string;
  fill?: string;
  fillOpacity?: number;
  radius?: number; // For point annotations
}

export type ContentPosition = 'top' | 'right' | 'bottom' | 'left' | 'center';

export interface AnnotationContent {
  text?: string;
  component?: any; // Any valid Devize component
  position?: ContentPosition;
  offset?: { x: number; y: number };
  style?: {
    fontSize?: number;
    fontFamily?: string;
    fontWeight?: string;
    fill?: string;
    backgroundColor?: string;
    padding?: number;
    borderRadius?: number;
  };
}

export interface AnnotationEvents {
  onClick?: (event: Event, annotation: Annotation) => void;
  onHover?: (event: Event, annotation: Annotation) => void;
}

export interface Annotation {
  type: AnnotationType;
  coordinates: AnnotationCoordinates;
  style?: AnnotationStyle;
  content?: AnnotationContent;
  events?: AnnotationEvents;
  id?: string; // Optional identifier for the annotation
}
