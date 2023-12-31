# Devize Data Transformations API Design

The Devize library provides a versatile and intuitive API for declaring and applying data transformations. These transformations are integral to creating meaningful visualizations and can be easily declared using JavaScript objects. The API supports composition, chaining, and the ability to handle both individual values and arrays of data.

## Transformation Declaration

Transformations are declared using JavaScript objects. Each transformation object consists of a transformation name as the key and an object containing the specific parameters required for that transformation.

For example, a linear transformation with scale and translate parameters could be declared as follows:

```javascript
const linearTransform = {
  "linear": {
    scale: 2,
    translate: 5
  }
};
```

Alternatively, using source and target value sets:

```javascript
const linearTransform = {
  "linear": {
    source: [0, 100],
    target: [10, 50]
  }
};
```

## Transformation Application

To apply a transformation to data, the library provides a function that takes the input data and the transformation object. The transformation function performs the necessary computations and returns the transformed output.

```javascript
import { applyTransformation } from 'devize';

const inputData = 10;
const transformedData = applyTransformation(inputData, linearTransform);
console.log(transformedData);  # Outputs: 25
```

### Map Function

You can also use the map function to apply the same transformation to every element of an array:

```javascript
const dataArray = [10, 20, 30, 40];
const transformedArray = dataArray.map(value => applyTransformation(value, linearTransform));
console.log(transformedArray);  # Outputs: [25, 35, 45, 55]
```

## Composition and Chaining

Transformations can be composed and chained to create more complex data manipulations. The library provides a chaining function that takes an array of transformation objects and applies them sequentially.

```javascript
const composedTransform = [
  {
    "linear": { scale: 2, translate: 5 }
  },
  {
    "log": { base: 10 }
  }
];

const result = applyTransformation(inputData, composedTransform);
```

## Inversion of Transformations

Many transformations are inherently reversible, allowing for accurate data recovery. The library provides an `invertTransformation` function to compute the inverse of a transformation.

```javascript
import { invertTransformation } from 'devize';

const invertedLinearTransform = invertTransformation(linearTransform);
```

## Linear Transformation

A linear transformation scales and shifts data linearly. The scale parameter specifies the scaling factor, and the translate parameter specifies the translation value.

```javascript
const linearTransform = {
  "linear": {
    scale: 2,
    translate: 5
  }
};
```

Alternatively, using source and target value sets:

```javascript
const linearTransform = {
  "linear": {
    source: [0, 100],
    target: [10, 50]
  }
};
```

---

The Devize Data Transformations API provides a rich set of tools for declaring, applying, composing, chaining, and inverting various types of transformations. By leveraging this API, developers can easily manipulate and prepare data for visualization, enhancing the versatility and power of the Devize library.
```
