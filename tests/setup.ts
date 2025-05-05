// Global test setup
import { afterEach } from 'vitest';

// Clean up after each test
afterEach(() => {
  // Remove any added elements from the document body
  document.body.innerHTML = '';
});
