// Data extraction component
import { createViz } from '../../core/devize';

createViz({
  type: "define",
  name: "dataExtract",
  properties: {
    data: { required: true },
    field: { required: true },
    as: { default: 'values' }
  },
  isDataTransformation: true, // Mark as data transformation
  implementation: props => {
    // Extract values from the data array
    const values = Array.isArray(props.data)
      ? props.data.map(d => d[props.field])
      : [];

    // Return an object with the extracted values
    return {
      [props.as]: values
    };
  }
});
