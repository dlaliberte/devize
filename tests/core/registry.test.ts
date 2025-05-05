import { registerType, getType, hasType, removeType } from '../../src/core/registry';

describe('Type Registry', () => {
  // Create a unique type name for each test to avoid conflicts
  const getUniqueTypeName = () => `testType_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  test('registerType should register a new visualization type', () => {
    const typeName = getUniqueTypeName();
    registerType({
      name: typeName,
      requiredProps: ['prop1', 'prop2'],
      optionalProps: { prop3: 'default' },
      generateConstraints: () => [],
      decompose: () => ({ type: 'group', children: [] })
    });

    expect(hasType(typeName)).toBe(true);
  });

  test('getType should return a registered type', () => {
    const typeName = getUniqueTypeName();
    registerType({
      name: typeName,
      requiredProps: ['prop1', 'prop2'],
      optionalProps: { prop3: 'default' },
      generateConstraints: () => [],
      decompose: () => ({ type: 'group', children: [] })
    });

    const type = getType(typeName);
    expect(type).toBeDefined();
    expect(type?.name).toBe(typeName);
    expect(type?.requiredProps).toContain('prop1');
  });

  test('removeType should remove a registered type', () => {
    const typeName = getUniqueTypeName();
    registerType({
      name: typeName,
      requiredProps: ['prop1', 'prop2'],
      optionalProps: { prop3: 'default' },
      generateConstraints: () => [],
      decompose: () => ({ type: 'group', children: [] })
    });

    expect(hasType(typeName)).toBe(true);
    removeType(typeName);
    expect(hasType(typeName)).toBe(false);
  });
});
