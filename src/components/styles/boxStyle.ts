/**
 * Box Style Component
 *
 * Purpose: Provides consistent box styling options across components
 * Author: Cody
 * Creation Date: 2023-11-17
 */

export interface BoxStyleOptions {
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  strokeDasharray?: string;
  strokeLinecap?: 'butt' | 'round' | 'square';
  strokeLinejoin?: 'miter' | 'round' | 'bevel';
  opacity?: number;
  borderRadius?: number;
  shadow?: boolean;
  shadowColor?: string;
  shadowBlur?: number;
  shadowOffsetX?: number;
  shadowOffsetY?: number;
  padding?: number | { top?: number; right?: number; bottom?: number; left?: number };
  margin?: number | { top?: number; right?: number; bottom?: number; left?: number };
}

export class BoxStyle {
  fill: string;
  stroke: string;
  strokeWidth: number;
  strokeDasharray: string;
  strokeLinecap: string;
  strokeLinejoin: string;
  opacity: number;
  borderRadius: number;
  shadow: boolean;
  shadowColor: string;
  shadowBlur: number;
  shadowOffsetX: number;
  shadowOffsetY: number;
  padding: { top: number; right: number; bottom: number; left: number };
  margin: { top: number; right: number; bottom: number; left: number };

  constructor(options: BoxStyleOptions = {}) {
    this.fill = options.fill || 'none';
    this.stroke = options.stroke || 'none';
    this.strokeWidth = options.strokeWidth || 0;
    this.strokeDasharray = options.strokeDasharray || 'none';
    this.strokeLinecap = options.strokeLinecap || 'butt';
    this.strokeLinejoin = options.strokeLinejoin || 'miter';
    this.opacity = options.opacity !== undefined ? options.opacity : 1;
    this.borderRadius = options.borderRadius || 0;
    this.shadow = options.shadow || false;
    this.shadowColor = options.shadowColor || 'rgba(0, 0, 0, 0.3)';
    this.shadowBlur = options.shadowBlur || 5;
    this.shadowOffsetX = options.shadowOffsetX || 2;
    this.shadowOffsetY = options.shadowOffsetY || 2;

    // Handle padding
    if (typeof options.padding === 'number') {
      this.padding = {
        top: options.padding,
        right: options.padding,
        bottom: options.padding,
        left: options.padding
      };
    } else if (options.padding) {
      this.padding = {
        top: options.padding.top || 0,
        right: options.padding.right || 0,
        bottom: options.padding.bottom || 0,
        left: options.padding.left || 0
      };
    } else {
      this.padding = { top: 0, right: 0, bottom: 0, left: 0 };
    }

    // Handle margin
    if (typeof options.margin === 'number') {
      this.margin = {
        top: options.margin,
        right: options.margin,
        bottom: options.margin,
        left: options.margin
      };
    } else if (options.margin) {
      this.margin = {
        top: options.margin.top || 0,
        right: options.margin.right || 0,
        bottom: options.margin.bottom || 0,
        left: options.margin.left || 0
      };
    } else {
      this.margin = { top: 0, right: 0, bottom: 0, left: 0 };
    }
  }

  // Apply styles to an SVG rect element
  applyToSvgRect(element: SVGRectElement): void {
    element.setAttribute('fill', this.fill);
    element.setAttribute('stroke', this.stroke);
    element.setAttribute('stroke-width', this.strokeWidth.toString());

    if (this.strokeDasharray !== 'none') {
      element.setAttribute('stroke-dasharray', this.strokeDasharray);
    }

    element.setAttribute('stroke-linecap', this.strokeLinecap);
    element.setAttribute('stroke-linejoin', this.strokeLinejoin);
    element.setAttribute('opacity', this.opacity.toString());

    if (this.borderRadius > 0) {
      element.setAttribute('rx', this.borderRadius.toString());
      element.setAttribute('ry', this.borderRadius.toString());
    }

    // SVG doesn't directly support shadows, would need to use filters
    if (this.shadow) {
      // This would require creating a filter element
      console.warn('SVG shadows require filter elements, not directly supported by BoxStyle');
    }
  }

  // Apply styles to an HTML element
  applyToHtmlElement(element: HTMLElement): void {
    element.style.backgroundColor = this.fill !== 'none' ? this.fill : 'transparent';

    if (this.stroke !== 'none') {
      element.style.border = `${this.strokeWidth}px ${this.strokeDasharray !== 'none' ? 'dashed' : 'solid'} ${this.stroke}`;
    }

    element.style.opacity = this.opacity.toString();

    if (this.borderRadius > 0) {
      element.style.borderRadius = `${this.borderRadius}px`;
    }

    if (this.shadow) {
      element.style.boxShadow = `${this.shadowOffsetX}px ${this.shadowOffsetY}px ${this.shadowBlur}px ${this.shadowColor}`;
    }

    // Apply padding
    element.style.paddingTop = `${this.padding.top}px`;
    element.style.paddingRight = `${this.padding.right}px`;
    element.style.paddingBottom = `${this.padding.bottom}px`;
    element.style.paddingLeft = `${this.padding.left}px`;

    // Apply margin
    element.style.marginTop = `${this.margin.top}px`;
    element.style.marginRight = `${this.margin.right}px`;
    element.style.marginBottom = `${this.margin.bottom}px`;
    element.style.marginLeft = `${this.margin.left}px`;
  }

  // Create a new BoxStyle by merging with another style or options
  merge(style: BoxStyle | BoxStyleOptions): BoxStyle {
    const mergedOptions: BoxStyleOptions = {
      fill: style.fill || this.fill,
      stroke: style.stroke || this.stroke,
      strokeWidth: style.strokeWidth !== undefined ? style.strokeWidth : this.strokeWidth,
      strokeDasharray: style.strokeDasharray || this.strokeDasharray,
      strokeLinecap: style.strokeLinecap || this.strokeLinecap,
      strokeLinejoin: style.strokeLinejoin || this.strokeLinejoin,
      opacity: style.opacity !== undefined ? style.opacity : this.opacity,
      borderRadius: style.borderRadius !== undefined ? style.borderRadius : this.borderRadius,
      shadow: style.shadow !== undefined ? style.shadow : this.shadow,
      shadowColor: style.shadowColor || this.shadowColor,
      shadowBlur: style.shadowBlur !== undefined ? style.shadowBlur : this.shadowBlur,
      shadowOffsetX: style.shadowOffsetX !== undefined ? style.shadowOffsetX : this.shadowOffsetX,
      shadowOffsetY: style.shadowOffsetY !== undefined ? style.shadowOffsetY : this.shadowOffsetY
    };

    // Handle padding merging
    if (style.padding !== undefined) {
      mergedOptions.padding = style.padding;
    } else {
      mergedOptions.padding = this.padding;
    }

    // Handle margin merging
    if (style.margin !== undefined) {
      mergedOptions.margin = style.margin;
    } else {
      mergedOptions.margin = this.margin;
    }

    return new BoxStyle(mergedOptions);
  }

  // Create a specification object for use in visualization definitions
  toSpec(): any {
    return {
      fill: this.fill,
      stroke: this.stroke,
      strokeWidth: this.strokeWidth,
      strokeDasharray: this.strokeDasharray,
      strokeLinecap: this.strokeLinecap,
      strokeLinejoin: this.strokeLinejoin,
      opacity: this.opacity,
      borderRadius: this.borderRadius,
      shadow: this.shadow,
      shadowColor: this.shadowColor,
      shadowBlur: this.shadowBlur,
      shadowOffsetX: this.shadowOffsetX,
      shadowOffsetY: this.shadowOffsetY,
      padding: this.padding,
      margin: this.margin
    };
  }

  // Create a BoxStyle from a specification object
  static fromSpec(spec: any): BoxStyle {
    return new BoxStyle(spec);
  }
}
