# Medical Test Chart

A specialized chart for displaying medical test results with normal ranges and caution zones.

## Overview

The Medical Test Chart displays a horizontal bar divided into three sections:
- Yellow "caution" zones for values below the normal range and above the normal range
- A green "normal" zone for values within the acceptable range
- A marker showing where the actual test result falls on this scale

## Usage Example

```javascript
const testResultChart = buildViz({
  type: "medicalTestChart",
  value: 125, // The actual test result value
  range: {
    low: 70,   // Lower bound of normal range
    high: 140  // Upper bound of normal range
  },
  title: "Blood Glucose",
  units: "mg/dL",
  width: 500,
  height: 120
});
```

## Specification

| Property | Type | Description |
|----------|------|-------------|
| `value` | Number or Object | The test result value to display. Can be a direct number or an object with `field` property to extract from data |
| `range.low` | Number | The lower bound of the normal range |
| `range.high` | Number | The upper bound of the normal range |
| `title` | String | (Optional) Title for the chart |
| `units` | String | (Optional) Units for the test value |
| `width` | Number | (Optional) Width of the chart in pixels (default: 400) |
| `height` | Number | (Optional) Height of the chart in pixels (default: 100) |
| `colors.normal` | String | (Optional) Color for the normal range (default: '#4CAF50') |
| `colors.caution` | String | (Optional) Color for the caution zones (default: '#FFC107') |
| `colors.text` | String | (Optional) Color for text elements (default: '#333333') |
| `barHeight` | Number | (Optional) Height of the main bar (default: 30) |
| `indicatorSize` | Object | (Optional) Size of the value indicator box (default: { width: 60, height: 30 }) |

## Constraints

The chart automatically adapts to the specified width and height. The test value indicator will be colored according to whether it falls within the normal range or in a caution zone.
```

## 4. Let's create an example usage file

```javascript:examples/medical_test_chart.js
import { buildViz } from '../src/api/core';

// Example 1: Blood Glucose Test
const glucoseTest = buildViz({
  type: "medicalTestChart",
  value: 125,
  range: {
    low: 70,
    high: 140
  },
  title: "Blood Glucose",
  units: "mg/dL"
});

// Example 2: Cholesterol Test (with custom colors)
const cholesterolTest = buildViz({
  type: "medicalTestChart",
  value: 210,
  range: {
    low: 100,
    high: 200
  },
  title: "Total Cholesterol",
  units: "mg/dL",
  colors: {
    normal: "#3F51B5",  // Indigo
    caution: "#FF5722", // Deep Orange
    text: "#212121"     // Dark Gray
  }
});

// Example 3: Blood Pressure (Systolic)
const bpTest = buildViz({
  type: "medicalTestChart",
  value: 135,
  range: {
    low: 90,
    high: 120
  },
  title: "Systolic Blood Pressure",
  units: "mmHg",
  width: 600,
  height: 150
});

// Example 4: Using data binding
const data = [
  { patient: "John Doe", hba1c: 6.2 }
];

const hba1cTest = buildViz({
  type: "medicalTestChart",
  data: data,
  value: { field: "hba1c" },
  range: {
    low: 4.0,
    high: 5.7
  },
  title: "HbA1c",
  units: "%"
});
