import { describe, it, expect, beforeEach } from 'vitest';
import { TypeRegistry, registry, registerType, hasType, getType, getAllTypes } from './registry';
import { TypeDefinition } from './types';

describe('TypeRegistry', () => {
  let testRegistry: TypeRegistry;

  beforeEach(() => {
    // Create a fresh registry for each test
    testRegistry = new TypeRegistry();
  });

  it('registers a type definition', () => {
    // Create a simple type definition
    const typeDef: TypeDefinition = {
      name: 'testType',
      properties: {
        prop1: { required: true },
        prop2: { default: 'default value' }
      },
      implementation: () => ({ type: 'group', children: [] })
    };

    // Register the type
    testRegistry.registerType(typeDef);

    // Check if the type exists
    expect(testRegistry.hasType('testType')).toBe(true);
  });

  it('retrieves a registered type definition', () => {
    // Create a simple type definition
    const typeDef: TypeDefinition = {
      name: 'testType',
      properties: {
        prop1: { required: true },
        prop2: { default: 'default value' }
      },
      implementation: () => ({ type: 'group', children: [] })
    };

    // Register the type
    testRegistry.registerType(typeDef);

    // Retrieve the type
    const retrievedType = testRegistry.getType('testType');

    // Check if the retrieved type matches the original
    expect(retrievedType).toBeDefined();
    expect(retrievedType?.name).toBe('testType');
    expect(retrievedType?.properties).toEqual(typeDef.properties);
    expect(typeof retrievedType?.implementation).toBe('function');
  });

  it('returns undefined for non-existent types', () => {
    // Try to get a type that doesn't exist
    const nonExistentType = testRegistry.getType('nonExistentType');

    // Should be undefined
    expect(nonExistentType).toBeUndefined();
  });

  it('checks if a type exists', () => {
    // Create and register a type
    const typeDef: TypeDefinition = {
      name: 'testType',
      properties: {},
      implementation: () => ({ type: 'group', children: [] })
    };
    testRegistry.registerType(typeDef);

    // Check existing type
    expect(testRegistry.hasType('testType')).toBe(true);

    // Check non-existent type
    expect(testRegistry.hasType('nonExistentType')).toBe(false);
  });

  it('registers a type directly for bootstrapping', () => {
    // Create a spec for direct registration
    const spec = {
      name: 'bootstrapType',
      properties: {
        prop1: { required: true }
      },
      implementation: () => ({ type: 'group', children: [] })
    };

    // Register directly
    testRegistry.registerTypeDirectly(spec);

    // Check if the type exists
    expect(testRegistry.hasType('bootstrapType')).toBe(true);

    // Retrieve and check the type
    const retrievedType = testRegistry.getType('bootstrapType');
    expect(retrievedType).toBeDefined();
    expect(retrievedType?.name).toBe('bootstrapType');
    expect(retrievedType?.properties).toEqual(spec.properties);
  });

  it('gets all registered types', () => {
    // Register multiple types
    const type1: TypeDefinition = {
      name: 'type1',
      properties: {},
      implementation: () => ({})
    };

    const type2: TypeDefinition = {
      name: 'type2',
      properties: {},
      implementation: () => ({})
    };

    testRegistry.registerType(type1);
    testRegistry.registerType(type2);

    // Get all types
    const allTypes = testRegistry.getAllTypes();

    // Check if all types are included
    expect(Object.keys(allTypes).length).toBe(2);
    expect(allTypes.type1).toBeDefined();
    expect(allTypes.type2).toBeDefined();
    expect(allTypes.type1.name).toBe('type1');
    expect(allTypes.type2.name).toBe('type2');
  });

  it('overwrites a type when registering with the same name', () => {
    // Register a type
    const originalType: TypeDefinition = {
      name: 'testType',
      properties: { prop1: { default: 'original' } },
      implementation: () => ({ original: true })
    };
    testRegistry.registerType(originalType);

    // Register a different type with the same name
    const newType: TypeDefinition = {
      name: 'testType',
      properties: { prop1: { default: 'new' } },
      implementation: () => ({ new: true })
    };
    testRegistry.registerType(newType);

    // Get the type
    const retrievedType = testRegistry.getType('testType');

    // Should have the new properties
    expect(retrievedType?.properties.prop1.default).toBe('new');
  });
});

// Test the singleton instance and convenience functions
describe('Registry Singleton', () => {
  it('singleton instance exists', () => {
    expect(registry).toBeDefined();
    expect(registry instanceof TypeRegistry).toBe(true);
  });

  it('convenience functions work with the singleton', () => {
    // Create a test type
    const typeDef: TypeDefinition = {
      name: 'convenienceTest',
      properties: {},
      implementation: () => ({})
    };

    // Use convenience function to register
    registerType(typeDef);

    // Check with other convenience functions
    expect(hasType('convenienceTest')).toBe(true);
    expect(getType('convenienceTest')).toBeDefined();
    expect(getAllTypes().convenienceTest).toBeDefined();
  });
});
