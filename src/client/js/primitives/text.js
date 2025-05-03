// Text and Label Primitives
// =======================

// Define the text primitive
createViz({
  type: "define",
  name: "text",
  properties: {
    x: { required: true },
    y: { required: true },
    text: { required: true },
    fontSize: { default: '12px' },
    fontFamily: { default: 'Arial' },
    fontWeight: { default: 'normal' },
    fontStyle: { default: 'normal' },
    fill: { default: '#333' },
    textAnchor: { default: 'start' },
    dominantBaseline: { default: 'auto' },
    transform: { default: null },
    opacity: { default: 1 }
  },
  implementation: function(props) {
    // Create SVG text element
    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');

    // Set attributes from props
    text.setAttribute('x', props.x);
    text.setAttribute('y', props.y);

    // Set style attributes
    if (props.fontSize) text.setAttribute('font-size', props.fontSize);
    if (props.fontFamily) text.setAttribute('font-family', props.fontFamily);
    if (props.fontWeight) text.setAttribute('font-weight', props.fontWeight);
    if (props.fontStyle) text.setAttribute('font-style', props.fontStyle);
    if (props.fill) text.setAttribute('fill', props.fill);
    if (props.textAnchor) text.setAttribute('text-anchor', props.textAnchor);
    if (props.dominantBaseline !== 'auto') text.setAttribute('dominant-baseline', props.dominantBaseline);
    if (props.transform) text.setAttribute('transform', props.transform);
    if (props.opacity !== 1) text.setAttribute('opacity', props.opacity);

    // Set text content
    text.textContent = props.text;

    return text;
  }
});

// Define the textPath primitive
createViz({
  type: "define",
  name: "textPath",
  properties: {
    path: { required: true }, // Path data or reference to path element
    text: { required: true },
    startOffset: { default: '0%' },
    fontSize: { default: '12px' },
    fontFamily: { default: 'Arial' },
    fill: { default: '#333' },
    method: { default: 'align' }, // 'align' or 'stretch'
    spacing: { default: 'auto' }, // 'auto' or 'exact'
    opacity: { default: 1 }
  },
  implementation: function(props) {
    // Create SVG elements
    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    const textPath = document.createElementNS('http://www.w3.org/2000/svg', 'textPath');

    // Create a unique ID for the path
    const pathId = `path-${Math.random().toString(36).substr(2, 9)}`;

    // Create a path element if path data is provided
    if (typeof props.path === 'string' && !props.path.startsWith('#')) {
      const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
      const pathElement = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      pathElement.setAttribute('id', pathId);
      pathElement.setAttribute('d', props.path);
      defs.appendChild(pathElement);
      text.appendChild(defs);
      textPath.setAttribute('href', `#${pathId}`);
    } else {
      // Use existing path reference
      textPath.setAttribute('href', props.path);
    }

    // Set attributes for textPath
    if (props.startOffset) textPath.setAttribute('startOffset', props.startOffset);
    if (props.method !== 'align') textPath.setAttribute('method', props.method);
    if (props.spacing !== 'auto') textPath.setAttribute('spacing', props.spacing);

    // Set text content
    textPath.textContent = props.text;

    // Set style attributes for text
    if (props.fontSize) text.setAttribute('font-size', props.fontSize);
    if (props.fontFamily) text.setAttribute('font-family', props.fontFamily);
    if (props.fill) text.setAttribute('fill', props.fill);
    if (props.opacity !== 1) text.setAttribute('opacity', props.opacity);

    // Append textPath to text
    text.appendChild(textPath);

    return text;
  }
});

// Define the label primitive (text with optional background)
createViz({
  type: "define",
  name: "label",
  properties: {
    x: { required: true },
    y: { required: true },
    text: { required: true },
    fontSize: { default: '12px' },
    fontFamily: { default: 'Arial' },
    fontWeight: { default: 'normal' },
    fill: { default: '#333' },
    textAnchor: { default: 'start' },
    backgroundColor: { default: null },
    padding: { default: 4 },
    cornerRadius: { default: 0 },
    borderColor: { default: null },
    borderWidth: { default: 0 },
    opacity: { default: 1 }
  },
  implementation: function(props) {
    // Create a group to hold the background and text
    const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');

    // Create a temporary text element to measure the text dimensions
    const tempText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    tempText.setAttribute('font-size', props.fontSize);
    tempText.setAttribute('font-family', props.fontFamily);
    tempText.setAttribute('font-weight', props.fontWeight);
    tempText.textContent = props.text;

    // Append to DOM temporarily to get dimensions
    document.body.appendChild(tempText);
    const textBBox = tempText.getBBox();
    document.body.removeChild(tempText);

    // Calculate background dimensions
    const padding = props.padding;
    const bgWidth = textBBox.width + (padding * 2);
    const bgHeight = textBBox.height + (padding * 2);

    // Adjust position based on text anchor
    let bgX = props.x;
    if (props.textAnchor === 'middle') {
      bgX -= bgWidth / 2;
    } else if (props.textAnchor === 'end') {
      bgX -= bgWidth;
    }
    const bgY = props.y - textBBox.height + padding;

    // Create background if specified
    if (props.backgroundColor || props.borderColor) {
      const background = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      background.setAttribute('x', bgX);
      background.setAttribute('y', bgY);
      background.setAttribute('width', bgWidth);
      background.setAttribute('height', bgHeight);
      background.setAttribute('rx', props.cornerRadius);
      background.setAttribute('ry', props.cornerRadius);

      if (props.backgroundColor) {
        background.setAttribute('fill', props.backgroundColor);
      } else {
        background.setAttribute('fill', 'none');
      }

      if (props.borderColor && props.borderWidth > 0) {
        background.setAttribute('stroke', props.borderColor);
        background.setAttribute('stroke-width', props.borderWidth);
      }

      group.appendChild(background);
    }

    // Create the text element
    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text.setAttribute('x', props.x);
    text.setAttribute('y', props.y);
    text.setAttribute('font-size', props.fontSize);
    text.setAttribute('font-family', props.fontFamily);
    text.setAttribute('font-weight', props.fontWeight);
    text.setAttribute('fill', props.fill);
    text.setAttribute('text-anchor', props.textAnchor);
    text.setAttribute('dominant-baseline', 'text-before-edge');
    text.textContent = props.text;

    group.appendChild(text);

    // Set opacity for the whole group if needed
    if (props.opacity !== 1) {
      group.setAttribute('opacity', props.opacity);
    }

    return group;
  }
});

// Define the title primitive (styled text for headings)
createViz({
  type: "define",
  name: "title",
  properties: {
    x: { required: true },
    y: { required: true },
    text: { required: true },
    fontSize: { default: '18px' },
    fontFamily: { default: 'Arial' },
    fontWeight: { default: 'bold' },
    fill: { default: '#333' },
    textAnchor: { default: 'middle' },
    underline: { default: false },
    opacity: { default: 1 }
  },
  implementation: function(props) {
    // Create a group to hold the title and optional underline
    const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');

    // Create the text element
    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text.setAttribute('x', props.x);
    text.setAttribute('y', props.y);
    text.setAttribute('font-size', props.fontSize);
    text.setAttribute('font-family', props.fontFamily);
    text.setAttribute('font-weight', props.fontWeight);
    text.setAttribute('fill', props.fill);
    text.setAttribute('text-anchor', props.textAnchor);
    text.textContent = props.text;

    group.appendChild(text);

    // Add underline if specified
    if (props.underline) {
      // Create a temporary text element to measure the text dimensions
      const tempText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      tempText.setAttribute('font-size', props.fontSize);
      tempText.setAttribute('font-family', props.fontFamily);
      tempText.setAttribute('font-weight', props.fontWeight);
      tempText.textContent = props.text;

      // Append to DOM temporarily to get dimensions
      document.body.appendChild(tempText);
      const textBBox = tempText.getBBox();
      document.body.removeChild(tempText);

      // Calculate underline position and dimensions
      const underlineY = props.y + 5; // Offset from text baseline
      let underlineX = props.x;
      let underlineWidth = textBBox.width;

      // Adjust position based on text anchor
      if (props.textAnchor === 'middle') {
        underlineX -= underlineWidth / 2;
      } else if (props.textAnchor === 'end') {
        underlineX -= underlineWidth;
      }

      // Create the underline
      const underline = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      underline.setAttribute('x1', underlineX);
      underline.setAttribute('y1', underlineY);
      underline.setAttribute('x2', underlineX + underlineWidth);
      underline.setAttribute('y2', underlineY);
      underline.setAttribute('stroke', props.fill);
      underline.setAttribute('stroke-width', 1);

      group.appendChild(underline);
    }

    // Set opacity for the whole group if needed
    if (props.opacity !== 1) {
      group.setAttribute('opacity', props.opacity);
    }

    return group;
  }
});

// Define the multilineText primitive
createViz({
  type: "define",
  name: "multilineText",
  properties: {
    x: { required: true },
    y: { required: true },
    lines: { required: true }, // Array of text lines
    fontSize: { default: '12px' },
    fontFamily: { default: 'Arial' },
    fontWeight: { default: 'normal' },
    fill: { default: '#333' },
    textAnchor: { default: 'start' },
    lineHeight: { default: 1.2 }, // Line height as a multiple of font size
    opacity: { default: 1 }
  },
  implementation: function(props) {
    // Create a group to hold the text lines
    const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');

    // Calculate line height in pixels
    const fontSize = parseFloat(props.fontSize);
    const lineHeightPx = fontSize * props.lineHeight;

    // Create text elements for each line
    props.lines.forEach((line, index) => {
      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('x', props.x);
      text.setAttribute('y', props.y + (index * lineHeightPx));
      text.setAttribute('font-size', props.fontSize);
      text.setAttribute('font-family', props.fontFamily);
      text.setAttribute('font-weight', props.fontWeight);
      text.setAttribute('fill', props.fill);
      text.setAttribute('text-anchor', props.textAnchor);
      text.textContent = line;

      group.appendChild(text);
    });

    // Set opacity for the whole group if needed
    if (props.opacity !== 1) {
      group.setAttribute('opacity', props.opacity);
    }

    return group;
  }
});
