          import { buildViz, renderViz, updateViz } from '/src/index.ts';

      // Sample data
      const timeSeriesData = [
        { month: "Jan", value: 420, trend: "Increasing" },
        { month: "Feb", value: 380, trend: "Decreasing" },
        { month: "Mar", value: 450, trend: "Increasing" },
        { month: "Apr", value: 530, trend: "Increasing" },
        { month: "May", value: 480, trend: "Decreasing" },
        { month: "Jun", value: 520, trend: "Increasing" },
        { month: "Jul", value: 590, trend: "Increasing" },
        { month: "Aug", value: 640, trend: "Increasing" },
        { month: "Sep", value: 610, trend: "Decreasing" },
        { month: "Oct", value: 670, trend: "Increasing" },
        { month: "Nov", value: 720, trend: "Increasing" },
        { month: "Dec", value: 680, trend: "Decreasing" }
      ];

      // Register data for potential reuse
      // registerData('timeSeriesData', timeSeriesData);

      // Default chart options
      let chartOptions = {
        showLine: true,
        showPoints: true,
        fillArea: false,
        curve: 'linear'
      };

      // Function to create the visualization
      function createVisualization(options) {
        // Clear the container
        const container = document.getElementById("timeline");
        container.innerHTML = '';

        // Create a line chart specification
        const spec = {
          type: "lineChart",
          data: timeSeriesData,
          x: { field: "month" },
          y: { field: "value" },
          color: { field: "trend" },
          title: "Monthly Value Trends",
          showLine: options.showLine,
          showPoints: options.showPoints,
          fillArea: options.fillArea,
          fillOpacity: 0.3,
          curve: options.curve,
          grid: true,
          lineWidth: 2,
          pointSize: 5,
          annotations: [{
            x: 'Jun',
            y: 520,
              children: [
                  {
                      type: 'text',
                      text: 'Trend: Decreasing',
                      x: 10,
                      y: -10,
                      color: 'red',
                      fontSize: 12,
                      fontWeight: 'bold',
                      textAlign: 'left',
                      textBaseline: 'top'
                  },
                  {
                      type: 'line',
                      x1: 0, y1: 0,
                      x2: 10, y2: -10
                  },
                  {
                      type: 'verticalLine',
                      x: 0,
                      y1: -150,
                      y2: 337,
                  }
            ]
          },
          {
            x: 'May',
            y: 480,
            children: [{
              type: 'text',
              text: 'Trend: Increasing',

              color: 'green',
              fontSize: 12,
              fontWeight: 'bold',
              textAlign: 'left',
              textBaseline: 'top'
            }]
          }
          ]
        };

        // Build the visualization
        const viz = buildViz(spec);

        // Render the visualization
        return renderViz(viz, container);
      }

  // Create the initial visualization
      let currentViz = createVisualization(chartOptions);



  const container = document.getElementById('tests-small-multiples');

  // Sample data for multiple medical test charts
  const medicalTestsData = [
    { testName: "Blood Pressure", value: 120, range: [80, 140], unit: "mmHg" },
    { testName: "Heart Rate", value: 72, range: [60, 100], unit: "bpm" },
    { testName: "Cholesterol", value: 180, range: [100, 200], unit: "mg/dL" },
    { testName: "Blood Sugar", value: 95, range: [70, 110], unit: "mg/dL" },
    { testName: "BMI", value: 24.5, range: [18.5, 25], unit: "" },
    { testName: "Temperature", value: 98.6, range: [97, 99], unit: "°F" },
    { testName: "Vitamin D", value: 35, range: [30, 50], unit: "ng/mL" },
    { testName: "Iron", value: 85, range: [60, 120], unit: "μg/dL" }
  ];

  // Configure the container for vertical flex layout with wrapping
container.style.display = 'flex';
container.style.flexDirection = 'column';
container.style.flexWrap = 'wrap';
container.style.alignContent = 'flex-start';
container.style.alignItems = 'flex-start';
container.style.gap = '16px';
container.style.height = '600px'; // Fixed height to force wrapping
container.style.maxHeight = '600px';
container.style.overflow = 'visible';
container.style.width = '100%';

  // Create small multiples array
  const medicalTestCharts = medicalTestsData.map((testData, index) => {
    // Create individual container for each chart
  const chartContainer = document.createElement('div');
  chartContainer.id = `medical-test-${index}`;
  chartContainer.style.width = '300px';
  chartContainer.style.height = '140px'; // Fixed height for each item
  chartContainer.style.minHeight = '140px';
  chartContainer.style.maxHeight = '140px';
  chartContainer.style.border = '1px solid #ddd';
  chartContainer.style.borderRadius = '8px';
  chartContainer.style.padding = '8px';
  chartContainer.style.backgroundColor = '#f9f9f9';
  chartContainer.style.flexShrink = '0'; // Prevent shrinking
  chartContainer.style.boxSizing = 'border-box';

    // Append to main container
    container.appendChild(chartContainer);

    // Create medical test chart specification
    const medicalTestSpec = {
      type: "medicalTestChart",
      data: [testData],
      title: testData.testName,
      value: { field: "value" },
      range: { field: "range", low: 0, high: 200 },
      unit: { field: "unit" },
      width: 280,
      height: 100,
      showTitle: true,
      showValue: true,
      showUnit: true,
      colorScale: {
        normal: "#4CAF50",
        warning: "#FF9800",
        danger: "#F44336"
      }
    };

    // Build and render the visualization
    const viz = buildViz(medicalTestSpec);
    const renderedViz = renderViz(viz, chartContainer);

    return {
      container: chartContainer,
      visualization: renderedViz,
      data: testData,
      spec: medicalTestSpec
    };
  });

  // Function to calculate optimal layout
  function calculateOptimalLayout() {
    const containerWidth = container.offsetWidth;
    const itemHeight = 156; // 140px + 16px gap
    const itemWidth = 216; // 200px + 16px gap

    const maxItemsPerColumn = Math.floor(600 / itemHeight); // Based on container height
    const maxColumns = Math.floor(containerWidth / itemWidth);

    console.log(`Container can fit ${maxItemsPerColumn} items per column and ${maxColumns} columns`);

    return { maxItemsPerColumn, maxColumns };
  }

  // Function to update all charts with new data
  function updateMedicalTestCharts(newDataArray) {
    medicalTestCharts.forEach((chart, index) => {
      if (newDataArray[index]) {
        const updatedSpec = {
          ...chart.spec,
          data: [newDataArray[index]]
        };
        updateViz(chart.visualization, updatedSpec);
      }
    });
  }

  // Debug: Log layout information
  console.log('Container dimensions:', {
    width: container.offsetWidth,
    height: container.offsetHeight,
    itemCount: medicalTestsData.length
  });

  calculateOptimalLayout();
