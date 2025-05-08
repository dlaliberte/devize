import { describe, it, expect, beforeEach } from 'vitest';
import { renderViz, updateViz, ensureSvg } from './renderer';
import { buildViz } from './builder';
import { registerType } from './registry';
import { TypeDefinition } from './types';

describe('Renderer', () => {
  let container: HTMLElement;

  beforeEach(() => {
    // Create a fresh container for each test
    container = document.createElement('div');
    document.body.appendChild(container);

    // Register a simple rectangle type for testing
    const rectType: TypeDefinition = {
      name: 'rectangle',
      properties: {
        x: { required: true },
        y: { required: true },
        width: { required: true },
        height: { required: true },
        fill: { default: 'black' }
      }
    };
    registerType(rectType);
  });
});
