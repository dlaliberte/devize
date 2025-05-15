/**
 * Tooltip Component
 *
 * Purpose: Provides a tooltip visualization with a box and triangular pointer
 * Author: Devize Team
 * Creation Date: 2023-12-28
 */

import { buildViz } from '../../core/builder';
import { registerDefineType } from '../../core/define';
import { createRenderableVisualization } from '../../core/componentUtils';

// Make sure define type is registered
registerDefineType();

// Import required primitives
import '../../primitives/group';
import '../../primitives/rect';
import '../../primitives/path';
import '../../primitives/text';

// Tooltip position relative to anchor point
export type TooltipPosition = 'top' | 'right' | 'bottom' | 'left' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';

// Tooltip display behavior
export type TooltipBehavior = 'hover' | 'click' | 'fixed';

// Tooltip style options
export interface TooltipStyle {
  backgroundColor?: string;
  borderColor?: string;
  borderWidth?: number;
  borderRadius?: number;
  textColor?: string;
  fontSize?: number;
  fontFamily?: string;
  padding?: number;
  boxShadow?: string;
  pointerSize?: number;
  maxWidth?: number;
}

// Define the tooltip component
export const tooltipDefinition = {
  type: "define",
  name: "tooltip",
  properties: {
    // Content can be a string, HTML, or a visualization spec
    content: { required: true },

    // Positioning
    position: { default: 'top' },
    anchorX: { required: true },
    anchorY: { required: true },
    offsetX: { default: 0 },
    offsetY: { default: 0 },

    // Behavior
    behavior: { default: 'hover' },
    visible: { default: false },

    // Style
    style: {
      default: {
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderColor: '#cccccc',
        borderWidth: 1,
        borderRadius: 4,
        textColor: '#333333',
        fontSize: 12,
        fontFamily: 'Arial, sans-serif',
        padding: 8,
        boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
        pointerSize: 6,
        maxWidth: 200
      }
    }
  },
  implementation: function(props: any) {
    const {
      content,
      position,
      anchorX,
      anchorY,
      offsetX,
      offsetY,
      behavior,
      visible,
      style
    } = props;

    // Don't render if not visible and behavior is hover or click
    if (!visible && (behavior === 'hover' || behavior === 'click')) {
      return createRenderableVisualization(
        'tooltip',
        props,
        (container: SVGElement) => container,
        (ctx: CanvasRenderingContext2D) => true
      );
    }

    // Process content
    let contentElement;
    let contentWidth = 0;
    let contentHeight = 0;

    if (typeof content === 'string') {
      // Simple text content
      contentElement = {
        type: 'text',
        text: content,
        fill: style.textColor,
        fontSize: style.fontSize,
        fontFamily: style.fontFamily
      };

      // Estimate text dimensions (this is approximate)
      contentWidth = content.length * (style.fontSize * 0.6);
      contentHeight = style.fontSize * 1.2;
    } else if (typeof content === 'object' && content.type) {
      // Visualization spec
      contentElement = content;

      // Use provided dimensions or estimate
      contentWidth = content.width || 100;
      contentHeight = content.height || 50;
    } else {
      // Default empty content
      contentElement = {
        type: 'text',
        text: '',
        fill: style.textColor
      };
      contentWidth = 0;
      contentHeight = 0;
    }

    // Calculate tooltip dimensions
    const padding = style.padding;
    const pointerSize = style.pointerSize;
    const boxWidth = Math.min(contentWidth + padding * 2, style.maxWidth);
    const boxHeight = contentHeight + padding * 2;

    // Calculate tooltip position based on anchor point and position property
    let tooltipX = anchorX + offsetX;
    let tooltipY = anchorY + offsetY;
    let pointerPath = '';

    // Position the tooltip and create the pointer path
    switch (position) {
      case 'top':
        tooltipX -= boxWidth / 2;
        tooltipY -= boxHeight + pointerSize;
        pointerPath = `M${boxWidth / 2 - pointerSize} ${boxHeight} L${boxWidth / 2} ${boxHeight + pointerSize} L${boxWidth / 2 + pointerSize} ${boxHeight} Z`;
        break;
      case 'right':
        tooltipX += pointerSize;
        tooltipY -= boxHeight / 2;
        pointerPath = `M0 ${boxHeight / 2 - pointerSize} L${-pointerSize} ${boxHeight / 2} L0 ${boxHeight / 2 + pointerSize} Z`;
        break;
      case 'bottom':
        tooltipX -= boxWidth / 2;
        tooltipY += pointerSize;
        pointerPath = `M${boxWidth / 2 - pointerSize} 0 L${boxWidth / 2} ${-pointerSize} L${boxWidth / 2 + pointerSize} 0 Z`;
        break;
      case 'left':
        tooltipX -= boxWidth + pointerSize;
        tooltipY -= boxHeight / 2;
        pointerPath = `M${boxWidth} ${boxHeight / 2 - pointerSize} L${boxWidth + pointerSize} ${boxHeight / 2} L${boxWidth} ${boxHeight / 2 + pointerSize} Z`;
        break;
      case 'top-left':
        tooltipX -= boxWidth;
        tooltipY -= boxHeight + pointerSize;
        pointerPath = `M${boxWidth - pointerSize} ${boxHeight} L${boxWidth} ${boxHeight + pointerSize} L${boxWidth} ${boxHeight - pointerSize} Z`;
        break;
      case 'top-right':
        tooltipY -= boxHeight + pointerSize;
        pointerPath = `M${pointerSize} ${boxHeight} L0 ${boxHeight + pointerSize} L0 ${boxHeight - pointerSize} Z`;
        break;
      case 'bottom-left':
        tooltipX -= boxWidth;
        tooltipY += pointerSize;
        pointerPath = `M${boxWidth - pointerSize} 0 L${boxWidth} ${-pointerSize} L${boxWidth} ${pointerSize} Z`;
        break;
      case 'bottom-right':
        tooltipY += pointerSize;
        pointerPath = `M${pointerSize} 0 L0 ${-pointerSize} L0 ${pointerSize} Z`;
        break;
    }

    // Create the tooltip visualization
    const tooltipSpec = {
      type: 'group',
      transform: `translate(${tooltipX}, ${tooltipY})`,
      children: [
        // Tooltip box
        {
          type: 'rect',
          x: 0,
          y: 0,
          width: boxWidth,
          height: boxHeight,
          fill: style.backgroundColor,
          stroke: style.borderColor,
          strokeWidth: style.borderWidth,
          rx: style.borderRadius,
          ry: style.borderRadius,
          filter: style.boxShadow ? `drop-shadow(${style.boxShadow})` : undefined
        },
        // Pointer
        {
          type: 'path',
          d: pointerPath,
          fill: style.backgroundColor,
          stroke: style.borderColor,
          strokeWidth: style.borderWidth
        },
        // Content container
        {
          type: 'group',
          transform: `translate(${padding}, ${padding})`,
          children: [contentElement]
        }
      ]
    };

    // Process the tooltip specification to create a renderable visualization
    const renderableTooltip = buildViz(tooltipSpec);

    // Create and return a renderable visualization
    return createRenderableVisualization(
      'tooltip',
      props,
      // SVG rendering function - delegates to the group's renderToSvg
      (container: SVGElement): SVGElement => {
        if (renderableTooltip && renderableTooltip.renderToSvg) {
          return renderableTooltip.renderToSvg(container);
        }
        throw new Error('Failed to render SVG');
      },
      // Canvas rendering function - delegates to the group's renderToCanvas
      (ctx: CanvasRenderingContext2D): boolean => {
        if (renderableTooltip && renderableTooltip.renderToCanvas) {
          return renderableTooltip.renderToCanvas(ctx);
        }
        return false;
      }
    );
  }
};

// Register the tooltip component
export function registerTooltipComponent() {
  buildViz(tooltipDefinition);
}

// Factory function to create a tooltip
export function createTooltip(options: {
  content: any;
  position?: TooltipPosition;
  anchorX: number;
  anchorY: number;
  offsetX?: number;
  offsetY?: number;
  behavior?: TooltipBehavior;
  visible?: boolean;
  style?: Partial<TooltipStyle>;
}) {
  return buildViz({
    type: 'tooltip',
    content: options.content,
    position: options.position || 'top',
    anchorX: options.anchorX,
    anchorY: options.anchorY,
    offsetX: options.offsetX || 0,
    offsetY: options.offsetY || 0,
    behavior: options.behavior || 'hover',
    visible: options.visible !== undefined ? options.visible : false,
    style: options.style ? { ...tooltipDefinition.properties.style.default, ...options.style } : undefined
  });
}
