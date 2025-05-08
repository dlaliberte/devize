import { describe, it, expect, beforeEach } from 'vitest';
import { registerDefineType, defineTypeSpec } from './define';
import { registry, hasType, getType } from './registry';
import { buildViz } from './builder';

describe('Define Module', () => {
  // Clear registry before each test to ensure clean state
  beforeEach(() => {
    // This is a bit of a hack for testing - in a real implementation
    // we would have a way to reset the registry for tests
    (registry as any).types = new Map();

    // Register the define type for each test
    registerDefineType();
  });

  it('registers the define type', () => {
    // Check if the define type exists
    expect(hasType('define')).toBe(true);

    // Check the properties of the define type
    const defineType = getType('define');
    expect(defineType).toBeDefined();
    expect(defineType?.properties.name.required).toBe(true);
    expect(defineType?.properties.properties.required).toBe(true);
    expect(defineType?.properties.implementation.required).toBe(true);
    expect(defineType?.properties.extend.required).toBe(false);
  });

  it('can define a new type', () => {
    // Define a new type using the define type
    const result = buildViz({
      type: "define",
      name: "testCircle",
      properties: {
        cx: { required: true },
        cy: { required: true },
        r: { default: 10 },
        fill: { default: "red" }
      },
      implementation: (props: any) => ({
        type: "circle",
        cx: props.cx,
        cy: props.cy,
        r: props.r,
        fill: props.fill
      })
    });

    // Verify the result is a renderable visualization
    expect(result).toBeDefined();
    // expect(result.spec.type).toBe('define'); No spec property.
    // Check if the new type exists
    expect(hasType('testCircle')).toBe(true);

    // Check the properties of the new type
    const testCircleType = getType('testCircle');
    expect(testCircleType).toBeDefined();
    expect(testCircleType?.properties.cx.required).toBe(true);
    expect(testCircleType?.properties.r.default).toBe(10);
  });

  it('can extend an existing type', () => {
    // Define a base type
    buildViz({
      type: "define",
      name: "baseRect",
      properties: {
        x: { required: true },
        y: { required: true },
        width: { default: 100 },
        height: { default: 50 }
      },
      implementation: (props: any) => props
    });

    // Verify the base type was registered
    expect(hasType('baseRect')).toBe(true);

    // Define an extended type
    buildViz({
      type: "define",
      name: "coloredRect",
      extend: "baseRect",
      properties: {
        fill: { default: "blue" },
        stroke: { default: "black" }
      },
      implementation: (props: any) => props
    });

    // Check if the extended type exists
    expect(hasType('coloredRect')).toBe(true);

    // Check the properties of the extended type
    const coloredRectType = getType('coloredRect');
    expect(coloredRectType).toBeDefined();
    expect(coloredRectType?.properties.x.required).toBe(true); // Inherited
    expect(coloredRectType?.properties.width.default).toBe(100); // Inherited
    expect(coloredRectType?.properties.fill.default).toBe("blue"); // New
  });

  it('throws an error when extending a non-existent type', () => {
    // Try to extend a non-existent type
    expect(() => {
      buildViz({
        type: "define",
        name: "invalidExtension",
        extend: "nonExistentType",
        properties: {},
        implementation: (props: any) => props
      });
    }).toThrow(/Type 'nonExistentType' does not exist and cannot be extended/);
  });

  it('validates required properties', () => {
    // Missing name
    expect(() => {
      buildViz({
        type: "define",
        properties: {},
        implementation: (props: any) => props
      } as any);
    }).toThrow(/Required property 'name' missing/);

    // Missing properties
    expect(() => {
      buildViz({
        type: "define",
        name: "missingProps",
        implementation: (props: any) => props
      } as any);
    }).toThrow(/Required property 'properties' missing/);

    // Missing implementation
    expect(() => {
      buildViz({
        type: "define",
        name: "missingImpl",
        properties: {}
      } as any);
    }).toThrow(/Required property 'implementation' missing/);
  });

  it('uses the defineTypeSpec constant for consistency', () => {
    // Check that the defineTypeSpec constant matches what's used in registerDefineType
    expect(defineTypeSpec.type).toBe("define");
    expect(defineTypeSpec.name).toBe("define");
    expect(defineTypeSpec.properties).toBeDefined();
    expect(defineTypeSpec.implementation).toBeDefined();

    // Register using the constant
    registry.registerTypeDirectly(defineTypeSpec);

    // Check if it was registered correctly
    expect(hasType('define')).toBe(true);
  });
});
