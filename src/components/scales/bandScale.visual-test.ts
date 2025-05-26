import { test, expect } from '@playwright/test';
import { readFileSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Fix for __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

test.describe('Band Scale Component', () => {
  test.beforeEach(async ({ page }) => {
    const htmlContent = readFileSync(join(__dirname, 'test-fixtures/bandScale-test.html'), 'utf-8');
    await page.setContent(htmlContent);
  });

  test('should render band scale with default padding', async ({ page }) => {
    const scriptContent = readFileSync(join(__dirname, 'test-fixtures/bandScale-basic-tests.js'), 'utf-8');
    await page.addScriptTag({ content: scriptContent });

    // Take screenshots
    await page.screenshot({
      path: 'test-results/bandScale-overview.png',
      fullPage: true
    });

    // Verify visualizations were created
    const containers = await page.locator('.test-container').count();
    expect(containers).toBeGreaterThan(0);

    // Take individual screenshots
    const testContainers = page.locator('.test-container');
    const count = await testContainers.count();

    for (let i = 0; i < count; i++) {
      await testContainers.nth(i).screenshot({
        path: `test-results/bandScale-case-${i + 1}.png`
      });
    }
  });

  test('should handle edge cases', async ({ page }) => {
    const scriptContent = readFileSync(join(__dirname, 'test-fixtures/bandScale-edge-cases.js'), 'utf-8');
    await page.addScriptTag({ content: scriptContent });

    await page.screenshot({
      path: 'test-results/bandScale-edge-cases.png',
      fullPage: true
    });
  });

  test('should validate scale calculations', async ({ page }) => {
    const validationScript = readFileSync(join(__dirname, 'test-fixtures/bandScale-validation.js'), 'utf-8');

    const results = await page.evaluate((script) => {
      // Execute the validation script
      eval(script);
      // Run validation tests
      return window.runValidationTests();
    }, validationScript);

    expect(results.allTestsPassed).toBe(true);
    expect(results.errors).toHaveLength(0);
  });
});
