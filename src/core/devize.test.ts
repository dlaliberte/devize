import { describe, test, expect, beforeEach, afterEach } from 'vitest';
import {
  initializeLibrary,
  registerData,
  getData,
  updateViz,
  ensureSvg
} from './devize';
import { registerType, getType, hasType, _resetRegistryForTesting } from './registry';

/**
 * Unit Tests for the Devize Core Module
 *
 * This file contains tests for the devize.ts module which serves as the main entry point
 * for the Devize visualization library.
 *
 * Test Structure:
 * 1. Library Initialization: Tests for the initialization process
 * 2. Data Registry: Tests for registering and retrieving data
 * 3. Visualization Update: Tests for updating visualizations
 * 4. DOM Utilities: Tests for DOM manipulation utilities
 *
 * Related Documents:
 * - Design Document: design/devize_system.md
 */

// Reset the registry before each test
beforeEach(() => {
  _resetRegistryForTesting();
});

describe('Devize Core Module', () => {
  describe('Library Initialization', () => {
    test('should register primitive types during initialization', () => {
      // Call the initialization function
      initializeLibrary();

      // Verify that primitive types are registered
      // We can check for a few key primitive types
      expect(hasType('rectangle')).toBe(true);
      expect(hasType('circle')).toBe(true);
      expect(hasType('text')).toBe(true);
      expect(hasType('group')).toBe(true);
    });

    test('should register the define type during initialization', () => {
      // Call the initialization function
      initializeLibrary();

      // Verify that the define type is registered
      expect(hasType('define')).toBe(true);

      // Verify that the define type has the expected properties
      const defineType = getType('define');
      expect(defineType).toBeDefined();
      expect(defineType?.requiredProps).toContain('name');
      expect(defineType?.requiredProps).toContain('properties');
      expect(defineType?.requiredProps).toContain('implementation');
    });
  });

  describe('Data Registry', () => {
    test('should register and retrieve data', () => {
      // Register some test data
      const testData = [
        { id: 1, name: 'Item 1', value: 100 },
        { id: 2, name: 'Item 2', value: 200 },
        { id: 3, name: 'Item 3', value: 300 }
      ];

      registerData('testData', testData);

      // Retrieve the data
      const retrievedData = getData('testData');

      // Verify that the retrieved data matches the registered data
      expect(retrievedData).toEqual(testData);
    });

    test('should return undefined for non-existent data', () => {
      // Retrieve non-existent data
      const retrievedData = getData('nonExistentData');

      // Verify that undefined is returned
      expect(retrievedData).toBeUndefined();
    });

    test('should update existing data', () => {
      // Register initial data
      const initialData = { count: 10 };
      registerData('counter', initialData);

      // Update the data
      const updatedData = { count: 20 };
      registerData('counter', updatedData);

      // Retrieve the data
      const retrievedData = getData('counter');

      // Verify that the retrieved data matches the updated data
      expect(retrievedData).toEqual(updatedData);
    });
  });

  describe('Visualization Update', () => {
    test('should throw error for invalid visualization instance', () => {
      // Try to update an invalid visualization instance
      expect(() => {
        updateViz(null, { type: 'rectangle' });
      }).toThrow('Invalid visualization instance');

      expect(() => {
        updateViz({}, { type: 'rectangle' });
      }).toThrow('Invalid visualization instance');

      expect(() => {
        updateViz({ notSpec: {} }, { type: 'rectangle' });
      }).toThrow('Invalid visualization instance');
    });

    // Note: Testing the actual update functionality would require integration with createViz,
    // which we're trying to avoid mocking. We'll test this in integration tests.
  });

  describe('DOM Utilities', () => {
    test('should create an SVG element if none exists', () => {
      // Create a mock container element
      const container = document.createElement('div');

      // Call ensureSvg
      const svg = ensureSvg(container);

      // Verify that an SVG element was created
      expect(svg.tagName.toLowerCase()).toBe('svg');
      expect(svg.getAttribute('width')).toBe('100%');
      expect(svg.getAttribute('height')).toBe('100%');
      expect(container.querySelector('svg')).toBe(svg);
    });

    test('should return existing SVG element if one exists', () => {
      // Create a mock container element with an SVG element
      const container = document.createElement('div');
      const existingSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      existingSvg.setAttribute('data-test', 'existing-svg');
      container.appendChild(existingSvg);

      // Call ensureSvg
      const svg = ensureSvg(container);

      // Verify that the existing SVG element was returned
      expect(svg).toBe(existingSvg);
      expect(svg.getAttribute('data-test')).toBe('existing-svg');
    });
  });
});
