import { createViz } from '../../core/devize';

// Define a compute component that calculates derived values
createViz({
  type: "define",
  name: "compute",
  properties: {
    input: { required: true },
    fn: { required: true },
    as: { required: true }
  },
  implementation: props => {
    // Calculate the derived value
    const result = props.fn(props.input);

    // Return an object with the computed value
    return {
      [props.as]: result
    };
  }
}, document.createElement('div'));
