/**
 * Visualization specification
 */
export interface VizSpec {
    type: string;
    data?: any[] | any;
    transforms?: any[];
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
