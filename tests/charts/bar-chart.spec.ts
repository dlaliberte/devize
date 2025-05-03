// @ts-check
import { test, expect } from '@playwright/test';

test.describe('Bar Chart', () => {
      test('bar chart renders correctly', async ({ page }) => {
        await page.goto('/examples/bar-chart.html');

        // Check if SVG exists
        const svg = await page.locator('svg');
        await expect(svg).toBeVisible();

        // Check if bars were created
        const bars = await page.locator('svg rect').all();
        expect(bars.length).toBeGreaterThan(1);

        // Check if labels were created
        const texts = await page.locator('svg text').all();
        expect(texts.length).toBeGreaterThan(1);
      });

      test('bar chart update works', async ({ page }) => {
        await page.goto('/examples/bar-chart.html');

        // Get initial bar heights
        const initialBars = await page.locator('svg rect').all();
        const initialHeights = [];
        for (const bar of initialBars) {
          const height = await bar.getAttribute('height');
          if (height) {
            initialHeights.push(parseFloat(height));
          }
        }

        // Click the update button
        await page.click('#update-button');

        // Wait for any animations or updates
        await page.waitForTimeout(500);

        // Get updated bar heights
        const updatedBars = await page.locator('svg rect').all();
        const updatedHeights = [];
        for (const bar of updatedBars) {
          const height = await bar.getAttribute('height');
          if (height) {
            updatedHeights.push(parseFloat(height));
          }
        }

        // Check if the heights have changed
        expect(updatedHeights).not.toEqual(initialHeights);
        expect(updatedHeights.length).toBe(initialHeights.length);
      });

      test('bar chart has correct structure', async ({ page }) => {
        await page.goto('/examples/bar-chart.html');

        // Check if SVG exists
        const svg = await page.locator('svg');
        await expect(svg).toBeVisible();

        // Check if there are rectangles for bars
        const rects = await page.locator('svg rect').all();
        expect(rects.length).toBeGreaterThan(1);

        // Check if there are text elements for labels
        const texts = await page.locator('svg text').all();
        expect(texts.length).toBeGreaterThan(1);

        // Check if the first bar has the expected attributes
        const firstBar = await page.locator('svg rect').first();
        const width = await firstBar.getAttribute('width');
        expect(width).not.toBeNull();

        const height = await firstBar.getAttribute('height');
        expect(height).not.toBeNull();

        const fill = await firstBar.getAttribute('fill');
        expect(fill).toBe('steelblue');
      });
});
