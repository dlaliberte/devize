import { registerType } from '../../../core/registry';

// Register the dataMap visualization type
registerType({
  name: "dataMap",
  requiredProps: ['data', 'map'],
  optionalProps: {},
  generateConstraints(spec, context) {
    return [];
  },
  decompose(spec, solvedConstraints) {
    // Create a group to contain all mapped items
    const group = {
      type: "group",
      children: []
    };

    // Apply the map function to each data item
    if (Array.isArray(spec.data)) {
      spec.data.forEach((item, index, array) => {
        const mappedItem = spec.map(item, index, array, spec);
        if (mappedItem) {
          group.children.push(mappedItem);
        }
      });
    }

    return group;
  }
});
