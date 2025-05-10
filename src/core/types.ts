/**
 * Core type definitions for Devize
 */

// Visualization specification interface
export interface VisualizationSpec {
  type: string;
  [key: string]: any;
}

// Renderable visualization interface
export interface RenderableVisualization {
  renderableType: string;
  render: (container: HTMLElement) => RenderedResult;
  renderToSvg: (svg: SVGElement) => SVGElement;
  renderToCanvas: (ctx: CanvasRenderingContext2D) => void;
  update: (newSpec: VisualizationSpec) => RenderableVisualization;
  getProperty: (name: string) => any;
}

// Rendered result interface
export interface RenderedResult {
  element: Element;
  update: (newSpec: VisualizationSpec) => RenderedResult;
  cleanup: () => void;
}

// Property definition interface
export interface PropertyDefinition {
  required?: boolean;
  default?: any;
  type?: string;
  validate?: (value: any) => boolean;
}

// Type definition interface
export interface TypeDefinition {
  name: string;
  properties: Record<string, PropertyDefinition>;
  implementation: any;
  extend?: string;
  validate?: (spec: VisualizationSpec) => void;
}

// Registry interface
export interface Registry {
  registerType(type: TypeDefinition): void;
  hasType(name: string): boolean;
  getType(name: string): TypeDefinition | undefined;
  getAllTypes(): Record<string, TypeDefinition>;
}
