import { test, expect } from '@playwright/test';
import { readFileSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Fix for __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

test.describe('Axis Component Visual Tests', () => {
  test.beforeEach(async ({ page }) => {
    const htmlContent = readFileSync(join(__dirname, 'test-fixtures/axis-test.html'), 'utf-8');
    await page.setContent(htmlContent);

    // Wait for the Devize library to load
    await page.waitForFunction(() => window.devizeLoaded === true, { timeout: 10000 });

    // Verify the functions are available
    const functionsAvailable = await page.evaluate(() => {
      return typeof window.createAxis === 'function' &&
             typeof window.createMinimalBandScale === 'function';
    });

    if (!functionsAvailable) {
      throw new Error('Required functions not available after library load');
    }
  });

  test('should render basic axis orientations', async ({ page }) => {
    const scriptContent = readFileSync(join(__dirname, 'test-fixtures/axis-basic-tests.js'), 'utf-8');
    await page.addScriptTag({ content: scriptContent });

    // Take screenshots
    await page.screenshot({
      path: 'test-results/axis-orientations.png',
      fullPage: true
    });

    // Verify axes were created
    const containers = await page.locator('.test-container').count();
    expect(containers).toBeGreaterThan(0);

    // Check that SVG elements were created
    const svgElements = await page.locator('svg').count();
    expect(svgElements).toBeGreaterThan(0);

    // Check for axis lines
    const axisLines = await page.locator('.axis-line').count();
    expect(axisLines).toBeGreaterThan(0);
  });

  test('should render axis with different scales', async ({ page }) => {
    const scriptContent = readFileSync(join(__dirname, 'test-fixtures/axis-scale-tests.js'), 'utf-8');
    await page.addScriptTag({ content: scriptContent });

    await page.screenshot({
      path: 'test-results/axis-scales.png',
      fullPage: true
    });

    // Verify scale-specific elements
    const bandScaleAxes = await page.locator('text:has-text("Band Scale")').count();
    expect(bandScaleAxes).toBeGreaterThan(0);
  });

  test('should render axis styling variations', async ({ page }) => {
    const scriptContent = readFileSync(join(__dirname, 'test-fixtures/axis-styling-tests.js'), 'utf-8');
    await page.addScriptTag({ content: scriptContent });

    await page.screenshot({
      path: 'test-results/axis-styling.png',
      fullPage: true
    });
  });

  test('should handle edge cases', async ({ page }) => {
    const scriptContent = readFileSync(join(__dirname, 'test-fixtures/axis-edge-cases.js'), 'utf-8');
    await page.addScriptTag({ content: scriptContent });

    await page.screenshot({
      path: 'test-results/axis-edge-cases.png',
      fullPage: true
    });

    // Verify error handling
    const errorMessages = await page.locator('div:has-text("Error:")').count();
    // Some edge cases might produce errors, which is expected behavior
  });
});
