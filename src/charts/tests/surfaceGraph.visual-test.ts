/**
 * Surface Graph Component Playwright Tests
 *
 * Purpose: Tests the surface graph visualization in a real browser environment
 * Author: Cody
 * Creation Date: 2023-12-22
 */

import { test, expect } from '@playwright/test';
import path from 'path';

// Test the surface graph in a real browser environment
test('should render a surface graph with Three.js', async ({ page }) => {
  // Navigate to the surface graph example
  await page.goto('http://localhost:3000/examples/surface-graph.html');

  // Wait for the page to load
  await page.waitForSelector('#basic-surface-graph');

  // Check that the canvas was created (Three.js renders to canvas)
  const canvas = await page.locator('#basic-surface-graph canvas');
  await expect(canvas).toBeVisible();

  // Take a screenshot for visual verification
  await page.screenshot({ path: 'test-results/surface-graph.png' });
});

// Test the interactive features
test('should respond to user interactions', async ({ page }) => {
  // Navigate to the surface graph example
  await page.goto('http://localhost:3000/examples/surface-graph.html');

  // Wait for the page to load
  await page.waitForSelector('#interactive-surface-graph');

  // Click the wireframe toggle button
  await page.click('#toggle-wireframe-btn');

  // Check that the wireframe state changed (we can't directly check the Three.js state,
  // but we can verify the button's active state changed)
  const wireframeBtn = await page.locator('#toggle-wireframe-btn');
  await expect(wireframeBtn).toHaveClass(/active/);

  // Click the color scheme button
  await page.click('#change-colors-btn');

  // Take a screenshot after interaction
  await page.screenshot({ path: 'test-results/surface-graph-after-interaction.png' });
});

// Test different surface types
test('should render different surface types', async ({ page }) => {
  // Navigate to the surface graph example
  await page.goto('http://localhost:3000/examples/surface-graph.html');

  // Wait for the page to load
  await page.waitForSelector('#surface-types');

  // Click each surface type button and take screenshots
  const surfaceTypes = ['sine-wave', 'peaks', 'ripple'];

  for (const type of surfaceTypes) {
    await page.click(`#${type}-btn`);
    await page.waitForTimeout(500); // Wait for animation to settle
    await page.screenshot({ path: `test-results/surface-graph-${type}.png` });
  }
});
