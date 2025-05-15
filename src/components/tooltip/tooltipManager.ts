/**
 * Tooltip Manager
 *
 * Purpose: Provides utilities for managing tooltips in visualizations
 * Author: Devize Team
 * Creation Date: 2023-12-28
 */

import { createTooltip } from './tooltip';

// Tooltip manager for handling tooltip creation and updates
export class TooltipManager {
  private container: HTMLElement | SVGElement;
  private tooltips: Map<string, any> = new Map();
  private activeTooltip: string | null = null;
  private tooltipLayer: SVGGElement | null = null;

  constructor(container: HTMLElement | SVGElement) {
    this.container = container;
    this.setupTooltipLayer();
  }

  // Create a tooltip layer for rendering tooltips
  private setupTooltipLayer() {
    if (this.container instanceof SVGElement) {
      // For SVG containers, create a group element for tooltips
      this.tooltipLayer = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      this.tooltipLayer.setAttribute('class', 'devize-tooltip-layer');
      this.container.appendChild(this.tooltipLayer);
    } else {
      // For HTML containers, create an SVG element for tooltips
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.setAttribute('class', 'devize-tooltip-layer');
      svg.style.position = 'absolute';
      svg.style.top = '0';
      svg.style.left = '0';
      svg.style.width = '100%';
      svg.style.height = '100%';
      svg.style.pointerEvents = 'none';
      svg.style.overflow = 'visible';
      this.container.appendChild(svg);

      this.tooltipLayer = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      svg.appendChild(this.tooltipLayer);
    }
  }

  // Show a tooltip at the specified position
  showTooltip(
    id: string,
    content: any,
    x: number,
    y: number,
    options: {
      position?: string;
      offsetX?: number;
      offsetY?: number;
      behavior?: string;
      style?: any;
    } = {}
  ) {
    // Hide any active tooltip if it's different
    if (this.activeTooltip && this.activeTooltip !== id) {
      this.hideTooltip(this.activeTooltip);
    }

    // Create or update the tooltip
    let tooltip = this.tooltips.get(id);

    if (!tooltip) {
      // Create a new tooltip
      tooltip = createTooltip({
        content,
        anchorX: x,
        anchorY: y,
        position: options.position as any,
        offsetX: options.offsetX,
        offsetY: options.offsetY,
        behavior: options.behavior as any,
        visible: true,
        style: options.style
      });

      this.tooltips.set(id, tooltip);

      // Render the tooltip to the tooltip layer
      if (this.tooltipLayer) {
        tooltip.renderToSvg(this.tooltipLayer);
      }
    } else {
      // Update existing tooltip
      tooltip = tooltip.update({
        content,
        anchorX: x,
        anchorY: y,
        position: options.position,
        offsetX: options.offsetX,
        offsetY: options.offsetY,
        visible: true,
        style: options.style
      });

      this.tooltips.set(id, tooltip);
    }

    this.activeTooltip = id;
    return tooltip;
  }

  // Hide a specific tooltip
  hideTooltip(id: string) {
    const tooltip = this.tooltips.get(id);

    if (tooltip) {
      // Update tooltip to be invisible
      const updatedTooltip = tooltip.update({ visible: false });
      this.tooltips.set(id, updatedTooltip);

      if (this.activeTooltip === id) {
        this.activeTooltip = null;
      }
    }
  }

  // Hide all tooltips
  hideAllTooltips() {
    this.tooltips.forEach((tooltip, id) => {
      this.hideTooltip(id);
    });
    this.activeTooltip = null;
  }

  // Remove a tooltip completely
  removeTooltip(id: string) {
    const tooltip = this.tooltips.get(id);

    if (tooltip && this.tooltipLayer) {
      // Find and remove the tooltip's SVG elements
      const tooltipElements = this.tooltipLayer.querySelectorAll(`[data-tooltip-id="${id}"]`);
      tooltipElements.forEach(el => el.remove());

      this.tooltips.delete(id);

      if (this.activeTooltip === id) {
        this.activeTooltip = null;
      }
    }
  }

  // Get a tooltip by ID
  getTooltip(id: string) {
    return this.tooltips.get(id);
  }

  // Check if a tooltip is currently visible
  isTooltipVisible(id: string): boolean {
    const tooltip = this.tooltips.get(id);
    return tooltip ? tooltip.props.visible : false;
  }

  // Add event listeners to an element for showing/hiding tooltips
  addTooltipTrigger(
    element: HTMLElement | SVGElement,
    content: any,
    options: {
      id?: string;
      position?: string;
      offsetX?: number;
      offsetY?: number;
      behavior?: string;
      style?: any;
      showEvent?: string;
      hideEvent?: string;
    } = {}
  ) {
    const id = options.id || `tooltip-${Math.random().toString(36).substr(2, 9)}`;
    const behavior = options.behavior || 'hover';
    const showEvent = options.showEvent || (behavior === 'hover' ? 'mouseenter' : 'click');
    const hideEvent = options.hideEvent || (behavior === 'hover' ? 'mouseleave' : 'click');

    // Show tooltip handler
    const showHandler = (event: Event) => {
      // Calculate position relative to the container
      let x, y;

      if (event instanceof MouseEvent) {
        const rect = this.container.getBoundingClientRect();
        x = event.clientX - rect.left;
        y = event.clientY - rect.top;
      } else {
        // For non-mouse events, position relative to the element
        const rect = element.getBoundingClientRect();
        const containerRect = this.container.getBoundingClientRect();
        x = rect.left + rect.width / 2 - containerRect.left;
        y = rect.top - containerRect.top;
      }

      this.showTooltip(id, content, x, y, options);
    };

    // Hide tooltip handler
    const hideHandler = () => {
      if (behavior !== 'fixed') {
        this.hideTooltip(id);
      }
    };

    // Add event listeners
    element.addEventListener(showEvent, showHandler);

    if (hideEvent && behavior !== 'fixed') {
      element.addEventListener(hideEvent, hideHandler);
    }

    // Return a function to remove the event listeners
    return () => {
      element.removeEventListener(showEvent, showHandler);

      if (hideEvent && behavior !== 'fixed') {
        element.removeEventListener(hideEvent, hideHandler);
      }

      this.removeTooltip(id);
    };
  }

  // Clean up all tooltips and event listeners
  dispose() {
    // Remove all tooltips
    this.tooltips.forEach((_, id) => {
      this.removeTooltip(id);
    });

    // Remove tooltip layer
    if (this.tooltipLayer && this.tooltipLayer.parentNode) {
      this.tooltipLayer.parentNode.removeChild(this.tooltipLayer);
    }

    this.tooltips.clear();
    this.activeTooltip = null;
    this.tooltipLayer = null;
  }
}

// Factory function to create a tooltip manager
export function createTooltipManager(container: HTMLElement | SVGElement): TooltipManager {
  return new TooltipManager(container);
}
