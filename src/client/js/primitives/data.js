
// Define the dataMap primitive
createViz({
    type: "define",
    name: "dataMap",
    properties: {
      data: { required: true }, // Array of data items
      template: { required: true }, // Template function or specification
      keyField: { default: null }, // Field to use as key for updates
      enter: { default: null }, // Animation for entering elements
      update: { default: null }, // Animation for updating elements
      exit: { default: null } // Animation for exiting elements
    },
    implementation: function(props) {
      // Create a group for the mapped elements
      const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');

      // Ensure data is an array
      const data = Array.isArray(props.data) ? props.data : [];

      // Create elements based on data
      data.forEach((item, index) => {
        // Create a template instance for this data item
        let templateSpec;

        if (typeof props.template === 'function') {
          // If template is a function, call it with the data item
          templateSpec = props.template(item, index, data);
        } else {
          // Otherwise, clone the template and add data binding
          templateSpec = JSON.parse(JSON.stringify(props.template));
          templateSpec._data = item;
          templateSpec._index = index;
        }

        if (!templateSpec) return;

        // Create and append the template instance
        const instance = createViz(templateSpec, { appendChild: (el) => group.appendChild(el) });

        // Store data reference for updates
        if (instance && instance.element) {
          instance.element._data = item;
          instance.element._index = index;

          // Store key for updates if keyField is specified
          if (props.keyField && item[props.keyField] !== undefined) {
            instance.element._key = item[props.keyField];
          }
        }
      });

      return group;
    }
  });
