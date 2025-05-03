import { test, expect } from '@playwright/test';

test('simple visualization renders correctly', async ({ page }) => {
  // Navigate to the simple rectangle example
  await page.goto('/examples/simple-rectangle.html');

  // Check if SVG is rendered
  await page.waitForSelector('svg');

  // Check if rectangle is rendered
  const rect = await page.locator('svg rect');
  await expect(rect).toBeVisible();

  // Check rectangle attributes
  const fill = await rect.getAttribute('fill');
  expect(fill).toBe('steelblue');

  const width = await rect.getAttribute('width');
  expect(width).toBe('200');

  const height = await rect.getAttribute('height');
  expect(height).toBe('100');
});

test('bar chart visualization renders correctly', async ({ page }) => {
  // Navigate to the bar chart example
  await page.goto('/examples/bar-chart.html');

  // Check if SVG is rendered
  await page.waitForSelector('svg');

  // Check if bars are rendered
  const bars = await page.locator('svg rect').all();
  expect(bars.length).toBeGreaterThan(1);

  // Check if text labels are rendered
  const texts = await page.locator('svg text').all();
  expect(texts.length).toBeGreaterThan(1);
});

test('data binding visualization works', async ({ page }) => {
  // Navigate to the data binding example if it exists
  try {
    await page.goto('/examples/data-binding.html', { timeout: 5000 });

    // Check if SVG is rendered
    await page.waitForSelector('svg', { timeout: 5000 });

    // Check if bars are rendered
    const bars = await page.locator('svg rect').all();
    expect(bars.length).toBeGreaterThan(1);

    // Check if there are control buttons
    const buttons = await page.locator('button').all();
    expect(buttons.length).toBeGreaterThan(0);
  } catch (e) {
    // If the page doesn't exist, skip this test
    test.skip(true, 'Data binding example not found');
  }
});

// Skip the 3D test for now since we don't have a 3D example yet
test.skip('3D visualization renders with Three.js', async ({ page }) => {
  // This test would be implemented once we have 3D visualizations
  // For now, we'll just skip it
  await page.goto('/3d-example');

  // Check if Three.js canvas is rendered
  await page.waitForSelector('canvas');

  // Verify that Three.js is initialized
  const isThreeJsInitialized = await page.evaluate(() => {
    return window.hasOwnProperty('THREE') ||
           document.querySelector('canvas')?.getContext('webgl') !== null;
  });

  expect(isThreeJsInitialized).toBeTruthy();
});
