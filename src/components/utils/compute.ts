// Compute component for derived values
import { createViz } from '../../core/devize';

createViz({
  type: "define",
  name: "compute",
  properties: {
    input: { required: true },
    fn: { required: true },
    as: { required: true }
  },
  implementation: props => {
    try {
      // Apply the function to the input
      const result = props.fn(props.input);

      // Return the result with the specified key
      return {
        [props.as]: result
      };
    } catch (error) {
      console.error('Error in compute component:', error);
      // Return a default value to prevent errors
      return {
        [props.as]: null
      };
    }
  }
});
