            // Define the barChart visualization type
            createViz({
                type: "define",
                name: "barChart",
                properties: {
                    data: { required: true },
                    x: { required: true },
                    y: { required: true },
                    color: { default: "#3366CC" },
                    width: { default: "100%" },
                    height: { default: "100%" },
                    margin: { default: { top: 40, right: 30, bottom: 60, left: 60 } },
                    tooltip: { default: false }
                },
                implementation: function(props, container) {
                    const svg = ensureSvg(container);

                    // Clear existing content
                    while (svg.firstChild) {
                        svg.removeChild(svg.firstChild);
                    }

                    // Get data
                    const data = [...props.data]; // Clone the data

                    // Set up dimensions
                    const margin = props.margin;
                    const width = container.clientWidth - margin.left - margin.right;
                    const height = container.clientHeight - margin.top - margin.bottom;

                    // Create a group for the chart
                    const chart = document.createElementNS('http://www.w3.org/2000/svg', 'g');
                    chart.setAttribute('transform', `translate(${margin.left}, ${margin.top})`);
                    svg.appendChild(chart);

                    // Create scales
                    const xField = props.x.field;
                    const yField = props.y.field;

                    const xScale = (index) => index * (width / data.length) + (width / data.length) * 0.5;
                    const yScale = (value) => height - (value / (Math.max(...data.map(d => d[yField])) * 1.1) * height);

                    // Create color scale
                    let colorScale;
                    if (typeof props.color === 'string') {
                        // Single color for all bars
                        colorScale = () => props.color;
                    } else if (props.color && props.color.field) {
                        // Color based on a field
                        const colorField = props.color.field;
                        const categories = [...new Set(data.map(d => d[colorField]))];
                        const colors = ["#3366CC", "#DC3912", "#FF9900", "#109618", "#990099"];
                        const colorMap = {};
                        categories.forEach((category, i) => {
                            colorMap[category] = colors[i % colors.length];
                        });
                        colorScale = (d) => colorMap[d[colorField]];
                    } else {
                        // Default color
                        colorScale = () => "#3366CC";
                    }

                    // Draw axes
                    // X-axis
                    const xAxis = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                    xAxis.setAttribute('x1', 0);
                    xAxis.setAttribute('y1', height);
                    xAxis.setAttribute('x2', width);
                    xAxis.setAttribute('y2', height);
                    xAxis.setAttribute('stroke', '#333');
                    xAxis.setAttribute('stroke-width', 1);
                    chart.appendChild(xAxis);

                    // X-axis label
                    const xAxisLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                    xAxisLabel.setAttribute('x', width / 2);
                    xAxisLabel.setAttribute('y', height + 40);
                    xAxisLabel.setAttribute('text-anchor', 'middle');
                    xAxisLabel.setAttribute('font-size', '14px');
                    xAxisLabel.textContent = xField;
                    chart.appendChild(xAxisLabel);

                    // Y-axis
                    const yAxis = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                    yAxis.setAttribute('x1', 0);
                    yAxis.setAttribute('y1', 0);
                    yAxis.setAttribute('x2', 0);
                    yAxis.setAttribute('y2', height);
                    yAxis.setAttribute('stroke', '#333');
                    yAxis.setAttribute('stroke-width', 1);
                    chart.appendChild(yAxis);

                    // Y-axis label
                    const yAxisLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                    yAxisLabel.setAttribute('x', -height / 2);
                    yAxisLabel.setAttribute('y', -40);
                    yAxisLabel.setAttribute('text-anchor', 'middle');
                    yAxisLabel.setAttribute('font-size', '14px');
                    yAxisLabel.setAttribute('transform', 'rotate(-90)');
                    yAxisLabel.textContent = yField;
                    chart.appendChild(yAxisLabel);

                    // Draw bars
                    data.forEach((d, i) => {
                        const barWidth = (width / data.length) * 0.8;
                        const barHeight = height - yScale(d[yField]);
                        const barX = xScale(i) - barWidth / 2;
                        const barY = yScale(d[yField]);

                        const bar = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
                        bar.setAttribute('x', barX);
                        bar.setAttribute('y', barY);
                        bar.setAttribute('width', barWidth);
                        bar.setAttribute('height', barHeight);
                        bar.setAttribute('fill', colorScale(d));
                        bar.setAttribute('stroke', '#fff');
                        bar.setAttribute('stroke-width', 1);

                        // Store data for tooltip
                        bar._data = d;

                        // Add event listeners for tooltip
                        if (props.tooltip) {
                            bar.addEventListener('mouseover', showTooltip);
                            bar.addEventListener('mousemove', moveTooltip);
                            bar.addEventListener('mouseout', hideTooltip);
                        }

                        chart.appendChild(bar);

                        // Add x-axis tick
                        const tick = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                        tick.setAttribute('x1', xScale(i));
                        tick.setAttribute('y1', height);
                        tick.setAttribute('x2', xScale(i));
                        tick.setAttribute('y2', height + 5);
                        tick.setAttribute('stroke', '#333');
                        tick.setAttribute('stroke-width', 1);
                        chart.appendChild(tick);

                        // Add x-axis label
                        const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                        label.setAttribute('x', xScale(i));
                        label.setAttribute('y', height + 20);
                        label.setAttribute('text-anchor', 'middle');
                        label.setAttribute('font-size', '12px');
                        label.textContent = d[xField];
                        chart.appendChild(label);
                    });

                    // Add title
                    const title = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                    title.setAttribute('x', width / 2);
                    title.setAttribute('y', -10);
                    title.setAttribute('text-anchor', 'middle');
                    title.setAttribute('font-size', '16px');
                    title.setAttribute('font-weight', 'bold');
                    title.textContent = `${yField} by ${xField}`;
                    chart.appendChild(title);

                    // Add legend if using categorical colors
                    if (props.color && props.color.field) {
                        const colorField = props.color.field;
                        const categories = [...new Set(data.map(d => d[colorField]))];
                        const colors = ["#3366CC", "#DC3912", "#FF9900", "#109618", "#990099"];

                        const legendGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
                        legendGroup.setAttribute('transform', `translate(${width - 100}, 0)`);
                        chart.appendChild(legendGroup);

                        categories.forEach((category, i) => {
                            const legendItem = document.createElementNS('http://www.w3.org/2000/svg', 'g');
                            legendItem.setAttribute('transform', `translate(0, ${i * 20})`);

                            const legendColor = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
                            legendColor.setAttribute('width', 12);
                            legendColor.setAttribute('height', 12);
                            legendColor.setAttribute('fill', colors[i % colors.length]);
                            legendItem.appendChild(legendColor);

                            const legendText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                            legendText.setAttribute('x', 20);
                            legendText.setAttribute('y', 10);
                            legendText.setAttribute('font-size', '12px');
                            legendText.textContent = category;
                            legendItem.appendChild(legendText);

                            legendGroup.appendChild(legendItem);
                        });
                    }

                    return {
                        element: svg,
                        spec: props
                    };
                }
            });
