// Data extraction component
import { buildViz } from '../../core/devize';

buildViz({
  type: "define",
  name: "dataExtract",
  properties: {
    data: { required: true },
    field: { required: true },
    as: { default: 'values' }
  },

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
