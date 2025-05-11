/**
 * Core type definitions for Devize
 */

// Visualization specification interface
export interface VisualizationSpec {
  type: string;
  [key: string]: any;
}


export type EventType =
  // Mouse events
  'click' | 'dblclick' | 'mousedown' | 'mouseup' | 'mousemove' |
  'mouseenter' | 'mouseleave' | 'mouseover' | 'mouseout' |
  // Touch events
  'touchstart' | 'touchmove' | 'touchend' | 'touchcancel' |
  // Drag events
  'dragstart' | 'drag' | 'dragend' |
  // Selection events
  'select' | 'deselect' |
  // Custom events
  'update' | 'render' | 'resize' | 'datachange';

export interface EventHandlerOptions {
  capture?: boolean;
  passive?: boolean;
  once?: boolean;
}

export interface EventHandler {
  type: EventType;
  handler: (event: any, target?: any) => void;
  options?: EventHandlerOptions;
}


export type EasingFunction = (t: number) => number;

export interface AnimationOptions {
  duration?: number;
  delay?: number;
  easing?: EasingFunction | string;
  loop?: boolean;
  yoyo?: boolean;
  onStart?: () => void;
  onUpdate?: (progress: number) => void;
  onComplete?: () => void;
}

export interface InteractiveVisualizationOptions {
  interactive?: boolean;
  events?: {
    [key in EventType]?: (event: any, target?: any) => void;
  };
  animations?: {
    enter?: AnimationOptions;
    update?: AnimationOptions;
    exit?: AnimationOptions;
  };
  tooltip?: {
    enabled?: boolean;
    content?: string | ((data: any) => string);
    position?: 'top' | 'right' | 'bottom' | 'left' | 'pointer';
    offset?: number;
    delay?: number;
  };
  cursor?: string;
  draggable?: boolean;
  selectable?: boolean;
  highlightOnHover?: boolean;
}

// Renderable visualization interface
export interface RenderableVisualization {
  renderableType: string;
  render: (container: HTMLElement) => RenderedResult;
  renderToSvg: (svg: SVGElement) => SVGElement;
  renderToCanvas: (ctx: CanvasRenderingContext2D) => void;
  update: (newSpec: VisualizationSpec) => RenderableVisualization;
  getProperty: (name: string) => any;
  // Event handling
  on(type: EventType, handler: (event: any, target?: any) => void, options?: EventHandlerOptions): void;
  off(type: EventType, handler: (event: any, target?: any) => void): void;
  trigger(type: EventType, data?: any): void;
  // Animation
  animate(options: AnimationOptions): void;
  // Interaction state
  isHovered(): boolean;
  isSelected(): boolean;
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
