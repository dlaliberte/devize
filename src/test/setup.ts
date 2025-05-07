// Test setup file for Vitest
import { vi } from 'vitest';
import { _resetRegistryForTesting } from '../core/registry';
import { registerDefineType } from '../core/define';

// Mock document methods for SVG creation
global.document = {
  createElementNS: vi.fn((namespace, tagName) => {
    return {
      tagName: tagName.toUpperCase(),
      setAttribute: vi.fn(),
      appendChild: vi.fn(),
      style: {},
      querySelector: vi.fn(),
      textContent: ''
    };
  }),
  createElement: vi.fn((tagName) => {
    return {
      tagName: tagName.toUpperCase(),
      setAttribute: vi.fn(),
      appendChild: vi.fn(),
      style: {}
    };
  })
} as any;

// Mock window object
global.window = {} as any;

// Setup function to reset registry and register define type
export function setupTestEnvironment() {
  // Reset the registry
  _resetRegistryForTesting();

  // Register the define type
  registerDefineType();
}
