/**
 * Text Style Component
 *
 * Purpose: Provides consistent text styling options across components
 * Author: Cody
 * Creation Date: 2023-11-17
 */

export interface TextStyleOptions {
  fontFamily?: string;
  fontSize?: string | number;
  fontWeight?: string | number;
  fontStyle?: string;
  textDecoration?: string;
  letterSpacing?: string | number;
  lineHeight?: string | number;
  textAlign?: 'left' | 'center' | 'right' | 'justify';
  color?: string;
  opacity?: number;
  textTransform?: 'none' | 'capitalize' | 'uppercase' | 'lowercase';
}

export class TextStyle {
  fontFamily: string;
  fontSize: string;
  fontWeight: string | number;
  fontStyle: string;
  textDecoration: string;
  letterSpacing: string;
  lineHeight: string;
  textAlign: string;
  color: string;
  opacity: number;
  textTransform: string;

  constructor(options: TextStyleOptions = {}) {
    this.fontFamily = options.fontFamily || 'Arial, sans-serif';
    this.fontSize = typeof options.fontSize === 'number' ? `${options.fontSize}px` : (options.fontSize || '12px');
    this.fontWeight = options.fontWeight || 'normal';
    this.fontStyle = options.fontStyle || 'normal';
    this.textDecoration = options.textDecoration || 'none';
    this.letterSpacing = typeof options.letterSpacing === 'number' ? `${options.letterSpacing}px` : (options.letterSpacing || 'normal');
    this.lineHeight = typeof options.lineHeight === 'number' ? `${options.lineHeight}px` : (options.lineHeight || 'normal');
    this.textAlign = options.textAlign || 'left';
    this.color = options.color || '#000000';
    this.opacity = options.opacity !== undefined ? options.opacity : 1;
    this.textTransform = options.textTransform || 'none';
  }

  // Apply styles to an SVG text element
  applyToSvgText(element: SVGTextElement): void {
    element.style.fontFamily = this.fontFamily;
    element.style.fontSize = this.fontSize;
    element.style.fontWeight = this.fontWeight.toString();
    element.style.fontStyle = this.fontStyle;
    element.style.textDecoration = this.textDecoration;
    element.style.letterSpacing = this.letterSpacing;
    element.style.fill = this.color;
    element.style.opacity = this.opacity.toString();
    element.style.textTransform = this.textTransform;

    // SVG-specific attributes
    element.setAttribute('text-anchor', this.getTextAnchor());
    if (this.lineHeight !== 'normal') {
      // SVG doesn't directly support line-height, but we can use dy for similar effect
      element.setAttribute('dy', this.lineHeight);
    }
  }

  // Apply styles to an HTML element
  applyToHtmlElement(element: HTMLElement): void {
    element.style.fontFamily = this.fontFamily;
    element.style.fontSize = this.fontSize;
    element.style.fontWeight = this.fontWeight.toString();
    element.style.fontStyle = this.fontStyle;
    element.style.textDecoration = this.textDecoration;
    element.style.letterSpacing = this.letterSpacing;
    element.style.lineHeight = this.lineHeight;
    element.style.textAlign = this.textAlign;
    element.style.color = this.color;
    element.style.opacity = this.opacity.toString();
    element.style.textTransform = this.textTransform;
  }

  // Get SVG text-anchor value based on textAlign
  private getTextAnchor(): string {
    switch (this.textAlign) {
      case 'center': return 'middle';
      case 'right': return 'end';
      default: return 'start';
    }
  }

  // Create a new TextStyle by merging with another style or options
  merge(style: TextStyle | TextStyleOptions): TextStyle {
    const mergedOptions: TextStyleOptions = {
      fontFamily: style.fontFamily || this.fontFamily,
      fontSize: style.fontSize || this.fontSize,
      fontWeight: style.fontWeight || this.fontWeight,
      fontStyle: style.fontStyle || this.fontStyle,
      textDecoration: style.textDecoration || this.textDecoration,
      letterSpacing: style.letterSpacing || this.letterSpacing,
      lineHeight: style.lineHeight || this.lineHeight,
      textAlign: (style as any).textAlign || this.textAlign,
      color: style.color || this.color,
      opacity: style.opacity !== undefined ? style.opacity : this.opacity,
      textTransform: (style as any).textTransform || this.textTransform
    };

    return new TextStyle(mergedOptions);
  }

  // Create a specification object for use in visualization definitions
  toSpec(): any {
    return {
      fontFamily: this.fontFamily,
      fontSize: this.fontSize,
      fontWeight: this.fontWeight,
      fontStyle: this.fontStyle,
      textDecoration: this.textDecoration,
      letterSpacing: this.letterSpacing,
      lineHeight: this.lineHeight,
      textAlign: this.textAlign,
      color: this.color,
      opacity: this.opacity,
      textTransform: this.textTransform
    };
  }

  // Create a TextStyle from a specification object
  static fromSpec(spec: any): TextStyle {
    return new TextStyle(spec);
  }
}
