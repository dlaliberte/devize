/**
 * Core type definitions that allow components to reference each other
 * without direct dependencies
 */

// Visualization specification interface
export interface VisualizationSpec {
  type: string;
  [key: string]: any;
}

// Rendered result interface
export interface RenderedResult {
  element: HTMLElement | SVGElement;
  update: (newSpec: VisualizationSpec) => RenderedResult;
  cleanup: () => void;
}

// Renderable visualization interface
export interface RenderableVisualization {
  spec: VisualizationSpec;
  type: string;
  render: (container: HTMLElement) => RenderedResult;
  renderToSvg: (svg: SVGElement) => SVGElement;
  renderToCanvas: (ctx: CanvasRenderingContext2D) => void;
  update: (newSpec: VisualizationSpec) => RenderableVisualization;
  getProperty: (name: string) => any;
}

// Type definition interface
export interface TypeDefinition {
  name: string;
  properties: Record<string, PropertyDefinition>;
  implementation: any;
  extend?: string;
}

// Property definition interface
export interface PropertyDefinition {
  required?: boolean;
  default?: any;
  type?: string;
  validate?: (value: any) => boolean;
}

// Registry interface
export interface Registry {
  registerType(type: TypeDefinition): void;
  registerTypeDirectly(spec: any): void;
  hasType(name: string): boolean;
  getType(name: string): TypeDefinition | undefined;
  getAllTypes(): Record<string, TypeDefinition>;
}

// Builder interface
export interface Builder {
  buildViz(spec: VisualizationSpec): RenderableVisualization;
}

// Renderer interface
export interface Renderer {
  renderViz(viz: VisualizationSpec | RenderableVisualization, container: HTMLElement): RenderedResult;
}
