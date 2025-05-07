  // Tooltip functionality
  let tooltip = null;

  function showTooltip(event) {
    if (!tooltip) {
      tooltip = document.createElement('div');
      tooltip.style.position = 'fixed';
      tooltip.style.padding = '8px';
      tooltip.style.background = 'white';
      tooltip.style.border = '1px solid #ccc';
      tooltip.style.borderRadius = '4px';
      tooltip.style.pointerEvents = 'none';
      tooltip.style.zIndex = '1000';
      tooltip.style.fontSize = '12px';
      tooltip.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)';
      document.body.appendChild(tooltip);
    }

    const data = event.target._data;
    if (data) {
      let html = '<div style="font-weight: bold; margin-bottom: 4px;">Data Point</div>';
      for (const [key, value] of Object.entries(data)) {
        html += `<div><strong>${key}:</strong> ${value}</div>`;
      }
      tooltip.innerHTML = html;
      tooltip.style.display = 'block';
      moveTooltip(event);
    }
  }

  function moveTooltip(event) {
    if (tooltip) {
      tooltip.style.left = (event.pageX + 10) + 'px';
      tooltip.style.top = (event.pageY + 10) + 'px';
    }
  }

  function hideTooltip() {
    if (tooltip) {
      tooltip.style.display = 'none';
    }
  }

  // Export tooltip functions to the global scope
  window.showTooltip = showTooltip;
  window.moveTooltip = moveTooltip;
  window.hideTooltip = hideTooltip;

  // Define the tooltip primitive
  buildViz({
      type: "define",
      name: "tooltip",
      properties: {
        x: { required: true },
        y: { required: true },
        content: { required: true }, // Text or child elements
        fill: { default: "white" },
        stroke: { default: "#ccc" },
        strokeWidth: { default: 1 },
        cornerRadius: { default: 3 },
        padding: { default: 5 },
        fontSize: { default: "12px" },
        fontFamily: { default: "Arial" },
        textColor: { default: "#333" },
        shadow: { default: true },
        shadowColor: { default: "rgba(0,0,0,0.2)" },
        shadowBlur: { default: 3 },
        shadowOffset: { default: { x: 2, y: 2 } },
        arrow: { default: true },
        arrowSize: { default: 5 },
        arrowPosition: { default: "bottom" }, // "top", "right", "bottom", "left"
        maxWidth: { default: 200 }
      },
      implementation: function(props, container) {
        // Create a group for the tooltip
        const tooltip = document.createElementNS('http://www.w3.org/2000/svg', 'g');

        // Create content first to measure its size
        let contentElement;
        let contentWidth = 0;
        let contentHeight = 0;

        if (typeof props.content === 'string') {
          // Create text element for string content
          contentElement = document.createElementNS('http://www.w3.org/2000/svg', 'text');
          contentElement.setAttribute('font-size', props.fontSize);
          contentElement.setAttribute('font-family', props.fontFamily);
          contentElement.setAttribute('fill', props.textColor);

          // Handle text wrapping if needed
          if (props.maxWidth) {
            const words = props.content.split(' ');
            let line = '';
            let lineHeight = parseInt(props.fontSize) * 1.2;
            let tspan = document.createElementNS('http://www.w3.org/2000/svg', 'tspan');
            tspan.setAttribute('x', 0);
            tspan.setAttribute('y', 0);
            contentElement.appendChild(tspan);

            let y = 0;

            for (let i = 0; i < words.length; i++) {
              let testLine = line + words[i] + ' ';
              tspan.textContent = testLine;

              if (tspan.getComputedTextLength() > props.maxWidth - (props.padding * 2)) {
                // Create a new line
                tspan = document.createElementNS('http://www.w3.org/2000/svg', 'tspan');
                tspan.setAttribute('x', 0);
                y += lineHeight;
                tspan.setAttribute('y', y);
                tspan.textContent = words[i] + ' ';
                contentElement.appendChild(tspan);
                line = words[i] + ' ';
              } else {
                line = testLine;
              }
            }

            contentHeight = y + lineHeight;
          } else {
            contentElement.textContent = props.content;
          }

          // Append to DOM temporarily to measure
          document.body.appendChild(contentElement);
          const bbox = contentElement.getBBox();
          contentWidth = bbox.width;
          contentHeight = contentHeight || bbox.height;
          document.body.removeChild(contentElement);
        } else if (typeof props.content === 'object') {
          // Handle complex content
          // This would need a more sophisticated implementation
          // For now, we'll use a placeholder
          contentWidth = 100;
          contentHeight = 50;
        }

        // Calculate tooltip dimensions
        const tooltipWidth = contentWidth + (props.padding * 2);
        const tooltipHeight = contentHeight + (props.padding * 2);

        // Adjust position based on arrow
        let tooltipX = props.x;
        let tooltipY = props.y;
        let arrowPoints = '';

        if (props.arrow) {
          const arrowSize = props.arrowSize;

          if (props.arrowPosition === 'bottom') {
            tooltipY -= tooltipHeight + props.arrowSize;
            arrowPoints = `${tooltipX},${tooltipY + tooltipHeight} ${tooltipX + arrowSize},${tooltipY + tooltipHeight} ${tooltipX + arrowSize / 2},${tooltipY + tooltipHeight + arrowSize}`;
          } else if (props.arrowPosition === 'top') {
            tooltipY += props.arrowSize;
            arrowPoints = `${tooltipX},${tooltipY} ${tooltipX + arrowSize},${tooltipY} ${tooltipX + arrowSize / 2},${tooltipY - arrowSize}`;
          } else if (props.arrowPosition === 'right') {
            tooltipX -= tooltipWidth + props.arrowSize;
            arrowPoints = `${tooltipX + tooltipWidth},${tooltipY} ${tooltipX + tooltipWidth},${tooltipY + arrowSize} ${tooltipX + tooltipWidth + arrowSize},${tooltipY + arrowSize / 2}`;
          } else if (props.arrowPosition === 'left') {
            tooltipX += props.arrowSize;
            arrowPoints = `${tooltipX},${tooltipY} ${tooltipX},${tooltipY + arrowSize} ${tooltipX - arrowSize},${tooltipY + arrowSize / 2}`;
          }
        }

        // Create shadow if specified
        if (props.shadow) {
          const shadow = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
          shadow.setAttribute('x', tooltipX + props.shadowOffset.x);
          shadow.setAttribute('y', tooltipY + props.shadowOffset.y);
          shadow.setAttribute('width', tooltipWidth);
          shadow.setAttribute('height', tooltipHeight);
          shadow.setAttribute('rx', props.cornerRadius);
          shadow.setAttribute('ry', props.cornerRadius);
          shadow.setAttribute('fill', props.shadowColor);
          shadow.setAttribute('filter', `blur(${props.shadowBlur}px)`);
          tooltip.appendChild(shadow);
        }

        // Create background rectangle
        const background = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        background.setAttribute('x', tooltipX);
        background.setAttribute('y', tooltipY);
        background.setAttribute('width', tooltipWidth);
        background.setAttribute('height', tooltipHeight);
        background.setAttribute('rx', props.cornerRadius);
        background.setAttribute('ry', props.cornerRadius);
        background.setAttribute('fill', props.fill);
        background.setAttribute('stroke', props.stroke);
        background.setAttribute('stroke-width', props.strokeWidth);
        tooltip.appendChild(background);

        // Create arrow if specified
        if (props.arrow) {
          const arrow = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
          arrow.setAttribute('points', arrowPoints);
          arrow.setAttribute('fill', props.fill);
          arrow.setAttribute('stroke', props.stroke);
          arrow.setAttribute('stroke-width', props.strokeWidth);
          tooltip.appendChild(arrow);
        }

        // Add content
        if (contentElement) {
          contentElement.setAttribute('x', tooltipX + props.padding);
          contentElement.setAttribute('y', tooltipY + props.padding + parseInt(props.fontSize));
          tooltip.appendChild(contentElement);
        }

        // Add to container
        const svg = ensureSvg(container);
        svg.appendChild(tooltip);

        return tooltip;
      }
    });
