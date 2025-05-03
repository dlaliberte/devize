// Register a custom visualization type
function registerType(typeDefinition) {
  // Validate type definition
  validateTypeDefinition(typeDefinition);

  // Add to registry
  typeRegistry.add(typeDefinition);
}

// Register a custom constraint type
function registerConstraint(constraintDefinition) {
  // Validate constraint definition
  validateConstraintDefinition(constraintDefinition);

  // Add to registry
  constraintRegistry.add(constraintDefinition);
}
