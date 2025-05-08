import { vi } from 'vitest';

// Mock document.createElementNS for SVG support
document.createElementNS = (namespaceURI, qualifiedName) => {
  return document.createElement(qualifiedName);
};

// Initialize the library (commented out for now to isolate the issue)
// import { initializeLibrary } from '../core/devize';
// initializeLibrary();

console.log('Vitest setup complete');
