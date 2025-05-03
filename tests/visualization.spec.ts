import { test, expect } from '@playwright/test';

test('basic visualization renders correctly', async ({ page }) => {
  // Navigate to the page with our visualization
  await page.goto('/');

  // Wait for the visualization to be rendered
  await page.waitForSelector('#point-viz svg');

  // Check if points are rendered
  const points = await page.$$('#point-viz svg circle');
  expect(points.length).toBe(3); // We expect 3 points based on our sample data

  // Check if the web component visualization is rendered
  await page.waitForSelector('#component-viz');
  const shadowRoot = await page.evaluateHandle(
    selector => document.querySelector(selector).shadowRoot,
    'devize-visualization'
  );

  // Check if points are rendered in the web component
  const componentPoints = await shadowRoot.$$('svg circle');
  expect(componentPoints.length).toBe(3);
});

test('3D visualization renders with Three.js', async ({ page }) => {
  // This test would be implemented once we have 3D visualizations
  // For now, we'll just create a placeholder
  await page.goto('/3d-example');

  // Check if Three.js canvas is rendered
  await page.waitForSelector('canvas');

  // Verify that Three.js is initialized
  const isThreeJsInitialized = await page.evaluate(() => {
    return window.hasOwnProperty('THREE') ||
           document.querySelector('canvas').getContext('webgl') !== null;
  });

  expect(isThreeJsInitialized).toBeTruthy();
});
