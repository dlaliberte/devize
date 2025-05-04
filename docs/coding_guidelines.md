# Coding Guidelines for Small, Maintainable Codebases

## Overview
These guidelines aim to promote a codebase that is easy to navigate, understand, and modify. By adhering to them, developers are encouraged to produce clear and maintainable code through the use of small files and concise functions, along with thorough documentation and referencing.

## 1. File Size and Structure
- **Small Files**: Cap the file size to a specified logical maximum (e.g., 200-300 lines). This ensures files remain manageable and easily readable.
- **Single Responsibility**: Each file should serve a single purpose or provide a distinct piece of functionality or component.

## 2. Function Design
- **Concise Functions**: Limit functions to 30-50 lines of code. A function should accomplish one task or closely related tasks.
- **Meaningful Names**: Use descriptive function names to clearly communicate what the function does.
- **Minimize Parameters**: Keep the number of function parameters to a minimum; prefer using data structures whenever possible.

## 3. Documentation and References
- **Inline Comments**: Add comments within the code to explain complex logic or business rules.
- **Reference Lists**: Every file should include a section listing references to related files, design documentation, user documentation, and tests.

  **Example:**
  ```plaintext
  <!-- References -->
  - Related File: /path/to/related_file.py
  - Design Document: /docs/design_doc.md
  - User Documentation: /docs/user_doc.md
  - Test Cases: /tests/related_tests.py
  ```

## 4. File Header Comments
- Each file should begin with a comment block outlining:
  - **Purpose**: Briefly describe what the file implements.
  - **Author**: Who authored or last modified the file.
  - **Creation Date**: When the file was initially created.
  - **Last Modification Date**: The date of the last modification.

## 5. Code Review and Continuous Improvement
- Encourage regular code reviews focused on the readability and adherence to these guidelines.
- Maintain a culture of refactoring—continuously seek opportunities to simplify and modernize existing code.

## 6. Consistent Style Guides
- Follow language-specific coding styles (e.g., PEP 8 for Python) to ensure consistent syntax and conventions are maintained across the codebase.


## Design Rules for Devize Visualizations

1. Use type: "define" to define new visualization types

- All custom visualization types should be defined using the "define" type
- This provides a consistent way to create and register new components

2. Prefer declarative implementations

- When possible, implementations should be declarative compositions of other visualizations
- Only use functions for logic that cannot be expressed declaratively
- This makes components more readable and maintainable
- If a new viz component would make it easier to implement other components declaratively, consider doing so.

3. Include direct dependencies only

- Each visualization file should import only its direct dependencies
- Indirect dependencies should be loaded by direct dependencies
- This prevents duplicate imports and ensures proper dependency management

4. Self-registration on import

- Visualization types should register themselves when imported
- This ensures they're available when needed without explicit registration calls

5. Consistent naming conventions

- Use camelCase for component names
- Use descriptive names that indicate the component's purpose
-

## Conclusion
Adhering to these guidelines will lead to a streamlined development process, facilitating ease of maintenance, improved code readability, and quicker onboarding of new developers.

## 7. Visualization Design Principles

### Functional vs. Rendering Visualizations

- **Functional Visualizations**: Many visualizations ("vizes") should be designed as pure data transformations that don't render directly to the DOM.
  - These should return transformed data that can be consumed by other visualizations.
  - Prefer functional approaches when possible for better composability and testability.

- **Rendering Visualizations**: Only visualizations that actually produce visual output should require DOM elements.
  - Container elements should be passed as properties rather than as required parameters.
  - This allows for more flexible composition of visualization pipelines.

- **Context-Aware Design**: Visualizations should be designed to work with the appropriate context:
  - Data transformation vizes should operate on and return data.
  - Rendering vizes should accept an optional container property.
  - Intermediate vizes might produce partial renderings that are later composed.

### Implementation Guidelines

1. **Minimize Side Effects**: Visualizations should minimize side effects when possible.
2. **Clear Interfaces**: Each visualization should have a clear interface for inputs and outputs.
3. **Composition**: Design visualizations to be easily composable with others.
4. **Temporary Holders**: When intermediate renderings are needed, use temporary holders rather than rendering directly to the final container.
5. **Explicit Context**: Always make the context a visualization operates in explicit in its interface.
