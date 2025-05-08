/**
 * SVG Rendering Utilities
 *
 * This file provides utility functions for SVG rendering.
 */

/**
 * Create an SVG element with the given attributes
 * @param {string} type - The type of SVG element to create
 * @param {Object} attributes - The attributes to set on the element
 * @returns {SVGElement} The created SVG element
 */
export function createSVGElement(type, attributes = {}) {
  const element = document.createElementNS("http://www.w3.org/2000/svg", type);

  for (const [key, value] of Object.entries(attributes)) {
    if (value !== undefined && value !== null) {
      // Convert camelCase to kebab-case for attributes
      const attributeName = key.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
      element.setAttribute(attributeName, String(value));
    }
  }

  return element;
}

/**
 * Append an SVG element to a container
 * @param {SVGElement} element - The element to append
 * @param {SVGElement} container - The container to append to
 * @returns {SVGElement} The appended element
 */
export function appendSVGElement(element, container) {
  if (container) {
    container.appendChild(element);
  }
  return element;
}

/**
 * Apply common SVG attributes to an element
 * @param {SVGElement} element - The element to apply attributes to
 * @param {Object} attributes - The attributes to apply
 * @returns {SVGElement} The element with applied attributes
 */
export function applySVGAttributes(element, attributes) {
  for (const [key, value] of Object.entries(attributes)) {
    if (value !== undefined && value !== null) {
      // Convert camelCase to kebab-case for attributes
      const attributeName = key.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
      element.setAttribute(attributeName, String(value));
    }
  }
  return element;
}

export function applyAttributes() {}
