// Container and Grouping Primitives
// ===============================

// Define the group primitive
createViz({
  type: "define",
  name: "group",
  properties: {
    transform: { default: null },
    opacity: { default: 1 },
    visible: { default: true },
    children: { default: [] }
  },
  implementation: function(props, container) {
    const svg = ensureSvg(container);

    // Create group element
    const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');

    // Set transform if provided
    if (props.transform) {
      // Check if transform is a function by actually trying to call it
      try {
        if (typeof props.transform === 'function') {
          const transformValue = props.transform(props);
          group.setAttribute('transform', transformValue);
        } else {
          group.setAttribute('transform', props.transform);
        }
      } catch (e) {
        // If calling as a function fails, just use it as a string
        console.error("Error applying transform:", e);
        group.setAttribute('transform', String(props.transform));
      }
    }

    // Set other attributes
    if (props.opacity !== 1) group.setAttribute('opacity', props.opacity);
    if (!props.visible) group.setAttribute('display', 'none');

    // Add to SVG
    svg.appendChild(group);

    // Create child visualizations
    const children = [];
    if (props.children) {
      let childSpecs;

      try {
        if (typeof props.children === 'function') {
          // Execute the function to get the child specs
          childSpecs = props.children(props);
        } else {
          childSpecs = props.children;
        }
      } catch (e) {
        console.error("Error getting children:", e);
        childSpecs = [];
      }

      if (Array.isArray(childSpecs)) {
        for (const childSpec of childSpecs) {
          // Create a temporary container for the child
          const tempContainer = {
            querySelector: () => group,
            appendChild: () => {} // No-op since we're using the existing group
          };

          // Create the child visualization
          const child = createViz(childSpec, tempContainer);

          // If it's a valid child, add it to our children array
          if (child) {
            children.push(child);
          }
        }
      }
    }

    return {
      element: group,
      spec: props,
      children: children
    };
  }
});

// Define the layer primitive
createViz({
  type: "define",
  name: "layer",
  properties: {
    name: { default: null },
    visible: { default: true },
    opacity: { default: 1 },
    children: { default: [] }
  },
  implementation: function(props) {
    // Create SVG group element for the layer
    const layer = document.createElementNS('http://www.w3.org/2000/svg', 'g');

    // Set attributes from props
    if (props.name) layer.setAttribute('data-layer-name', props.name);
    if (props.opacity !== 1) layer.setAttribute('opacity', props.opacity);
    if (!props.visible) layer.setAttribute('display', 'none');

    // Create and append children
    if (props.children && Array.isArray(props.children)) {
      for (const childSpec of props.children) {
        if (childSpec) {
          const child = createViz(childSpec, { appendChild: (el) => layer.appendChild(el) });
          if (child && child.element) {
            // Child already appended in createViz
          }
        }
      }
    }

    return layer;
  }
});

// Define the clipPath primitive
createViz({
  type: "define",
  name: "clipPath",
  properties: {
    id: { required: true },
    children: { required: true }
  },
  implementation: function(props) {
    // Create SVG defs and clipPath elements
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    const clipPath = document.createElementNS('http://www.w3.org/2000/svg', 'clipPath');

    // Set clipPath ID
    clipPath.setAttribute('id', props.id);

    // Create and append children to the clipPath
    if (props.children && Array.isArray(props.children)) {
      for (const childSpec of props.children) {
        if (childSpec) {
          const child = createViz(childSpec, { appendChild: (el) => clipPath.appendChild(el) });
          if (child && child.element) {
            // Child already appended in createViz
          }
        }
      }
    }

    // Append clipPath to defs
    defs.appendChild(clipPath);

    return defs;
  }
});

// Define the mask primitive
createViz({
  type: "define",
  name: "mask",
  properties: {
    id: { required: true },
    x: { default: 0 },
    y: { default: 0 },
    width: { default: "100%" },
    height: { default: "100%" },
    children: { required: true }
  },
  implementation: function(props) {
    // Create SVG defs and mask elements
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    const mask = document.createElementNS('http://www.w3.org/2000/svg', 'mask');

    // Set mask attributes
    mask.setAttribute('id', props.id);
    mask.setAttribute('x', props.x);
    mask.setAttribute('y', props.y);
    mask.setAttribute('width', props.width);
    mask.setAttribute('height', props.height);

    // Create and append children to the mask
    if (props.children && Array.isArray(props.children)) {
      for (const childSpec of props.children) {
        if (childSpec) {
          const child = createViz(childSpec, { appendChild: (el) => mask.appendChild(el) });
          if (child && child.element) {
            // Child already appended in createViz
          }
        }
      }
    }

    // Append mask to defs
    defs.appendChild(mask);

    return defs;
  }
});

// Define the viewBox primitive
createViz({
  type: "define",
  name: "viewBox",
  properties: {
    x: { default: 0 },
    y: { default: 0 },
    width: { required: true },
    height: { required: true },
    preserveAspectRatio: { default: "xMidYMid meet" },
    children: { default: [] }
  },
  implementation: function(props) {
    // Create SVG element with viewBox
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');

    // Set viewBox attributes
    svg.setAttribute('viewBox', `${props.x} ${props.y} ${props.width} ${props.height}`);
    svg.setAttribute('preserveAspectRatio', props.preserveAspectRatio);
    svg.setAttribute('width', "100%");
    svg.setAttribute('height', "100%");

    // Create and append children
    if (props.children && Array.isArray(props.children)) {
      for (const childSpec of props.children) {
        if (childSpec) {
          const child = createViz(childSpec, { appendChild: (el) => svg.appendChild(el) });
          if (child && child.element) {
            // Child already appended in createViz
          }
        }
      }
    }

    return svg;
  }
});

// Define the grid primitive
createViz({
  type: "define",
  name: "grid",
  properties: {
    rows: { default: 1 },
    columns: { default: 1 },
    width: { default: "100%" },
    height: { default: "100%" },
    rowGap: { default: 0 },
    columnGap: { default: 0 },
    children: { default: [] }
  },
  implementation: function(props) {
    // Create a group for the grid
    const grid = document.createElementNS('http://www.w3.org/2000/svg', 'g');

    // Calculate cell dimensions
    const totalWidth = typeof props.width === 'string' ? 100 : props.width;
    const totalHeight = typeof props.height === 'string' ? 100 : props.height;

    const cellWidth = (totalWidth - (props.columnGap * (props.columns - 1))) / props.columns;
    const cellHeight = (totalHeight - (props.rowGap * (props.rows - 1))) / props.rows;

    // Create and position children
    if (props.children && Array.isArray(props.children)) {
      props.children.forEach((childSpec, index) => {
        if (!childSpec) return;

        // Calculate row and column for this index
        const row = Math.floor(index / props.columns);
        const col = index % props.columns;

        // Calculate position
        const x = col * (cellWidth + props.columnGap);
        const y = row * (cellHeight + props.rowGap);

        // Create a group for this cell
        const cellGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        cellGroup.setAttribute('transform', `translate(${x}, ${y})`);

        // Create a viewBox for this cell to contain the child
        const cellViewBox = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        cellViewBox.setAttribute('x', 0);
        cellViewBox.setAttribute('y', 0);
        cellViewBox.setAttribute('width', cellWidth);
        cellViewBox.setAttribute('height', cellHeight);
        cellViewBox.setAttribute('overflow', 'visible');

        // Create and append the child to the cell viewBox
        const child = createViz(childSpec, { appendChild: (el) => cellViewBox.appendChild(el) });

        // Append the cell viewBox to the cell group
        cellGroup.appendChild(cellViewBox);

        // Append the cell group to the grid
        grid.appendChild(cellGroup);
      });
    }

    return grid;
  }
});

// Define the stack primitive
createViz({
  type: "define",
  name: "stack",
  properties: {
    direction: { default: "vertical" }, // "vertical" or "horizontal"
    spacing: { default: 0 },
    alignment: { default: "start" }, // "start", "center", "end", "space-between", "space-around"
    width: { default: "100%" },
    height: { default: "100%" },
    children: { default: [] }
  },
  implementation: function(props) {
    // Create a group for the stack
    const stack = document.createElementNS('http://www.w3.org/2000/svg', 'g');

    // Calculate dimensions
    const isVertical = props.direction === "vertical";
    const totalWidth = typeof props.width === 'string' ? 100 : props.width;
    const totalHeight = typeof props.height === 'string' ? 100 : props.height;

    // Create temporary elements to measure children
    const childDimensions = [];
    let totalChildSize = 0;

    if (props.children && Array.isArray(props.children)) {
      // First pass: create and measure children
      props.children.forEach((childSpec, index) => {
        if (!childSpec) {
          childDimensions.push(null);
          return;
        }

        // Create a temporary container
        const tempContainer = document.createElement('div');
        tempContainer.style.position = 'absolute';
        tempContainer.style.visibility = 'hidden';
        document.body.appendChild(tempContainer);

        // Create the child
        const child = createViz(childSpec, tempContainer);

        // Measure the child
        const bbox = child.element.getBBox();
        childDimensions.push({
          width: bbox.width,
          height: bbox.height
        });

        // Update total size
        totalChildSize += isVertical ? bbox.height : bbox.width;

        // Remove temporary container
        document.body.removeChild(tempContainer);
      });

      // Calculate spacing based on alignment
      const totalSpacing = props.spacing * (props.children.length - 1);
      const availableSpace = isVertical ? totalHeight - totalChildSize : totalWidth - totalChildSize;

      let startPosition = 0;

      if (props.alignment === "center") {
        startPosition = availableSpace / 2;
      } else if (props.alignment === "end") {
        startPosition = availableSpace;
      } else if (props.alignment === "space-between" && props.children.length > 1) {
        props.spacing = availableSpace / (props.children.length - 1);
      } else if (props.alignment === "space-around" && props.children.length > 0) {
        const spacePerChild = availableSpace / props.children.length;
        startPosition = spacePerChild / 2;
        props.spacing = spacePerChild;
      }

      // Second pass: position and append children
      let currentPosition = startPosition;

      props.children.forEach((childSpec, index) => {
        if (!childSpec || !childDimensions[index]) return;

        // Create a group for this child
        const childGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');

        // Position the child
        const x = isVertical ? 0 : currentPosition;
        const y = isVertical ? currentPosition : 0;
        childGroup.setAttribute('transform', `translate(${x}, ${y})`);

        // Create and append the child
        const child = createViz(childSpec, { appendChild: (el) => childGroup.appendChild(el) });

        // Append the child group to the stack
        stack.appendChild(childGroup);

        // Update position for next child
        currentPosition += isVertical ?
          childDimensions[index].height + props.spacing :
          childDimensions[index].width + props.spacing;
      });
    }

    return stack;
  }
});

// Define the flow primitive
createViz({
  type: "define",
  name: "flow",
  properties: {
    direction: { default: "horizontal" }, // "horizontal" or "vertical"
    wrap: { default: true },
    spacing: { default: 5 },
    lineSpacing: { default: 5 },
    alignment: { default: "start" }, // "start", "center", "end"
    width: { required: true },
    height: { default: null },
    children: { default: [] }
  },
  implementation: function(props) {
    // Create a group for the flow layout
    const flow = document.createElementNS('http://www.w3.org/2000/svg', 'g');

    // Calculate dimensions
    const isHorizontal = props.direction === "horizontal";
    const containerWidth = props.width;
    const containerHeight = props.height;

    if (props.children && Array.isArray(props.children)) {
      // First pass: create and measure children
      const childElements = [];
      const childDimensions = [];

      props.children.forEach((childSpec, index) => {
        if (!childSpec) return;

        // Create a temporary container
        const tempContainer = document.createElement('div');
        tempContainer.style.position = 'absolute';
        tempContainer.style.visibility = 'hidden';
        document.body.appendChild(tempContainer);

        // Create the child
        const child = createViz(childSpec, tempContainer);

        // Measure the child
        const bbox = child.element.getBBox();
        childElements.push(child.element);
        childDimensions.push({
          width: bbox.width,
          height: bbox.height
        });

        // Remove temporary container
        document.body.removeChild(tempContainer);
      });

      // Second pass: position children in a flow layout
      let currentX = 0;
      let currentY = 0;
      let rowHeight = 0;
      let columnWidth = 0;

      childElements.forEach((element, index) => {
        const width = childDimensions[index].width;
        const height = childDimensions[index].height;

        // Check if we need to wrap to a new line/column
        if (props.wrap) {
          if (isHorizontal && currentX + width > containerWidth) {
            currentX = 0;
            currentY += rowHeight + props.lineSpacing;
            rowHeight = 0;
          } else if (!isHorizontal && containerHeight && currentY + height > containerHeight) {
            currentY = 0;
            currentX += columnWidth + props.lineSpacing;
            columnWidth = 0;
          }
        }

        // Create a group for this child
        const childGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        childGroup.setAttribute('transform', `translate(${currentX}, ${currentY})`);

        // Clone the element and append to our group
        const clonedElement = element.cloneNode(true);
        childGroup.appendChild(clonedElement);

        // Append the child group to the flow
        flow.appendChild(childGroup);

        // Update position for next child
        if (isHorizontal) {
          currentX += width + props.spacing;
          rowHeight = Math.max(rowHeight, height);
        } else {
          currentY += height + props.spacing;
          columnWidth = Math.max(columnWidth, width);
        }
      });
    }

    return flow;
  }
});

// Define the repeat primitive
createViz({
  type: "define",
  name: "repeat",
  properties: {
    data: { required: true }, // Array of data items
    template: { required: true }, // Template specification to repeat
    spacing: { default: 0 },
    direction: { default: "horizontal" }, // "horizontal" or "vertical"
    width: { default: "100%" },
    height: { default: "100%" }
  },
  implementation: function(props) {
    // Create a group for the repeated elements
    const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');

    // Ensure data is an array
    const data = Array.isArray(props.data) ? props.data : [];

    // Calculate dimensions
    const isHorizontal = props.direction === "horizontal";
    const totalWidth = typeof props.width === 'string' ? 100 : props.width;
    const totalHeight = typeof props.height === 'string' ? 100 : props.height;

    // Create and position repeated elements
    data.forEach((item, index) => {
      // Create a template instance for this data item
      let templateSpec;

      if (typeof props.template === 'function') {
        // If template is a function, call it with the data item
        templateSpec = props.template(item, index, data);
      } else {
        // Otherwise, clone the template and add data binding
        templateSpec = JSON.parse(JSON.stringify(props.template));
        templateSpec._data = item;
        templateSpec._index = index;
      }

      if (!templateSpec) return;

      // Create a group for this instance
      const instanceGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');

      // Position based on direction and spacing
      const x = isHorizontal ? index * props.spacing : 0;
      const y = isHorizontal ? 0 : index * props.spacing;
      instanceGroup.setAttribute('transform', `translate(${x}, ${y})`);

      // Create and append the template instance
      const instance = createViz(templateSpec, { appendChild: (el) => instanceGroup.appendChild(el) });

      // Append the instance group to the main group
      group.appendChild(instanceGroup);
    });

    return group;
  }
});

// Define the panel primitive
createViz({
  type: "define",
  name: "panel",
  properties: {
    x: { default: 0 },
    y: { default: 0 },
    width: { required: true },
    height: { required: true },
    fill: { default: "white" },
    stroke: { default: "#ccc" },
    strokeWidth: { default: 1 },
    cornerRadius: { default: 0 },
    shadow: { default: false },
    shadowOffset: { default: { x: 3, y: 3 } },
    shadowBlur: { default: 5 },
    shadowColor: { default: "rgba(0,0,0,0.2)" },
    padding: { default: 10 },
    children: { default: [] }
  },
  implementation: function(props) {
    // Create a group for the panel
    const panel = document.createElementNS('http://www.w3.org/2000/svg', 'g');

    // Create shadow if specified
    if (props.shadow) {
      const shadow = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      shadow.setAttribute('x', props.x + props.shadowOffset.x);
      shadow.setAttribute('y', props.y + props.shadowOffset.y);
      shadow.setAttribute('width', props.width);
      shadow.setAttribute('height', props.height);
      shadow.setAttribute('rx', props.cornerRadius);
      shadow.setAttribute('ry', props.cornerRadius);
      shadow.setAttribute('fill', props.shadowColor);
      shadow.setAttribute('filter', `blur(${props.shadowBlur}px)`);
      panel.appendChild(shadow);
    }

    // Create background rectangle
    const background = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    background.setAttribute('x', props.x);
    background.setAttribute('y', props.y);
    background.setAttribute('width', props.width);
    background.setAttribute('height', props.height);
    background.setAttribute('rx', props.cornerRadius);
    background.setAttribute('ry', props.cornerRadius);
    background.setAttribute('fill', props.fill);
    background.setAttribute('stroke', props.stroke);
    background.setAttribute('stroke-width', props.strokeWidth);
    panel.appendChild(background);

    // Create a group for the content with padding
    const contentGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    contentGroup.setAttribute('transform', `translate(${props.x + props.padding}, ${props.y + props.padding})`);

    // Create and append children to the content group
    if (props.children && Array.isArray(props.children)) {
      for (const childSpec of props.children) {
        if (childSpec) {
          const child = createViz(childSpec, { appendChild: (el) => contentGroup.appendChild(el) });
        }
      }
    }

    panel.appendChild(contentGroup);

    return panel;
  }
});
