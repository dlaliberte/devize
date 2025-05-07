import { buildViz } from '../../src/testing/core';

describe('Builder', () => {
  test('processes a simple visualization', () => {
    const viz = buildViz({
      type: "rectangle",
      x: 10,
      y: 20,
      width: 100,
      height: 50,
      fill: "blue"
    });

    expect(viz.type).toBe('rectangle');
    expect(viz.spec.x).toBe(10);
    expect(viz.spec.y).toBe(20);
    expect(viz.spec.width).toBe(100);
    expect(viz.spec.height).toBe(50);
    expect(viz.spec.fill).toBe('blue');
    expect(typeof viz.render).toBe('function');
    expect(typeof viz.renderToSvg).toBe('function');
    expect(typeof viz.renderToCanvas).toBe('function');
  });

  test('applies default values', () => {
    // First define a type with defaults
    buildViz({
      type: "define",
      name: "testCircle",
      properties: {
        cx: { required: true },
        cy: { required: true },
        r: { default: 10 },
        fill: { default: "red" }
      },
      implementation: props => ({
        type: "circle",
        cx: props.cx,
        cy: props.cy,
        r: props.r,
        fill: props.fill
      })
    });

    // Now use it with missing optional properties
    const viz = buildViz({
      type: "testCircle",
      cx: 50,
      cy: 50
      // r and fill should get defaults
    });

    expect(viz.spec.cx).toBe(50);
    expect(viz.spec.cy).toBe(50);
    expect(viz.spec.r).toBe(10); // Default value applied
    expect(viz.spec.fill).toBe("red"); // Default value applied
  });

  test('throws error for missing required properties', () => {
    // Define a type with required properties
    buildViz({
      type: "define",
      name: "testRect",
      properties: {
        x: { required: true },
        y: { required: true },
        width: { required: true },
        height: { required: true }
      },
      implementation: props => ({
        type: "rectangle",
        x: props.x,
        y: props.y,
        width: props.width,
        height: props.height
      })
    });

    // Should throw when missing required properties
    expect(() => {
      buildViz({
        type: "testRect",
        x: 10,
        y: 20
        // Missing width and height
      });
    }).toThrow();
  });
});
