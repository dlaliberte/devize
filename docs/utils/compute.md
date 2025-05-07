# compute Component

## Purpose
The `compute` component performs calculations on input data and makes the results available to child components. It's useful for deriving new values from existing props.

## Properties
- `input` (required): The input data to compute on
- `fn` (required): The function to apply to the input
- `as` (required): The name to assign to the computed result

## Examples

### Basic Usage
```javascript
{
  type: 'compute',
  input: 100,
  fn: value => value * 2,
  as: 'doubledValue'
}
```

### Computing Chart Dimensions
```javascript
{
  type: 'compute',
  input: props => ({
    width: props.width,
    height: props.height,
    margin: props.margin
  }),
  fn: ({ width, height, margin }) => ({
    chartWidth: width - margin.left - margin.right,
    chartHeight: height - margin.top - margin.bottom
  }),
  as: 'dimensions'
}
```

### Generating Axis Values
```javascript
{
  type: 'compute',
  input: props => props.yStats.max,
  fn: yMax => [0, yMax * 0.25, yMax * 0.5, yMax * 0.75, yMax],
  as: 'yAxisValues'
}
```

## Implementation Details
The component applies the specified function to the input and makes the result available under the specified name in the props passed to child components.

```typescript
buildViz({
  type: "define",
  name: "compute",
  properties: {
    input: { required: true },
    fn: { required: true },
    as: { required: true }
  },
  implementation: props => {
    // Get the input value, evaluating it if it's a function
    const inputValue = typeof props.input === 'function'
      ? props.input(props)
      : props.input;

    // Apply the function to the input
    const result = props.fn(inputValue);

    // Return an object with the computed value
    return {
      [props.as]: result
    };
  }
}, document.createElement('div'));
```
