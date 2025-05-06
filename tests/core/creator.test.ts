/**
 * Unit Tests for Visualization Creator
 *
 * Purpose: Tests the createViz function in the creator module
 * Author: [Author Name]
 * Creation Date: [Date]
 * Last Modified: [Date]
 */

import { createViz } from '../../src/core/creator';
import { registerType, getType, hasType } from '../../src/core/registry';
import { expect } from 'chai';
import sinon from 'sinon';

// Mock the registry functions if they're not properly imported
const mockRegistry = () => {
  const typeRegistry = {};

  // Override the imported functions with our mock implementations
  (registerType as any) = (type) => {
    typeRegistry[type.name] = type;
  };

  (getType as any) = (name) => {
    return typeRegistry[name];
  };

  (hasType as any) = (name) => {
    return !!typeRegistry[name];
  };
};

describe('createViz', () => {
  // Setup and teardown
  let sandbox: sinon.SinonSandbox;

  beforeEach(() => {
    // Create a sandbox for stubs and spies
    sandbox = sinon.createSandbox();

    // Set up mock registry
    mockRegistry();

    // Register test visualization types
    registerType({
      name: 'testType',
      requiredProps: ['width', 'height'],
      optionalProps: {
        x: 0,
        y: 0,
        fill: 'none'
      },
      decompose: (spec) => {
        return {
          _renderType: 'test',
          attributes: {
            ...spec
          },
          renderSVG: () => document.createElementNS('http://www.w3.org/2000/svg', 'g')
        };
      }
    });

    registerType({
      name: 'validationType',
      requiredProps: ['value'],
      optionalProps: {},
      validate: (spec) => {
        if (spec.value <= 0) {
          throw new Error('Value must be positive');
        }
      },
      decompose: (spec) => {
        return {
          _renderType: 'validation',
          attributes: {
            ...spec
          },
          renderSVG: () => document.createElementNS('http://www.w3.org/2000/svg', 'g')
        };
      }
    });
  });

  afterEach(() => {
    // Restore all stubs and spies
    sandbox.restore();
  });

  // Tests

  it('should return already processed objects unchanged', () => {
    // Arrange
    const processedObject = {
      renderSVG: () => {},
      renderCanvas: () => {}
    };

    // Act
    const result = createViz(processedObject);

    // Assert
    expect(result).to.equal(processedObject);
  });

  it('should throw an error for unknown visualization types', () => {
    // Arrange
    const spec = {
      type: 'unknownType',
      width: 100,
      height: 50
    };

    // Act & Assert
    expect(() => createViz(spec)).to.throw(/Unknown visualization type/);
  });

  it('should apply default values for optional properties', () => {
    // Arrange
    const spec = {
      type: 'testType',
      width: 100,
      height: 50
    };

    // Act
    const result = createViz(spec);

    // Assert
    expect(result.attributes).to.include({
      type: 'testType',
      width: 100,
      height: 50,
      x: 0,
      y: 0,
      fill: 'none'
    });
  });

  it('should not override provided values with defaults', () => {
    // Arrange
    const spec = {
      type: 'testType',
      width: 100,
      height: 50,
      x: 10,
      y: 20,
      fill: 'blue'
    };

    // Act
    const result = createViz(spec);

    // Assert
    expect(result.attributes).to.include({
      x: 10,
      y: 20,
      fill: 'blue'
    });
  });

  it('should throw an error for missing required properties', () => {
    // Arrange
    const spec = {
      type: 'testType',
      width: 100
      // Missing required height property
    };

    // Act & Assert
    expect(() => createViz(spec)).to.throw(/Missing required property/);
  });

  it('should run custom validation if available', () => {
    // Arrange
    const validSpec = {
      type: 'validationType',
      value: 10
    };

    const invalidSpec = {
      type: 'validationType',
      value: -5
    };

    // Act & Assert
    expect(() => createViz(validSpec)).not.to.throw();
    expect(() => createViz(invalidSpec)).to.throw(/Value must be positive/);
  });

  it('should call the type\'s decompose method with the processed spec', () => {
    // Arrange
    const spec = {
      type: 'testType',
      width: 100,
      height: 50
    };

    const typeDefinition = getType('testType');
    const decomposeSpy = sandbox.spy(typeDefinition, 'decompose');

    // Act
    createViz(spec);

    // Assert
    expect(decomposeSpy.calledOnce).to.be.true;
    expect(decomposeSpy.firstCall.args[0]).to.include({
      type: 'testType',
      width: 100,
      height: 50,
      x: 0,
      y: 0,
      fill: 'none'
    });
  });

  it('should return the result of the type\'s decompose method', () => {
    // Arrange
    const spec = {
      type: 'testType',
      width: 100,
      height: 50
    };

    const expectedResult = {
      _renderType: 'test',
      attributes: {
        type: 'testType',
        width: 100,
        height: 50,
        x: 0,
        y: 0,
        fill: 'none'
      },
      renderSVG: sinon.match.func
    };

    // Act
    const result = createViz(spec);

    // Assert
    expect(result).to.deep.include(expectedResult);
  });

  it('should handle nested visualization specifications', () => {
    // Arrange
    registerType({
      name: 'parentType',
      requiredProps: ['child'],
      optionalProps: {},
      decompose: (spec) => {
        // Process the child specification
        const processedChild = createViz(spec.child);

        return {
          _renderType: 'parent',
          child: processedChild,
          renderSVG: () => document.createElementNS('http://www.w3.org/2000/svg', 'g')
        };
      }
    });

    const spec = {
      type: 'parentType',
      child: {
        type: 'testType',
        width: 100,
        height: 50
      }
    };

    // Act
    const result = createViz(spec);

    // Assert
    expect(result._renderType).to.equal('parent');
    expect(result.child._renderType).to.equal('test');
    expect(result.child.attributes).to.include({
      width: 100,
      height: 50
    });
  });

  it('should be idempotent for processed objects', () => {
    // Arrange
    const spec = {
      type: 'testType',
      width: 100,
      height: 50
    };

    // Act
    const result1 = createViz(spec);
    const result2 = createViz(result1);

    // Assert
    expect(result2).to.equal(result1);
  });

  it('should not modify the original specification', () => {
    // Arrange
    const originalSpec = {
      type: 'testType',
      width: 100,
      height: 50
    };

    const specCopy = { ...originalSpec };

    // Act
    createViz(originalSpec);

    // Assert
    expect(originalSpec).to.deep.equal(specCopy);
  });
});

/**
 * References:
 * - Related File: src/core/creator.ts
 * - Related File: src/core/registry.ts
 * - Related File: src/core/devize.ts
 * - Design Document: design/creation.md
 * - Design Document: design/viz_creation_rendering.md
 * - Design Document: design/devize_system.md
 * - Test Framework: chai (https://www.chaijs.com/)
 * - Test Framework: sinon (https://sinonjs.org/)
 */
