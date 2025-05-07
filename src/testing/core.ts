/**
 * Core testing module that initializes the Devize system for tests
 */
import { initializeLibrary } from '../core/devize';
import { TypeRegistry } from '../core/registry';
import { buildViz } from '../core/builder';
import { renderViz } from '../core/renderer';

// Initialize the library once for all tests
initializeLibrary();

// Export initialized components for tests
export {
  TypeRegistry,
  buildViz,
  renderViz
};

// Export test utilities
export function createTestContainer(): HTMLElement {
  const container = document.createElement('div');
  document.body.appendChild(container);
  return container;
}

export function cleanupTestContainer(container: HTMLElement): void {
  if (container && container.parentNode) {
    container.parentNode.removeChild(container);
  }
}
