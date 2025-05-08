import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import {
  initializeLibrary,
  registerData,
  getData,
  ensureSvg,
  buildViz,
  renderViz,
  updateViz,
  registerType,
  getType,
  hasType,
  getAllTypes
} from './devize';

describe('Devize Module', () => {
  // Reset data registry before each test
  beforeEach(() => {
    // This is a bit of a hack for testing
    // We need to reset the data registry which is private
    // We'll use the public API to clear it
    const testKeys = Object.keys(getData('__all__') || {});
    testKeys.forEach(key => {
      registerData(key, undefined);
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Core Initialization', () => {
    it('initializes the library', () => {
      // Mock console.log to verify messages
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      // Call initialize
      initializeLibrary();

      // Should log initialization messages
      expect(consoleSpy).toHaveBeenCalled();

      // Restore original console.log
      consoleSpy.mockRestore();
    });
  });

  describe('Data Registry', () => {
    it('registers and retrieves data', () => {
      // Register some data
      registerData('testData', { value: 42 });

      // Retrieve the data
      const data = getData('testData');

      // Check if the data matches
      expect(data).toBeDefined();
      expect(data.value).toBe(42);
    });

    it('returns undefined for non-existent data', () => {
      // Try to retrieve non-existent data
      const data = getData('nonExistentData');

      // Should be undefined
      expect(data).toBeUndefined();
    });

    it('overwrites data when registering with the same name', () => {
      // Register some data
      registerData('testData', { value: 42 });

      // Register again with the same name
      registerData('testData', { value: 100 });

      // Retrieve the data
      const data = getData('testData');

      // Should have the new value
      expect(data.value).toBe(100);
    });
  });

  describe('DOM Utilities', () => {
    it('ensures an SVG element exists in a container', () => {
      // Create a container
      const container = document.createElement('div');

      // Ensure SVG
      const svg = ensureSvg(container);

      // Check if the SVG was created
      expect(svg).toBeDefined();
      expect(svg.tagName.toLowerCase()).toBe('svg');
      expect(container.contains(svg)).toBe(true);

      // Call again to test reuse
      const svg2 = ensureSvg(container);

      // Should be the same SVG
      expect(svg2).toBe(svg);
    });

    it('sets default attributes on the created SVG', () => {
      // Create a container
      const container = document.createElement('div');

      // Ensure SVG
      const svg = ensureSvg(container);

      // Check default attributes
      expect(svg.getAttribute('width')).toBe('100%');
      expect(svg.getAttribute('height')).toBe('100%');
    });
  });

  describe('Public API', () => {
    it('exports core functions', () => {
      // Verify that core functions are exported
      expect(typeof buildViz).toBe('function');
      expect(typeof renderViz).toBe('function');
      expect(typeof updateViz).toBe('function');
    });

    it('exports registry functions', () => {
      // Verify that registry functions are exported
      expect(typeof registerType).toBe('function');
      expect(typeof getType).toBe('function');
      expect(typeof hasType).toBe('function');
      expect(typeof getAllTypes).toBe('function');
    });
  });
});
