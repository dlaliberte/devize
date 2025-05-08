/**
 * Legend Component Tests
 *
 * Purpose: Tests the legend component
 * Author: [Author Name]
 * Creation Date: [Date]
 * Last Modified: [Date]
 */

import { describe, test, expect, beforeEach } from 'vitest';
import { buildViz } from '../core/builder';
import { registerDefineType } from '../core/define';
import './legend';

// Reset registry and register define type before each test
beforeEach(() => {
  registerDefineType();
});

describe('Legend Component', () => {
  test('should create a color legend with provided items', () => {
    const legend = buildViz({
      type: 'legend',
      title: 'Color Legend',
      type: 'color',
      items: [
        { value: 'Category A', color: '#ff0000' },
        { value: 'Category B', color: '#00ff00' },
        { value: 'Category C', color: '#0000ff' }
      ]
    });

    expect(legend).toBeDefined();
    expect(legend.type).toBe('legend');

    // Render to check the structure
    const rendered = legend.getProperty('implementation');
    expect(rendered.type).toBe('group');
    expect(rendered.children.length).toBeGreaterThan(0);

    // Check title
    const title = rendered.children.find(child => child && child.type === 'text' && child.class === 'legend-title');
    expect(title).toBeDefined();
    expect(title.text).toBe('Color Legend');

    // Check items
    const items = rendered.children.filter(child => child && child.type === 'group' && child.class === 'legend-item');
    expect(items.length).toBe(3);

    // Check first item
    const firstItem = items[0];
    const symbol = firstItem.children.find(child => child && child.type === 'rectangle');
    const label = firstItem.children.find(child => child && child.type === 'text');

    expect(symbol).toBeDefined();
    expect(symbol.fill).toBe('#ff0000');
    expect(label).toBeDefined();
    expect(label.text).toBe('Category A');
  });

  test('should create a size legend with provided items', () => {
    const legend = buildViz({
      type: 'legend',
      title: 'Size Legend',
      type: 'size',
      items: [
        { value: 'Small', size: 5 },
        { value: 'Medium', size: 10 },
        { value: 'Large', size: 15 }
      ]
    });

    expect(legend).toBeDefined();

    // Render to check the structure
    const rendered = legend.getProperty('implementation');

    // Check items
    const items = rendered.children.filter(child => child && child.type === 'group' && child.class === 'legend-item');
    expect(items
