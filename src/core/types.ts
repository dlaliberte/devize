// Core type definitions for Devize

/**
 * Visualization specification
 */
export interface VizSpec {
  type: string;
  data?: any[] | DataSource | string;
  transforms?: DataTransform[];
  [key: string]: any;
}

/**
 * Visualization instance
 */
export interface VizInstance {
  element: HTMLElement | SVGElement;
  spec: VizSpec;
  [key: string]: any;
}

/**
 * Data field specification
 */
export interface DataField {
  field: string;
  range?: [number, number];
  [key: string]: any;
}

/**
 * Data source specification
 */
export interface DataSource {
  type: 'csv' | 'json' | 'reference' | 'remote';
  url?: string;
  content?: string | object;
  name?: string;
  format?: string;
  [key: string]: any;
}

/**
 * Field mapping for lookup transformations
 */
export interface FieldMapping {
  source: string;
  target: string;
}

/**
 * Data transformation specification
 */
export interface DataTransform {
  type: 'filter' | 'sort' | 'aggregate' | 'formula' | 'bin' | 'lookup' | 'stack' | 'window';
  field?: string;
  test?: string | ((d: any) => boolean);
  order?: 'ascending' | 'descending';
  groupBy?: string | string[];
  ops?: string | string[];
  fields?: string | string[];
  expr?: string | ((d: any) => any);
  as?: string | string[];
  bins?: number;
  from?: {
    values: any[];
    key: string;
  };
  lookup?: string;
  offset?: 'zero' | 'normalize' | 'center';
  frame?: [number | null, number | null];
  [key: string]: any;
}

/**
 * Constraint specification
 */
export interface ConstraintSpec {
  type: string;
  priority?: 'low' | 'medium' | 'high';
  container?: HTMLElement;
  [key: string]: any;
}

/**
 * Visualization type definition
 */
export interface VisualizationType {
  name: string;
  requiredProps: string[];
  optionalProps?: Record<string, any>;
  generateConstraints: (spec: VizSpec, context: any) => ConstraintSpec[];
  decompose: (spec: VizSpec, solvedConstraints: any) => any;
}

/**
 * Interaction specification
 */
export interface InteractionSpec {
  type: 'hover' | 'click' | 'drag' | 'zoom' | 'brush';
  target: string;
  effect?: any;
  action?: (data: any, event: Event) => void;
  [key: string]: any;
}

/**
 * Animation specification
 */
export interface AnimationSpec {
  type: 'fade' | 'slide' | 'scale' | 'custom';
  duration?: number;
  delay?: number;
  easing?: string;
  [key: string]: any;
}
