// Create a visualization from a specification
function buildViz(spec, container) {
  // Parse and validate spec
  const parsedSpec = parseSpec(spec);

  // Create visualization instance
  const viz = new Visualization(parsedSpec);

  // Render to container
  viz.render(container);

  return viz;
}

// Update an existing visualization
function updateViz(viz, newSpec) {
  // Merge specifications
  const updatedSpec = mergeSpecs(viz.spec, newSpec);

  // Update and re-render
  viz.update(updatedSpec);

  return viz;
}
