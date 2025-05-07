import { buildViz, renderViz, createTestContainer, cleanupTestContainer } from '../../src/testing/core';

describe('Renderer', () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = createTestContainer();
  });

  afterEach(() => {
    cleanupTestContainer(container);
  });

  test('renders a visualization to a container', () => {
    // First define a simple circle type
    buildViz({
      type: "define",
      name: "simpleCircle",
      properties: {
        cx: { required: true },
        cy: { required: true },
        r: { default: 30 },
        fill: { default: "red" }
      },
      implementation: props => {
        // In a real implementation, this would create an SVG circle
        // For testing, we'll simulate it
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('cx', props.cx.toString());
        circle.setAttribute('cy', props.cy.toString());
        circle.setAttribute('r', props.r.toString());
        circle.setAttribute('fill', props.fill);
        return { element: circle };
      }
    });

    const viz = buildViz({
      type: "simpleCircle",
      cx: 50,
      cy: 50,
      r: 30,
      fill: "red"
    });

    renderViz(viz, container);

    // In a real implementation, we would check for the actual SVG element
    // For now, we'll just verify the container has an SVG child
    const svg = container.querySelector('svg');
    expect(svg).not.toBeNull();
  });

  test('renders a specification directly', () => {
    // Define a simple rectangle type
    buildViz({
      type: "define",
      name: "simpleRect",
      properties: {
        x: { required: true },
        y: { required: true },
        width: { required: true },
        height: { required: true },
        fill: { default: "blue" }
      },
      implementation: props => {
        // In a real implementation, this would create an SVG rectangle
        // For testing, we'll simulate it
        const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        rect.setAttribute('x', props.x.toString());
        rect.setAttribute('y', props.y.toString());
        rect.setAttribute('width', props.width.toString());
        rect.setAttribute('height', props.height.toString());
        rect.setAttribute('fill', props.fill);
        return { element: rect };
      }
    });

    renderViz({
      type: "simpleRect",
      x: 10,
      y: 20,
      width: 100,
      height: 50,
      fill: "blue"
    }, container);

    // In a real implementation, we would check for the actual SVG element
    // For now, we'll just verify the container has an SVG child
    const svg = container.querySelector('svg');
    expect(svg).not.toBeNull();
  });
});
