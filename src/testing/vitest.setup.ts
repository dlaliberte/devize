import { initializeLibrary } from '../core/devize';

// Set up JSDOM for SVG support
document.createElementNS = (namespaceURI, qualifiedName) => {
  return document.createElement(qualifiedName);
};

// Initialize the library
initializeLibrary();
