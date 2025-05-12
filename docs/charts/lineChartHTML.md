
## Including Rendered Images or Live Examples in Documentation

You're right that including rendered examples would greatly enhance the documentation. Here are some approaches:

### 1. Static Images

The simplest approach is to include static images of example charts:

```markdown
# Line Chart

![Basic Line Chart](../assets/images/line-chart-basic.png)

The line chart is a visualization type that displays data points connected by straight line segments...
```

This requires maintaining a set of example images in your repository.

### 2. HTML Documentation with Live Examples

For a more interactive experience, you could create HTML documentation with embedded live examples:

```html
<!DOCTYPE html>
<html>
<head>
  <title>Line Chart Documentation</title>
  <script src="../dist/devize.js"></script>
  <style>
    .example-container {
      width: 100%;
      height: 300px;
      border: 1px solid #ddd;
      margin: 20px 0;
    }
  </style>
</head>
<body>
  <h1>Line Chart</h1>

  <p>The line chart is a visualization type that displays data points connected by straight line segments...</p>

  <h2>Basic Usage</h2>
  <div id="basic-example" class="example-container"></div>

  <pre><code>
  // Sample data
  const salesData = [
    { month: "Jan", sales: 420 },
    { month: "Feb", sales: 650 },
    { month: "Mar", sales: 340 },
    { month: "Apr", sales: 570 },
    { month: "May", sales: 690 }
  ];

  buildViz({
    type: "lineChart",
    data: salesData,
    x: { field: "month" },
    y: { field: "sales" },
    color: "#3366CC",
    title: "Monthly Sales"
  });
  </code></pre>

  <script>
    // Create the example
    const salesData = [
      { month: "Jan", sales: 420 },
      { month: "Feb", sales: 650 },
      { month: "Mar", sales: 340 },
      { month: "Apr", sales: 570 },
      { month: "May", sales: 690 }
    ];

    Devize.buildViz({
      type: "lineChart",
      data: salesData,
      x: { field: "month" },
      y: { field: "sales" },
      color: "#3366CC",
      title: "Monthly Sales",
      container: document.getElementById("basic-example")
    });
  </script>
</body>
</html>
```

### 3. Documentation Site with Interactive Examples

For a more comprehensive solution, you could create a documentation site using tools like:

- **Docusaurus**: Allows embedding React components in Markdown
- **VuePress**: Allows embedding Vue components in Markdown
- **Storybook**: Great for component documentation with live examples
- **Observable**: Embed interactive notebooks

### 4. Markdown with HTML (GitHub Pages)

If you're using GitHub Pages, you can include HTML directly in your Markdown files:

```markdown
# Line Chart

The line chart is a visualization type that displays data points connected by straight line segments...

## Basic Example

<div id="basic-example" style="width: 100%; height: 300px; border: 1px solid #ddd; margin: 20px 0;"></div>

<script>
document.addEventListener('DOMContentLoaded', function() {
  const salesData = [
    { month: "Jan", sales: 420 },
    { month: "Feb", sales: 650 },
    { month: "Mar", sales: 340 },
    { month: "Apr", sales: 570 },
    { month: "May", sales: 690 }
  ];

  Devize.buildViz({
    type: "lineChart",
    data: salesData,
    x: { field: "month" },
    y: { field: "sales" },
    color: "#3366CC",
    title: "Monthly Sales",
    container: document.getElementById("basic-example")
  });
});
</script>
