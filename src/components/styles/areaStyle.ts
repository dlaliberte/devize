/**
 * Area Style Component
 *
 * Purpose: Provides consistent area styling options across components
 * Author: Cody
 * Creation Date: 2023-11-17
 */

export interface AreaStyleOptions {
  fill?: string;
  fillOpacity?: number;
  stroke?: string;
  strokeWidth?: number;
  strokeDasharray?: string;
  strokeLinecap?: 'butt' | 'round' | 'square';
  strokeLinejoin?: 'miter' | 'round' | 'bevel';
  opacity?: number;
  gradient?: {
    type: 'linear' | 'radial';
    stops: Array<{ offset: number; color: string; opacity?: number }>;
    x1?: number;
    y1?: number;
    x2?: number;
    y2?: number;
    r?: number;
  };
  pattern?: string;
  shadow?: boolean;
  shadowColor?: string;
  shadowBlur?: number;
  shadowOffsetX?: number;
  shadowOffsetY?: number;
}

export class AreaStyle {
  fill: string;
  fillOpacity: number;
  stroke: string;
  strokeWidth: number;
  strokeDasharray: string;
  strokeLinecap: string;
  strokeLinejoin: string;
  opacity: number;
  gradient: {
    type: 'linear' | 'radial';
    stops: Array<{ offset: number; color: string; opacity?: number }>;
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    r: number;
  } | null;
  pattern: string;
  shadow: boolean;
  shadowColor: string;
  shadowBlur: number;
  shadowOffsetX: number;
  shadowOffsetY: number;

  constructor(options: AreaStyleOptions = {}) {
    this.fill = options.fill || 'steelblue';
    this.fillOpacity = options.fillOpacity !== undefined ? options.fillOpacity : 0.7;
    this.stroke = options.stroke || 'none';
    this.strokeWidth = options.strokeWidth || 0;
    this.strokeDasharray = options.strokeDasharray || 'none';
    this.strokeLinecap = options.strokeLinecap || 'butt';
    this.strokeLinejoin = options.strokeLinejoin || 'miter';
    this.opacity = options.opacity !== undefined ? options.opacity : 1;
    this.gradient = options.gradient || null;
    this.pattern = options.pattern || 'none';
    this.shadow = options.shadow || false;
    this.shadowColor = options.shadowColor || 'rgba(0, 0, 0, 0.3)';
    this.shadowBlur = options.shadowBlur || 5;
    this.shadowOffsetX = options.shadowOffsetX || 2;
    this.shadowOffsetY = options.shadowOffsetY || 2;
  }

  // Apply styles to an SVG path or polygon element
  applyToSvgElement(element: SVGElement, defs?: SVGDefsElement): void {
    // Handle gradient if defined and we have defs
    if (this.gradient && defs) {
      const id = `gradient-${Math.random().toString(36).substr(2, 9)}`;
      const gradientEl = this.createGradientElement(id, defs);
      element.setAttribute('fill', `url(#${id})`);
    } else {
      element.setAttribute('fill', this.fill);
    }

    element.setAttribute('fill-opacity', this.fillOpacity.toString());
    element.setAttribute('stroke', this.stroke);
    element.setAttribute('stroke-width', this.strokeWidth.toString());

    if (this.strokeDasharray !== 'none') {
      element.setAttribute('stroke-dasharray', this.strokeDasharray);
    }

    element.setAttribute('stroke-linecap', this.strokeLinecap);
    element.setAttribute('stroke-linejoin', this.strokeLinejoin);
    element.setAttribute('opacity', this.opacity.toString());

    // Handle pattern if defined
    if (this.pattern !== 'none' && defs) {
      // This would require creating a pattern element
      console.warn('SVG patterns require pattern elements, not directly implemented in AreaStyle');
    }

    // SVG doesn't directly support shadows, would need to use filters
    if (this.shadow) {
      console.warn('SVG shadows require filter elements, not directly supported by AreaStyle');
    }
  }

  // Create gradient element
  private createGradientElement(id: string, defs: SVGDefsElement): SVGGradientElement {
    if (!this.gradient) {
      throw new Error('Cannot create gradient element: gradient is not defined');
    }

    let gradientEl: SVGLinearGradientElement | SVGRadialGradientElement;

    if (this.gradient.type === 'linear') {
      gradientEl = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
      gradientEl.setAttribute('x1', (this.gradient.x1 || 0).toString());
      gradientEl.setAttribute('y1', (this.gradient.y1 || 0).toString());
      gradientEl.setAttribute('x2', (this.gradient.x2 || 1).toString());
      gradientEl.setAttribute('y2', (this.gradient.y2 || 0).toString());
    } else {
      gradientEl = document.createElementNS('http://www.w3.org/2000/svg', 'radialGradient');
      gradientEl.setAttribute('cx', (this.gradient.x1 || 0.5).toString());
      gradientEl.setAttribute('cy', (this.gradient.y1 || 0.5).toString());
      gradientEl.setAttribute('r', (this.gradient.r || 0.5).toString());
    }

    gradientEl.setAttribute('id', id);

    // Add stops
    this.gradient.stops.forEach(stop => {
      const stopEl = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
      stopEl.setAttribute('offset', stop.offset.toString());
      stopEl.setAttribute('stop-color', stop.color);

      if (stop.opacity !== undefined) {
        stopEl.setAttribute('stop-opacity', stop.opacity.toString());
      }

      gradientEl.appendChild(stopEl);
    });

    defs.appendChild(gradientEl);
    return gradientEl;
  }

  // Create a new AreaStyle by merging with another style or options
  merge(style: AreaStyle | AreaStyleOptions): AreaStyle {
    const mergedOptions: AreaStyleOptions = {
      fill: style.fill || this.fill,
      fillOpacity: style.fillOpacity !== undefined ? style.fillOpacity : this.fillOpacity,
      stroke: style.stroke || this.stroke,
      strokeWidth: style.strokeWidth !== undefined ? style.strokeWidth : this.strokeWidth,
      strokeDasharray: style.strokeDasharray || this.strokeDasharray,
      strokeLinecap: style.strokeLinecap || this.strokeLinecap,
      strokeLinejoin: style.strokeLinejoin || this.strokeLinejoin,
      opacity: style.opacity !== undefined ? style.opacity : this.opacity,
      gradient: style.gradient || this.gradient,
      pattern: style.pattern || this.pattern,
      shadow: style.shadow !== undefined ? style.shadow : this.shadow,
      shadowColor: style.shadowColor || this.shadowColor,
      shadowBlur: style.shadowBlur !== undefined ? style.shadowBlur : this.shadowBlur,
      shadowOffsetX: style.shadowOffsetX !== undefined ? style.shadowOffsetX : this.shadowOffsetX,
      shadowOffsetY: style.shadowOffsetY !== undefined ? style.shadowOffsetY : this.shadowOffsetY
    };

    return new AreaStyle(mergedOptions);
  }

  // Create a specification object for use in visualization definitions
  toSpec(): any {
    return {
      fill: this.fill,
      fillOpacity: this.fillOpacity,
      stroke: this.stroke,
      strokeWidth: this.strokeWidth,
      strokeDasharray: this.strokeDasharray,
      strokeLinecap: this.strokeLinecap,
      strokeLinejoin: this.strokeLinejoin,
      opacity: this.opacity,
      gradient: this.gradient,
      pattern: this.pattern,
      shadow: this.shadow,
      shadowColor: this.shadowColor,
      shadowBlur: this.shadowBlur,
      shadowOffsetX: this.shadowOffsetX,
      shadowOffsetY: this.shadowOffsetY
    };
  }

  // Create an AreaStyle from a specification object
  static fromSpec(spec: any): AreaStyle {
    return new AreaStyle(spec);
  }
}
