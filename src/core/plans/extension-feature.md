# Extension Feature Implementation Plan

## Overview

The extension feature allows one visualization type to extend another, inheriting properties and behavior. This document outlines how the extension mechanism should work and provides a plan for implementing it properly.

## Current State

Currently, the extension mechanism:
- Merges properties from the base type with the extending type
- Does not clearly define how implementations should interact
- Lacks documentation on how to properly use the extension feature
- Has limited testing

## Goals

1. Define a clear model for how extension works
2. Implement proper property inheritance
3. Define how implementations interact
4. Document the extension feature
5. Add comprehensive tests
6. Provide examples of proper usage

## Extension Model

### Property Inheritance

Properties should be inherited from the base type and can be:
- Used as-is from the base type
- Overridden with new defaults or constraints
- Extended with additional properties

The inheritance should follow these rules:
1. All properties from the base type are inherited
2. Properties defined in the extending type override those from the base type
3. Property validation and constraints from the base type should still apply unless explicitly overridden

### Implementation Inheritance

The implementation function should:
1. Receive the base type's implementation as a parameter
2. Be able to call the base implementation with modified properties
3. Override specific behaviors while inheriting others
4. Have access to all methods and properties of the base implementation

## Implementation Plan

### Phase 1: Core Extension Mechanism

1. Update the `define` type to properly handle the `extend` property:
   - Validate that the extended type exists
   - Merge properties correctly
   - Pass the base implementation to the extending implementation

2. Modify the `decompose` method to:
   - Retrieve the base type implementation
   - Call the extending implementation with the base implementation
   - Handle property inheritance correctly

### Phase 2: Testing and Validation

1. Create unit tests for the extension mechanism:
   - Test property inheritance
   - Test implementation inheritance
   - Test method overriding
   - Test complex inheritance chains

2. Create example types that use extension:
   - Simple extension (like layer extending group)
   - Multi-level extension
   - Extension with property overrides

### Phase 3: Documentation and Examples

1. Update the define.md design document to include extension details
2. Add examples of extension to the documentation
3. Create a specific extension.md document with best practices
4. Update JSDoc comments in the code

## Detailed Implementation Tasks

### Task 1: Update Define Type

```typescript
// In src/core/define.ts

function handleExtension(spec, registry) {
  if (!spec.extend) return spec;

  const baseType = registry.getType(spec.extend);
  if (!baseType) {
    throw new Error(`Cannot extend non-existent type: ${spec.extend}`);
  }

  // Merge properties
  const mergedProperties = {
    ...baseType.properties,
    ...spec.properties
  };

  // Create a wrapper for the implementation
  const wrappedImplementation = (props) => {
    // Get the base implementation
    const baseImplementation = (baseProps) => baseType.decompose(baseProps, {});

    // Call the extending implementation with the base implementation
    return spec.implementation(props, baseImplementation);
  };

  return {
    ...spec,
    properties: mergedProperties,
    _originalImplementation: spec.implementation,
    implementation: wrappedImplementation
  };
}
```

### Task 2: Update Decompose Method

```typescript
// In src/core/registry.ts or where decompose is defined

function decompose(spec, context) {
  // Handle extension if this type extends another
  if (this.extend) {
    const baseType = registry.getType(this.extend);
    const baseImplementation = (props) => baseType.decompose(props, context);

    // Call the implementation with the base implementation
    return this._originalImplementation(spec, baseImplementation);
  }

  // Regular implementation without extension
  return this.implementation(spec);
}
```

### Task 3: Create Test Cases

```typescript
// In src/core/define.test.ts

describe('Extension Mechanism', () => {
  test('should inherit properties from base type', () => {
    // Define base type
    buildViz({
      type: 'define',
      name: 'baseType',
      properties: {
        prop1: { default: 'base1' },
        prop2: { default: 'base2' }
      },
      implementation: (props) => ({ type: 'baseType', props })
    });

    // Define extending type
    buildViz({
      type: 'define',
      name: 'extendingType',
      extend: 'baseType',
      properties: {
        prop2: { default: 'override2' },
        prop3: { default: 'new3' }
      },
      implementation: (props) => ({ type: 'extendingType', props })
    });

    // Test property inheritance
    const extendingType = getType('extendingType');
    expect(extendingType.properties.prop1.default).toBe('base1');
    expect(extendingType.properties.prop2.default).toBe('override2');
    expect(extendingType.properties.prop3.default).toBe('new3');
  });

  test('should call base implementation when extended', () => {
    // Define base type with a spy
    const baseImplementationSpy = vi.fn().mockReturnValue({ type: 'baseResult' });
    buildViz({
      type: 'define',
      name: 'baseWithSpy',
      properties: {},
      implementation: baseImplementationSpy
    });

    // Define extending type
    const extendingImplementationSpy = vi.fn().mockReturnValue({ type: 'extendedResult' });
    buildViz({
      type: 'define',
      name: 'extendingWithSpy',
      extend: 'baseWithSpy',
      properties: {},
      implementation: extendingImplementationSpy
    });

    // Build an instance of the extending type
    buildViz({ type: 'extendingWithSpy' });

    // Verify the extending implementation was called with the base implementation
    expect(extendingImplementationSpy).toHaveBeenCalled();
    expect(extendingImplementationSpy.mock.calls[0].length).toBe(2);
    expect(typeof extendingImplementationSpy.mock.calls[0][1]).toBe('function');
  });
});
```

## Example: Layer Extending Group

```typescript
// Layer implementation using extension
export const layerTypeDefinition = {
  type: "define",
  name: "layer",
  extend: "group",
  properties: {
    zIndex: { default: 0 }
  },
  implementation: (props, baseImplementation) => {
    // Get the base implementation (group)
    const baseViz = baseImplementation(props);

    // Extend with layer-specific behavior
    return {
      ...baseViz,
      renderableType: "layer",

      renderToSvg: (svg) => {
        const element = baseViz.renderToSvg(svg);

        // Add layer-specific behavior
        if (props.zIndex !== 0) {
          element.setAttribute('style', `z-index: ${props.zIndex}`);
        }

        return element;
      },

      // Override other methods as needed...
    };
  }
};
```

## Timeline

- Week 1: Implement core extension mechanism
- Week 2: Create tests and fix issues
- Week 3: Document and create examples
- Week 4: Review and refine

## Success Criteria

1. All tests pass
2. Layer can successfully extend Group
3. Documentation is clear and comprehensive
4. At least 3 examples of extension are implemented
5. Code review passes

## Risks and Mitigations

1. **Risk**: Breaking existing types
   **Mitigation**: Comprehensive testing of all existing types

2. **Risk**: Performance impact from additional indirection
   **Mitigation**: Benchmark before and after implementation

3. **Risk**: Complexity in deep inheritance chains
   **Mitigation**: Document best practices and recommend shallow inheritance
