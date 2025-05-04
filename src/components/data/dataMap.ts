import { createViz } from '../../core/devize';
import { hasType } from '../../core/registry';

// Only define the dataMap component if it's not already registered
if (!hasType('dataMap')) {
  // Define a more flexible dataMap component
  createViz({
    type: "define",
    name: "dataMap",
    properties: {
      data: { required: true },
      map: { required: true },
      keyField: { default: null },
      template: { default: null },
      fields: { default: null }
    },
    implementation: props => {
      const data = props.data || [];

      if (!Array.isArray(data)) {
        return { type: 'group', children: [] };
      }

      // Handle different mapping approaches
      if (typeof props.map === 'function') {
        // Function-based mapping (most flexible)
        return {
          type: 'group',
          children: data.map((item, index, array) => props.map(item, index, array, props))
        };
      } else if (props.template && props.fields) {
        // Template-based mapping with field mappings
        return {
          type: 'group',
          children: data.map(item => {
            // Create a copy of the template
            const result = JSON.parse(JSON.stringify(props.template));

            // Apply field mappings
            Object.entries(props.fields).forEach(([targetPath, sourceField]) => {
              // Set the value at the target path
              setNestedValue(result, targetPath, item[sourceField]);
            });

            // Add the original data item for reference
            result.data = item;

            return result;
          })
        };
      } else {
        // Simple mapping - just use the map as a template for each item
        return {
          type: 'group',
          children: data.map(item => ({
            ...props.map,
            data: item
          }))
        };
      }
    }
  }, document.createElement('div'));
}

// Helper function to set a value at a nested path
function setNestedValue(obj: any, path: string, value: any): void {
  const parts = path.split('.');
  let current = obj;

  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i];
    if (!current[part]) {
      current[part] = {};
    }
    current = current[part];
  }

  current[parts[parts.length - 1]] = value;
}
