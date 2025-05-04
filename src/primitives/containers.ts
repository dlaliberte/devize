// Container primitives
import { VizSpec, VizInstance } from '../core/types';
import { ensureSvg } from '../core/devize';
import { createViz } from '../core/devize';

/**
 * Create a group
 * @param spec The group specification
 * @param container The container element
 * @returns The group instance
 */
export function createGroup(spec: VizSpec, container: HTMLElement): VizInstance {
  const svg = ensureSvg(container);

  // Create group element
  const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');

  // Set transform if provided
  if (spec.transform) {
    group.setAttribute('transform', spec.transform);
  }

  // Set other attributes
  if (spec.opacity) group.setAttribute('opacity', spec.opacity.toString());
  if (spec.id) group.setAttribute('id', spec.id);
  if (spec.className) group.setAttribute('class', spec.className);

  // Add to SVG
  svg.appendChild(group);

  // Create child visualizations
  const children: VizInstance[] = [];
  if (spec.children && Array.isArray(spec.children)) {
    for (const childSpec of spec.children) {
      // Create a temporary container for the child
      const tempContainer = {
        querySelector: () => svg,
        appendChild: () => {} // No-op since we're using the existing SVG
      } as unknown as HTMLElement;

      // Create the child visualization
      const child = createViz(childSpec, tempContainer);

      // If it's a valid child, add it to our children array and to the group
      if (child && child.element) {
        children.push(child);
        group.appendChild(child.element);
      }
    }
  }

  // Return the visualization instance
  return {
    element: group,
    spec: spec,
    children: children
  };
}

/**
 * Create a data map
 * @param spec The data map specification
 * @param container The container element
 * @returns The data map instance
 */
export function createDataMap(spec: VizSpec, container: HTMLElement): VizInstance {
  const svg = ensureSvg(container);

  // Create a group for the mapped elements
  const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');

  // Set transform if provided
  if (spec.transform) {
    group.setAttribute('transform', spec.transform);
  }

  // Add to SVG
  svg.appendChild(group);

  // Ensure data is an array
  const data = Array.isArray(spec.data) ? spec.data : [];

  // Create elements based on data
  const children: VizInstance[] = [];
  data.forEach((item, index) => {
    // Create a template instance for this data item
    let templateSpec;

    if (typeof spec.template === 'function') {
      // If template is a function, call it with the data item
      templateSpec = spec.template(item, index, data);
    } else if (spec.template) {
      // Otherwise, clone the template and add data binding
      templateSpec = JSON.parse(JSON.stringify(spec.template));
      templateSpec._data = item;
      templateSpec._index = index;
    }

    if (!templateSpec) return;

    // Create a temporary container for the child
    const tempContainer = {
      querySelector: () => svg,
      appendChild: () => {} // No-op since we're using the existing SVG
    } as unknown as HTMLElement;

    // Create and append the template instance
    const child = createViz(templateSpec, tempContainer);

    // If it's a valid child, add it to our children array and to the group
    if (child && child.element) {
      children.push(child);
      group.appendChild(child.element);

      // Store data reference for updates
      (child.element as any)._data = item;
      (child.element as any)._index = index;

      // Store key for updates if keyField is specified
      if (spec.keyField && item[spec.keyField] !== undefined) {
        (child.element as any)._key = item[spec.keyField];
      }
    }
  });

  // Return the visualization instance
  return {
    element: group,
    spec: spec,
    children: children
  };
}
