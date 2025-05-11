/**
 * Point Style Component
 *
 * Purpose: Provides consistent point/marker styling options across components
 * Author: Cody
 * Creation Date: 2023-11-17
 */

export type PointShape = 'circle' | 'square' | 'triangle' | 'diamond' | 'cross' | 'star' | 'wye';

export interface PointStyleOptions {
  shape?: PointShape;
  size?: number;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  opacity?: number;
  shadow?: boolean;
  shadowColor?: string;
  shadowBlur?: number;
  shadowOffsetX?: number;
  shadowOffsetY?: number;
}

export class PointStyle {
  shape: PointShape;
  size: number;
  fill: string;
  stroke: string;
  strokeWidth: number;
  opacity: number;
  shadow: boolean;
  shadowColor: string;
  shadowBlur: number;
  shadowOffsetX: number;
  shadowOffsetY: number;

  constructor(options: PointStyleOptions = {}) {
    this.shape = options.shape || 'circle';
    this.size = options.size || 5;
    this.fill = options.fill || '#1f77b4';
    this.stroke = options.stroke || 'none';
    this.strokeWidth = options.strokeWidth || 0;
    this.opacity = options.opacity !== undefined ? options.opacity : 1;
    this.shadow = options.shadow || false;
    this.shadowColor = options.shadowColor || 'rgba(0, 0, 0, 0.3)';
    this.shadowBlur = options.shadowBlur || 5;
    this.shadowOffsetX = options.shadowOffsetX || 2;
    this.shadowOffsetY = options.shadowOffsetY || 2;
  }

  // Create SVG path data for the point shape
  getPathData(): string {
    const size = this.size;
    const halfSize = size / 2;

    switch (this.shape) {
      case 'circle':
        // Circle is handled separately with <circle> element
        return '';
      case 'square':
        return `M${-halfSize},${-halfSize}h${size}v${size}h${-size}z`;
      case 'triangle':
        return `M0,${-halfSize}L${halfSize},${halfSize}L${-halfSize},${halfSize}z`;
      case 'diamond':
        return `M0,${-halfSize}L${halfSize},0L0,${halfSize}L${-halfSize},0z`;
      case 'cross':
        const third = size / 3;
        return `M${-third},${-size/2}h${2*third}v${third}h${third}v${2*third}h${-third}v${third}h${-2*third}v${-third}h${-third}v${-2*third}h${third}z`;
      case 'star':
        const outerRadius = halfSize;
        const innerRadius = halfSize * 0.4;
        const points = 5;
        let path = `M${0},${-outerRadius}`;

        for (let i = 1; i < points * 2; i++) {
          const radius = i % 2 === 0 ? outerRadius : innerRadius;
          const angle = (Math.PI * i) / points;
          const x = Math.sin(angle) * radius;
          const y = -Math.cos(angle) * radius;
          path += `L${x},${y}`;
        }

        return path + 'z';

      case 'wye':
        const wSize = size * 0.8;
        const wHalfSize = wSize / 2;
        return `M0,${-wHalfSize}L${wHalfSize},0L0,${wHalfSize}M0,${-wHalfSize}L${-wHalfSize},0L0,${wHalfSize}`;

      default:
        return '';
    }
  }

  // Apply styles to an SVG element
  applyToSvgElement(element: SVGElement): void {
    if (element instanceof SVGCircleElement && this.shape === 'circle') {
      element.setAttribute('r', (this.size / 2).toString());
      element.setAttribute('fill', this.fill);
      element.setAttribute('stroke', this.stroke);
      element.setAttribute('stroke-width', this.strokeWidth.toString());
      element.setAttribute('opacity', this.opacity.toString());
    } else if (element instanceof SVGPathElement) {
      const pathData = this.getPathData();
      if (pathData) {
        element.setAttribute('d', pathData);
        element.setAttribute('fill', this.fill);
        element.setAttribute('stroke', this.stroke);
        element.setAttribute('stroke-width', this.strokeWidth.toString());
        element.setAttribute('opacity', this.opacity.toString());
      }
    }

    // SVG doesn't directly support shadows, would need to use filters
    if (this.shadow) {
      console.warn('SVG shadows require filter elements, not directly supported by PointStyle');
    }
  }

  // Create a new PointStyle by merging with another style or options
  merge(style: PointStyle | PointStyleOptions): PointStyle {
    const mergedOptions: PointStyleOptions = {
      shape: style.shape || this.shape,
      size: style.size !== undefined ? style.size : this.size,
      fill: style.fill || this.fill,
      stroke: style.stroke || this.stroke,
      strokeWidth: style.strokeWidth !== undefined ? style.strokeWidth : this.strokeWidth,
      opacity: style.opacity !== undefined ? style.opacity : this.opacity,
      shadow: style.shadow !== undefined ? style.shadow : this.shadow,
      shadowColor: style.shadowColor || this.shadowColor,
      shadowBlur: style.shadowBlur !== undefined ? style.shadowBlur : this.shadowBlur,
      shadowOffsetX: style.shadowOffsetX !== undefined ? style.shadowOffsetX : this.shadowOffsetX,
      shadowOffsetY: style.shadowOffsetY !== undefined ? style.shadowOffsetY : this.shadowOffsetY
    };

    return new PointStyle(mergedOptions);
  }

  // Create a specification object for use in visualization definitions
  toSpec(): any {
    return {
      shape: this.shape,
      size: this.size,
      fill: this.fill,
      stroke: this.stroke,
      strokeWidth: this.strokeWidth,
      opacity: this.opacity,
      shadow: this.shadow,
      shadowColor: this.shadowColor,
      shadowBlur: this.shadowBlur,
      shadowOffsetX: this.shadowOffsetX,
      shadowOffsetY: this.shadowOffsetY
    };
  }

  // Create a PointStyle from a specification object
  static fromSpec(spec: any): PointStyle {
    return new PointStyle(spec);
  }
}
