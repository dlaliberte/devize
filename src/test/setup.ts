// Test setup file for Vitest
import { vi } from 'vitest';
import { _resetRegistryForTesting } from '../core/registry';
import { registerDefineType } from '../core/define';

// Enhance JSDOM with better SVG support
import { JSDOM } from 'jsdom';

// Create a custom JSDOM instance with SVG support
const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', {
  url: 'http://localhost/',
  contentType: 'text/html',
  includeNodeLocations: true,
  storageQuota: 10000000,
  runScripts: 'dangerously'
});

// Add SVG element support
global.SVGElement = dom.window.SVGElement;
global.SVGSVGElement = dom.window.SVGSVGElement;

// Add document and window
global.document = dom.window.document;
global.window = dom.window;
global.navigator = dom.window.navigator;
// Setup function to reset registry and register define type
export function setupTestEnvironment() {
  // Reset the registry
  _resetRegistryForTesting();

  // Register the define type
  registerDefineType();
}
