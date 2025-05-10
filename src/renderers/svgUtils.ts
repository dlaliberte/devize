/**
 * Apply attributes to an SVG element
 */
export function applyAttributes(element: SVGElement, attributes: Record<string, any>): void {
  for (const [key, value] of Object.entries(attributes)) {
    // Skip null or undefined values
    if (value === null || value === undefined) {
      continue;
    }

    // Convert values to strings
    const stringValue = value.toString();

    // Set the attribute
    element.setAttribute(key, stringValue);
  }
}

/**
 * Create an SVG element with the correct namespace
 */
export function createSVGElement(tagName: string): SVGElement {
    const SVG_NS = 'http://www.w3.org/2000/svg';
    return document.createElementNS(SVG_NS, tagName);
  }

  /**
   * Ensure a container has an SVG element
   */
  export function ensureSvg(container: HTMLElement): SVGElement {
    const SVG_NS = 'http://www.w3.org/2000/svg';
    let svg = container.querySelector('svg');

    if (!svg) {
      svg = document.createElementNS(SVG_NS, 'svg');
      svg.setAttribute('width', '100%');
      svg.setAttribute('height', '100%');
      container.appendChild(svg);
    }

    return svg as SVGElement;
  }
