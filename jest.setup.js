// Jest setup file
import { initializeLibrary } from './src/core/devize';

// Initialize the library once before all tests
beforeAll(() => {
  // Set up JSDOM for SVG support
  document.createElementNS = (namespaceURI, qualifiedName) => {
    return document.createElement(qualifiedName);
  };

  // Initialize the library
  initializeLibrary();
});
