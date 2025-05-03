import { test, expect } from '@playwright/test';

test.describe('Core Devize Functionality', () => {
    test('simple rectangle visualization works', async ({ page }) => {
      // Navigate to the simple rectangle example
      await page.goto('/examples/simple-rectangle.html');

      // Check if the rectangle was created
      const rect = await page.locator('svg rect');
      await expect(rect).toBeVisible();

      // Check rectangle attributes
      const fill = await rect.getAttribute('fill');
      expect(fill).toBe('steelblue');

      const stroke = await rect.getAttribute('stroke');
      expect(stroke).toBe('black');

      const strokeWidth = await rect.getAttribute('stroke-width');
      expect(strokeWidth).toBe('2');

      const width = await rect.getAttribute('width');
      expect(width).toBe('200');

      const height = await rect.getAttribute('height');
      expect(height).toBe('100');
    });

    test('bar chart visualization works', async ({ page }) => {
      // Navigate to the bar chart example
      await page.goto('/examples/bar-chart.html');

      // Check if bars were created
      const bars = await page.locator('svg rect').all();
      expect(bars.length).toBeGreaterThan(1); // Should have multiple bars

      // Check if there are text elements for labels
      const texts = await page.locator('svg text').all();
      expect(texts.length).toBeGreaterThan(1); // Should have labels
    });

    test('SVG is created correctly', async ({ page }) => {
      await page.goto('/examples/simple-rectangle.html');

      // Check if SVG was created
      const svg = await page.locator('svg');
      await expect(svg).toBeVisible();

      // Check SVG attributes
      const width = await svg.getAttribute('width');
      expect(width).toBe('100%');

      const height = await svg.getAttribute('height');
      expect(height).toBe('100%');
    });

    test('data binding visualization works', async ({ page }) => {
      // Navigate to the data binding example
      await page.goto('/examples/data-binding.html');

      // Check if bars were created
      const initialBars = await page.locator('svg rect').all();
      const initialCount = initialBars.length;
      expect(initialCount).toBeGreaterThan(1);

      // Try clicking a filter button if it exists
      const filterButton = await page.locator('button:has-text("Filter")').first();
      if (await filterButton.isVisible()) {
        await filterButton.click();

        // Wait for any updates
        await page.waitForTimeout(500);

        // Check if the number of bars has changed
        const filteredBars = await page.locator('svg rect').all();
        // The number of bars might be different after filtering
        // This is a simple check to see if something changed
        expect(filteredBars.length).not.toBe(0);
      }
    });
});
