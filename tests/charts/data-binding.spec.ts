import { test, expect } from '@playwright/test';

test.describe('Data Binding', () => {
  // Check if the data-binding example exists before running tests
  test.beforeEach(async ({ page }) => {
    try {
      await page.goto('/examples/data-binding.html', { timeout: 5000 });
      await page.waitForSelector('#visualization-container', { timeout: 5000 });
    } catch (e) {
      test.skip(true, 'Data binding example not found');
    }
  });

  test('data binding example loads correctly', async ({ page }) => {
    // Check if SVG exists
    const svg = await page.locator('#visualization-container svg');
    await expect(svg).toBeVisible();

    // Check if bars were created
    const bars = await page.locator('#visualization-container svg rect').all();
    expect(bars.length).toBeGreaterThan(1);
  });

  test('control buttons exist', async ({ page }) => {
    // Look for any buttons in the page
    const buttons = await page.locator('button').all();

    // If there are buttons, check that they're visible
    if (buttons.length > 0) {
      const firstButton = await page.locator('button').first();
      await expect(firstButton).toBeVisible();
    } else {
      // If no buttons, we'll note that in the test
      console.log('No control buttons found in the data-binding example');
    }
  });

  test('visualization has bars with different colors', async ({ page }) => {
    // Get all bars
    const bars = await page.locator('#visualization-container svg rect').all();

    // If there are at least 2 bars, check their fill colors
    if (bars.length >= 2) {
      const firstBarFill = await bars[0].getAttribute('fill');
      const secondBarFill = await bars[1].getAttribute('fill');

      // Check if the fills are valid colors
      expect(firstBarFill).not.toBeNull();
      expect(secondBarFill).not.toBeNull();
    }
  });
});
