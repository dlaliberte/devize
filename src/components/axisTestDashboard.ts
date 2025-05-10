/**
 * Axis Testing Dashboard
 *
 * Purpose: Interactive dashboard for testing and visualizing axis configurations
 * Author: Cody
 * Creation Date: 2023-11-15
 */

import { buildViz } from '../core/builder';
import { createAxis } from './axis';
import { createScale } from './scales/scale';
import { Scale } from './scales/scale-interface';

// Import UI control components
import '../components/controls';
import { registerAllControlComponents } from '../components/controls';

// Ensure all control components are registered
registerAllControlComponents();

export function createAxisTestDashboard(container: HTMLElement) {
    // Create dashboard container
    const dashboard = document.createElement('div');
    dashboard.className = 'axis-test-dashboard';
    dashboard.style.fontFamily = 'Arial, sans-serif';
    dashboard.style.padding = '20px';
    dashboard.style.display = 'flex';
    dashboard.style.flexDirection = 'column';
    dashboard.style.gap = '20px';

    // Create visualization container first (at the top)
    const vizContainer = document.createElement('div');
    vizContainer.className = 'visualization-container';
    vizContainer.style.border = '1px solid #ccc';
    vizContainer.style.borderRadius = '4px';
    vizContainer.style.padding = '20px';
    vizContainer.style.minHeight = '400px';
    vizContainer.style.position = 'relative';
    vizContainer.style.marginBottom = '20px';

    // Create chart area box
    const chartAreaBox = document.createElement('div');
    chartAreaBox.className = 'chart-area-box';
    chartAreaBox.style.width = '600px';
    chartAreaBox.style.height = '300px';
    chartAreaBox.style.border = '1px dashed #999';
    chartAreaBox.style.margin = '50px auto';
    chartAreaBox.style.position = 'relative';
    chartAreaBox.style.backgroundColor = '#f9f9f9';

    vizContainer.appendChild(chartAreaBox);

    // Add dashboard to main container
    container.appendChild(dashboard);

    // State for axis configuration
    const config = {
        orientation: 'bottom',
        length: 600,
        scaleType: 'linear',
        domain: [0, 100],
        tickCount: 5,
        tickLength: 6,
        tickLabelOffset: 5,
        stroke: '#000',
        strokeWidth: 1,
        fontSize: 12,
        fontFamily: 'Arial',
        title: 'Axis Title',
        titleFontSize: 14,
        titleFontWeight: 'bold',
        tickFormat: 'd', // Default format
        autoApply: true  // Auto apply changes by default
    };

    // Function to render the axis
    function renderAxis() {
        // Clear previous visualization
        chartAreaBox.innerHTML = '';

        // Create SVG container
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('width', '100%');
        svg.setAttribute('height', '100%');
        svg.style.overflow = 'visible';
        chartAreaBox.appendChild(svg);

        // Calculate transform based on orientation
        let transform = '';
        switch (config.orientation) {
            case 'bottom':
                transform = `translate(0, ${chartAreaBox.clientHeight})`;
                break;
            case 'top':
                transform = `translate(0, 0)`;
                break;
            case 'left':
                transform = `translate(0, 0)`;
                break;
            case 'right':
                transform = `translate(${chartAreaBox.clientWidth}, 0)`;
                break;
        }

        // Create scale
        let scale: Scale;
        try {
            // For horizontal axes
            if (config.orientation === 'bottom' || config.orientation === 'top') {
                scale = createScale(config.scaleType, {
                    domain: config.domain,
                    range: [0, chartAreaBox.clientWidth]
                });
            }
            // For vertical axes
            else {
                scale = createScale(config.scaleType, {
                    domain: config.domain,
                    range: [chartAreaBox.clientHeight, 0]
                });
            }
        } catch (error) {
            console.error('Error creating scale:', error);
            const errorMsg = document.createElement('div');
            errorMsg.textContent = `Error creating scale: ${error.message}`;
            errorMsg.style.color = 'red';
            chartAreaBox.appendChild(errorMsg);
            return;
        }

        // Create format function based on selected format
        let formatFunction;
        try {
            formatFunction = createFormatFunction(config.tickFormat);
        } catch (error) {
            console.error('Error creating format function:', error);
            formatFunction = (value: any) => String(value);
        }

        // Create axis
        try {
            const axis = createAxis({
                orientation: config.orientation as any,
                length: config.orientation === 'left' || config.orientation === 'right'
                    ? chartAreaBox.clientHeight
                    : chartAreaBox.clientWidth,
                scale: scale,
                title: config.title,
                tickCount: config.tickCount,
                tickLength: config.tickLength,
                tickLabelOffset: config.tickLabelOffset,
                stroke: config.stroke,
                strokeWidth: config.strokeWidth,
                fontSize: `${config.fontSize}px`,
                fontFamily: config.fontFamily,
                titleFontSize: `${config.titleFontSize}px`,
                titleFontWeight: config.titleFontWeight,
                transform: transform,
                format: formatFunction
            });

            // Render axis to SVG
            if (axis && axis.renderToSvg) {
                axis.renderToSvg(svg);
            } else {
                throw new Error('Failed to create renderable axis');
            }
        } catch (error) {
            console.error('Error rendering axis:', error);
            const errorMsg = document.createElement('div');
            errorMsg.textContent = `Error rendering axis: ${error.message}`;
            errorMsg.style.color = 'red';
            chartAreaBox.appendChild(errorMsg);
        }

        // Add configuration display
        const configDisplay = document.createElement('pre');
        configDisplay.textContent = JSON.stringify(config, null, 2);
        configDisplay.style.position = 'absolute';
        configDisplay.style.right = '20px';
        configDisplay.style.top = '20px';
        configDisplay.style.backgroundColor = '#f5f5f5';
        configDisplay.style.padding = '10px';
        configDisplay.style.borderRadius = '4px';
        configDisplay.style.fontSize = '12px';
        configDisplay.style.maxHeight = '300px';
        configDisplay.style.overflow = 'auto';
        vizContainer.appendChild(configDisplay);
    }

    // Function to create a format function based on format string
    function createFormatFunction(formatStr: string) {
        return (value: any) => {
            if (value === undefined || value === null) return '';

            // Handle dates
            if (value instanceof Date) {
                const options: Intl.DateTimeFormatOptions = {};

                switch (formatStr) {
                    case 'date':
                        options.year = 'numeric';
                        options.month = 'short';
                        options.day = 'numeric';
                        break;
                    case 'time':
                        options.hour = 'numeric';
                        options.minute = 'numeric';
                        break;
                    case 'datetime':
                        options.year = 'numeric';
                        options.month = 'short';
                        options.day = 'numeric';
                        options.hour = 'numeric';
                        options.minute = 'numeric';
                        break;
                    case 'year':
                        options.year = 'numeric';
                        break;
                    case 'month':
                        options.month = 'short';
                        break;
                    default:
                        return value.toLocaleString();
                }

                return value.toLocaleString(undefined, options);
            }

            // Handle numbers
            if (typeof value === 'number') {
                switch (formatStr) {
                    case 'd':
                        return Math.round(value).toString();
                    case '.1f':
                        return value.toFixed(1);
                    case '.2f':
                        return value.toFixed(2);
                    case '.3f':
                        return value.toFixed(3);
                    case ',d':
                        return value.toLocaleString(undefined, { maximumFractionDigits: 0 });
                    case ',.1f':
                        return value.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 });
                    case ',.2f':
                        return value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                    case '%':
                        return (value * 100).toFixed(0) + '%';
                    case '.1%':
                        return (value * 100).toFixed(1) + '%';
                    case '.2%':
                        return (value * 100).toFixed(2) + '%';
                    case '$':
                        return '$' + Math.round(value).toLocaleString();
                    case '$.2f':
                        return '$' + value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                    default:
                        return value.toString();
                }
            }

            // Default for other types
            return String(value);
        };
    }

    // Create control components

    // 1. Orientation controls
    const orientationRadio = buildViz({
        type: 'radioGroup',
        label: 'Orientation',
        name: 'orientation',
        value: config.orientation,
        options: ['bottom', 'top', 'left', 'right'],
        layout: 'vertical',
        onChange: (value) => {
            config.orientation = value;
            if (config.autoApply) renderAxis();
        }
    });

    const lengthSlider = buildViz({
        type: 'slider',
        label: 'Length',
        value: config.length,
        min: 100,
        max: 800,
        step: 10,
        showValue: true,
        valueFormat: (value) => `${value}px`,
        onChange: (value) => {
            config.length = value;
            if (config.autoApply) renderAxis();
        }
    });

    // 2. Scale controls
    const scaleTypeRadio = buildViz({
        type: 'radioGroup',
        label: 'Scale Type',
        name: 'scaleType',
        value: config.scaleType,
        options: ['linear', 'band', 'ordinal', 'log', 'time'],
        layout: 'vertical',
        onChange: (value) => {
            config.scaleType = value;

            // Update domain based on scale type
            if (value === 'band' || value === 'ordinal') {
                config.domain = ['A', 'B', 'C', 'D', 'E'];
            } else if (value === 'time') {
                config.domain = [new Date(2023, 0, 1), new Date(2023, 11, 31)];
            } else {
                config.domain = [0, 100];
            }

            if (config.autoApply) renderAxis();
        }
    });

    const domainInput = buildViz({
        type: 'textInput',
        label: 'Domain',
        value: JSON.stringify(config.domain),
        onBlur: (value) => {
            try {
                config.domain = JSON.parse(value);
                if (config.autoApply) renderAxis();
            } catch (error) {
                alert('Invalid domain format. Please use JSON array format.');
                domainInput.setValue(JSON.stringify(config.domain));
            }
        }
    });

    // 3. Tick controls
    const tickCountSlider = buildViz({
        type: 'slider',
        label: 'Tick Count',
        value: config.tickCount,
        min: 2,
        max: 20,
        step: 1,
        showValue: true,
        onChange: (value) => {
            config.tickCount = value;
            if (config.autoApply) renderAxis();
        }
    });

    const tickLengthSlider = buildViz({
        type: 'slider',
        label: 'Tick Length',
        value: config.tickLength,
        min: 1,
        max: 20,
        step: 1,
        showValue: true,
        valueFormat: (value) => `${value}px`,
        onChange: (value) => {
            config.tickLength = value;
            if (config.autoApply) renderAxis();
        }
    });

    const tickLabelOffsetSlider = buildViz({
        type: 'slider',
        label: 'Label Offset',
        value: config.tickLabelOffset,
        min: 0,
        max: 30,
        step: 1,
        showValue: true,
        valueFormat: (value) => `${value}px`,
        onChange: (value) => {
            config.tickLabelOffset = value;
            if (config.autoApply) renderAxis();
        }
    });

    // 4. Style controls
    const strokeColorInput = buildViz({
        type: 'colorInput',
        label: 'Stroke Color',
        value: config.stroke,
        onChange: (value) => {
            config.stroke = value;
            if (config.autoApply) renderAxis();
        }
    });

    const strokeWidthSlider = buildViz({
        type: 'slider',
        label: 'Stroke Width',
        value: config.strokeWidth,
        min: 0.5,
        max: 5,
        step: 0.5,
        showValue: true,
        valueFormat: (value) => `${value}px`,
        onChange: (value) => {
            config.strokeWidth = value;
            if (config.autoApply) renderAxis();
        }
    });

    const fontSizeSlider = buildViz({
        type: 'slider',
        label: 'Font Size',
        value: config.fontSize,
        min: 8,
        max: 24,
        step: 1,
        showValue: true,
        valueFormat: (value) => `${value}px`,
        onChange: (value) => {
            config.fontSize = value;
            if (config.autoApply) renderAxis();
        }
    });

    const fontFamilySelect = buildViz({
        type: 'select',
        label: 'Font Family',
        value: config.fontFamily,
        options: ['Arial', 'Helvetica', 'Times New Roman', 'Courier New', 'Georgia', 'Verdana'],
        onChange: (value) => {
            config.fontFamily = value;
            if (config.autoApply) renderAxis();
        }
    });

    // 5. Title controls
    const titleInput = buildViz({
        type: 'textInput',
        label: 'Title',
        value: config.title,
        onChange: (value) => {
            config.title = value;
            if (config.autoApply) renderAxis();
        }
    });

    const titleFontSizeSlider = buildViz({
        type: 'slider',
        label: 'Title Font Size',
        value: config.titleFontSize,
        min: 10,
        max: 32,
        step: 1,
        showValue: true,
        valueFormat: (value) => `${value}px`,
        onChange: (value) => {
            config.titleFontSize = value;
            if (config.autoApply) renderAxis();
        }
    });

    const titleFontWeightSelect = buildViz({
        type: 'select',
        label: 'Title Font Weight',
        value: config.titleFontWeight,
        options: ['normal', 'bold', 'lighter', 'bolder', '100', '200', '300', '400', '500', '600', '700', '800', '900'],
        onChange: (value) => {
            config.titleFontWeight = value;
            if (config.autoApply) renderAxis();
        }
    });

    // 6. Format controls
    const formatSelect = buildViz({
        type: 'select',
        label: 'Tick Format',
        value: config.tickFormat,
        options: [
            { value: 'd', label: 'Integer (d)' },
            { value: '.1f', label: '1 Decimal (.1f)' },
            { value: '.2f', label: '2 Decimals (.2f)' },
            { value: '.3f', label: '3 Decimals (.3f)' },
            { value: ',d', label: 'Integer with commas (,d)' },
            { value: ',.1f', label: '1 Decimal with commas (,.1f)' },
            { value: ',.2f', label: '2 Decimals with commas (,.2f)' },
            { value: '%', label: 'Percentage (%)' },
            { value: '.1%', label: 'Percentage 1 decimal (.1%)' },
            { value: '.2%', label: 'Percentage 2 decimals (.2%)' },
            { value: '$', label: 'Currency ($)' },
            { value: '$.2f', label: 'Currency 2 decimals ($.2f)' },
            { value: 'date', label: 'Date (for time scales)' },
            { value: 'time', label: 'Time (for time scales)' },
            { value: 'datetime', label: 'Date & Time (for time scales)' },
            { value: 'year', label: 'Year only (for time scales)' },
            { value: 'month', label: 'Month only (for time scales)' }
        ],
        onChange: (value) => {
            config.tickFormat = value;
            if (config.autoApply) renderAxis();
        }
    });

    // 7. Auto-apply control
    const autoApplyCheckbox = buildViz({
        type: 'checkbox',
        label: 'Auto Apply Changes',
        value: config.autoApply,
        onChange: (value) => {
            config.autoApply = value;
        }
    });

    // Create apply button
    const applyButton = document.createElement('button');
    applyButton.textContent = 'Apply Changes';
    applyButton.style.padding = '10px 20px';
    applyButton.style.backgroundColor = '#4CAF50';
    applyButton.style.color = 'white';
    applyButton.style.border = 'none';
    applyButton.style.borderRadius = '4px';
    applyButton.style.cursor = 'pointer';
    applyButton.style.fontSize = '16px';
    applyButton.style.marginTop = '20px';
    applyButton.addEventListener('click', renderAxis);

    // Create control dashboard
    const controlsDashboard = buildViz({
        type: 'dashboard',
        sections: [
            {
                title: 'Orientation',
                controls: [orientationRadio, lengthSlider]
            },
            {
                title: 'Scale',
                controls: [scaleTypeRadio, domainInput]
            },
            {
                title: 'Ticks',
                controls: [tickCountSlider, tickLengthSlider, tickLabelOffsetSlider, formatSelect]
            },
            {
                title: 'Style',
                controls: [strokeColorInput, strokeWidthSlider, fontSizeSlider, fontFamilySelect]
            },
            {
                title: 'Title',
                controls: [titleInput, titleFontSizeSlider, titleFontWeightSelect]
            }
        ]
    });

    // Add visualization container to dashboard
    dashboard.appendChild(vizContainer);

    // Add controls dashboard to main dashboard
    if (controlsDashboard && controlsDashboard.element) {
        dashboard.appendChild(controlsDashboard.element);
    }

    // Add apply button and auto-apply checkbox
    const actionContainer = document.createElement('div');
    actionContainer.style.display = 'flex';
    actionContainer.style.alignItems = 'center';
    actionContainer.style.gap = '20px';
    actionContainer.style.marginTop = '20px';

    actionContainer.appendChild(applyButton);

    if (autoApplyCheckbox && autoApplyCheckbox.element) {
        actionContainer.appendChild(autoApplyCheckbox.element);
    }

    dashboard.appendChild(actionContainer);

    // Initial render
    renderAxis();

    return dashboard;
}
