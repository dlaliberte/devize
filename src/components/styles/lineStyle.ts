/**
 * Line Style Component
 *
 * Purpose: Provides consistent line styling options across components
 * Author: Cody
 * Creation Date: 2023-11-17
 */

export interface LineStyleOptions {
  stroke?: string;
  strokeWidth?: number;
  strokeDasharray?: string;
  strokeLinecap?: 'butt' | 'round' | 'square';
  strokeLinejoin?: 'miter' | 'round' | 'bevel';
  opacity?: number;
  markerStart?: string;
  markerEnd?: string;
  markerMid?: string;
  shadow?: boolean;
  shadowColor?: string;
  shadowBlur?: number;
  shadowOffsetX?: number;
  shadowOffsetY?: number;
}

export class LineStyle {
  stroke: string;
  strokeWidth: number;
  strokeDasharray: string;
  strokeLinecap: string;
  strokeLinejoin: string;
  opacity: number;
  markerStart: string;
  markerEnd: string;
  markerMid: string;
  shadow: boolean;
  shadowColor: string;
  shadowBlur: number;
  shadowOffsetX: number;
  shadowOffsetY: number;

  constructor(options: LineStyleOptions = {}) {
    this.stroke = options.stroke || '#000000';
    this.strokeWidth = options.strokeWidth || 1;
    this.strokeDasharray = options.strokeDasharray || 'none';
    this.strokeLinecap = options.strokeLinecap || 'butt';
    this.strokeLinejoin = options.strokeLinejoin || 'miter';
    this.opacity = options.opacity !== undefined ? options.opacity : 1;
    this.markerStart = options.markerStart || 'none';
    this.markerEnd = options.markerEnd || 'none';
    this.markerMid = options.markerMid || 'none';
    this.shadow = options.shadow || false;
    this.shadowColor = options.shadowColor || 'rgba(0, 0, 0, 0.3)';
    this.shadowBlur = options.shadowBlur || 5;
    this.shadowOffsetX = options.shadowOffsetX || 2;
    this.shadowOffsetY = options.shadowOffsetY || 2;
  }

  // Apply styles to an SVG line or path element
  applyToSvgElement(element: SVGElement): void {
    element.setAttribute('stroke', this.stroke);
    element.setAttribute('stroke-width', this.strokeWidth.toString());

    if (this.strokeDasharray !== 'none') {
      element.setAttribute('stroke-dasharray', this.strokeDasharray);
    }

    element.setAttribute('stroke-linecap', this.strokeLinecap);
    element.setAttribute('stroke-linejoin', this.strokeLinejoin);
    element.setAttribute('opacity', this.opacity.toString());

    if (this.markerStart !== 'none') {
      element.setAttribute('marker-start', `url(#${this.markerStart})`);
    }

    if (this.markerEnd !== 'none') {
      element.setAttribute('marker-end', `url(#${this.markerEnd})`);
    }

    if (this.markerMid !== 'none') {
      element.setAttribute('marker-mid', `url(#${this.markerMid})`);
    }

    // SVG doesn't directly support shadows, would need to use filters
    if (this.shadow) {
      console.warn('SVG shadows require filter elements, not directly supported by LineStyle');
    }
  }

  // Create a new LineStyle by merging with another style or options
  merge(style: LineStyle | LineStyleOptions): LineStyle {
    const mergedOptions: LineStyleOptions = {
      stroke: style.stroke || this.stroke,
      strokeWidth: style.strokeWidth !== undefined ? style.strokeWidth : this.strokeWidth,
      strokeDasharray: style.strokeDasharray || this.strokeDasharray,
      strokeLinecap: style.strokeLinecap || this.strokeLinecap,
      strokeLinejoin: style.strokeLinejoin || this.strokeLinejoin,
      opacity: style.opacity !== undefined ? style.opacity : this.opacity,
      markerStart: style.markerStart || this.markerStart,
      markerEnd: style.markerEnd || this.markerEnd,
      markerMid: style.markerMid || this.markerMid,
      shadow: style.shadow !== undefined ? style.shadow : this.shadow,
      shadowColor: style.shadowColor || this.shadowColor,
      shadowBlur: style.shadowBlur !== undefined ? style.shadowBlur : this.shadowBlur,
      shadowOffsetX: style.shadowOffsetX !== undefined ? style.shadowOffsetX : this.shadowOffsetX,
      shadowOffsetY: style.shadowOffsetY !== undefined ? style.shadowOffsetY : this.shadowOffsetY
    };

    return new LineStyle(mergedOptions);
  }

  // Create a specification object for use in visualization definitions
  toSpec(): any {
    return {
      stroke: this.stroke,
      strokeWidth: this.strokeWidth,
      strokeDasharray: this.strokeDasharray,
      strokeLinecap: this.strokeLinecap,
      strokeLinejoin: this.strokeLinejoin,
      opacity: this.opacity,
      markerStart: this.markerStart,
      markerEnd: this.markerEnd,
      markerMid: this.markerMid,
      shadow: this.shadow,
      shadowColor: this.shadowColor,
      shadowBlur: this.shadowBlur,
      shadowOffsetX: this.shadowOffsetX,
      shadowOffsetY: this.shadowOffsetY
    };
  }

  // Create a LineStyle from a specification object
  static fromSpec(spec: any): LineStyle {
    return new LineStyle(spec);
  }
}
