/**
 * Annotation Utilities
 *
 * Helper functions for working with chart annotations
 */

import { CartesianCoordinateSystem } from '../../components/coordinates/cartesianCoordinateSystem';

// Types for annotations
export interface AnnotationMark {
  type: string;
  [key: string]: any;
}

export interface AnnotationContent {
  type: string;
  [key: string]: any;
  position: 'top' | 'right' | 'bottom' | 'left' | 'center' | 'auto';
  offset?: { x: number; y: number };
  connect?: {
    type: 'line' | 'path';
    style?: {
      stroke?: string;
      strokeWidth?: number;
      strokeDasharray?: string;
    };
  };
}

export interface AnnotationCoordinates {
  x?: string | number | ((data: any) => number | string | Date);
  y?: string | number | ((data: any) => number | string | Date);
}

export interface AnnotationEvents {
  onClick?: (event: Event, annotation: any) => void;
  onHover?: (event: Event, annotation: any) => void;
}

export interface Annotation {
  mark: AnnotationMark;
  content?: AnnotationContent;
  data?: any;
  coordinates?: AnnotationCoordinates;
  events?: AnnotationEvents;
}

/**
