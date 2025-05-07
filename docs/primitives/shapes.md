# Primitive Shapes

Devize supports several primitive visualization types that can be used as building blocks for more complex visualizations.

## Rectangle

```javascript
buildViz({
  type: "rectangle",
  x: 50,
  y: 50,
  width: 100,
  height: 80,
  fill: "#6699CC",
  stroke: "#336699",
  strokeWidth: 2,
  cornerRadius: 5
}, document.getElementById("viz-container"));
```

### Properties

| Property | Type | Description | Default |
|----------|------|-------------|---------|
| x | number | X coordinate of the top-left corner | 0 |
| y | number | Y coordinate of the top-left corner | 0 |
| width | number | Width of the rectangle | Required |
| height | number | Height of the rectangle | Required |
| fill | string | Fill color | "none" |
| stroke | string | Stroke color | "black" |
| strokeWidth | number | Width of the stroke | 1 |
| cornerRadius | number | Radius for rounded corners | 0 |

## Circle

```javascript
buildViz({
  type: "circle",
  cx: 150,
  cy: 150,
  r: 40,
  fill: "#CC6666",
  stroke: "#994444",
  strokeWidth: 2
}, document.getElementById("viz-container"));
```

### Properties

| Property | Type | Description | Default |
|----------|------|-------------|---------|
| cx | number | X coordinate of the center | 0 |
| cy | number | Y coordinate of the center | 0 |
| r | number | Radius of the circle | Required |
| fill | string | Fill color | "none" |
| stroke | string | Stroke color | "black" |
| strokeWidth | number | Width of the stroke | 1 |

## Line

```javascript
buildViz({
  type: "line",
  x1: 50,
  y1: 200,
  x2: 350,
  y2: 200,
  stroke: "#666666",
  strokeWidth: 3,
  strokeDasharray: "5,5"
}, document.getElementById("viz-container"));
```

### Properties

| Property | Type | Description | Default |
|----------|------|-------------|---------|
| x1 | number | X coordinate of the start point | 0 |
| y1 | number | Y coordinate of the start point | 0 |
| x2 | number | X coordinate of the end point | Required |
| y2 | number | Y coordinate of the end point | Required |
| stroke | string | Stroke color | "black" |
| strokeWidth | number | Width of the stroke | 1 |
| strokeDasharray | string | Pattern of dashes and gaps | "none" |

## Text

```javascript
buildViz({
  type: "text",
  x: 100,
  y: 100,
  text: "Hello, Devize!",
  fontSize: 16,
  fontFamily: "Arial",
  fill: "#333333"
}, document.getElementById("viz-container"));
```

### Properties

| Property | Type | Description | Default |
|----------|------|-------------|---------|
| x | number | X coordinate | 0 |
| y | number | Y coordinate | 0 |
| text | string | Text content | Required |
| fontSize | number | Font size in pixels | 12 |
| fontFamily | string | Font family | "sans-serif" |
| fill | string | Text color | "black" |
| textAnchor | string | Text alignment ("start", "middle", "end") | "start" |
| dominantBaseline | string | Vertical alignment | "auto" |
