import { createViz } from '../../core/devize';

// Define a dataExtract component that extracts values from data
createViz({
  type: "define",
  name: "dataExtract",
  properties: {
    data: { required: true },
    field: { required: true },
    as: { default: 'values' }
  },
  implementation: props => {
    // Extract values from the data array
    const values = props.data.map(d => d[props.field]);

    // Return an object with the extracted values
    return {
      [props.as]: values
    };
  }
}, document.createElement('div'));
