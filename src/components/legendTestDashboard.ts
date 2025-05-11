/**
 * Legend Testing Dashboard
 *
 * Purpose: Interactive dashboard for testing and visualizing legend configurations
 * Author: Cody
 * Creation Date: 2023-11-17
 */

import { buildViz } from '../core/builder';
import { createLegend } from './legend'; // Using the existing legend component
import { createScale } from './scales/scale';

// Import UI control components
import '../components/controls';
import { registerAllControlComponents } from '../components/controls';

// Ensure all control components are registered
registerAllControlComponents();

export function createLegendTestDashboard(container: HTMLElement) {
    // Create dashboard container
    const dashboard = document.createElement('div');
    dashboard.className = 'legend-test-dashboard';
    dashboard.style.fontFamily = 'Arial, sans-serif';
    dashboard.style.padding = '20px';
    dashboard.style.display = 'flex';
    dashboard.style.flexDirection = 'column';
    dashboard.style.gap = '20px';

    // Create visualization container
    const vizContainer = document.createElement('div');
    vizContainer.className = 'visualization-container';
    vizContainer.style.border = '1px solid #ccc';
    vizContainer.style.borderRadius = '4px';
    vizContainer.style.padding = '20px';
    vizContainer.style.minHeight = '400px';
    vizContainer.style.position = 'relative';
    vizContainer.style.marginBottom = '20px';

    // Create legend area box
    const legendAreaBox = document.createElement('div');
    legendAreaBox.className = 'legend-area-box';
    legendAreaBox.style.width = '600px';
    legendAreaBox.style.minHeight = '200px';
    legendAreaBox.style.border = '1px dashed #999';
    legendAreaBox.style.margin = '50px auto';
    legendAreaBox.style.position = 'relative';
    legendAreaBox.style.backgroundColor = '#f9f9f9';
    legendAreaBox.style.display = 'flex';
    legendAreaBox.style.justifyContent = 'center';
    legendAreaBox.style.alignItems = 'center';

    vizContainer.appendChild(legendAreaBox);

    // Add dashboard to main container
    container.appendChild(dashboard);

    // State for legend configuration
    const config = {
        legendType: 'color', // Changed from 'type' to 'legendType'
        orientation: 'horizontal',
        title: 'Legend Title',
        items: [
            { label: 'Category A', color: '#1f77b4' }, // Using 'color' for color legends
            { label: 'Category B', color: '#ff7f0e' },
            { label: 'Category C', color: '#2ca02c' },
            { label: 'Category D', color: '#d62728' },
            { label: 'Category E', color: '#9467bd' }
        ],
        symbolSize: 15,
        fontSize: 12,
        fontFamily: 'Arial',
        titleFontSize: 14,
        titleFontWeight: 'bold',
        padding: 5,
        itemSpacing: 20, // Match the default in legend.ts
        labelOffset: 10, // Added to match legend.ts
        autoApply: true
    };

    // Function to render the legend
    function renderLegend() {
        // Clear previous visualization
        legendAreaBox.innerHTML = '';

        // Remove previous config display if it exists
        const oldConfigDisplay = vizContainer.querySelector('.config-display');
        if (oldConfigDisplay) {
            vizContainer.removeChild(oldConfigDisplay);
        }

        // Create SVG container
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('width', '100%');
        svg.setAttribute('height', '100%');
        svg.style.overflow = 'visible';
        legendAreaBox.appendChild(svg);

        try {
            // Create legend
            const legend = createLegend({
                legendType: config.legendType,
                title: config.title,
                items: config.items,
                orientation: config.orientation,
                position: { x: 50, y: 50 }, // Center in the box
                itemSpacing: config.itemSpacing,
                labelOffset: config.labelOffset,
                symbolSize: config.symbolSize,
                format: value => value ? value.toString() : ''
            });

            // Render legend to SVG
            if (legend && legend.renderToSvg) {
                legend.renderToSvg(svg);
            } else {
                throw new Error('Failed to create renderable legend');
            }
        } catch (error) {
            console.error('Error rendering legend:', error);
            const errorMsg = document.createElement('div');
            errorMsg.textContent = `Error rendering legend: ${error.message}`;
            errorMsg.style.color = 'red';
            legendAreaBox.appendChild(errorMsg);
        }

        // Add configuration display
        const configDisplay = document.createElement('pre');
        configDisplay.className = 'config-display';
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

    // Create control components

    // 1. Legend Type and Orientation
    const typeRadio = buildViz({
        type: 'radioGroup',
        label: 'Legend Type',
        name: 'legendType',
        value: config.legendType,
        options: [
            { value: 'color', label: 'Color' },
            { value: 'size', label: 'Size' },
            { value: 'symbol', label: 'Symbol' } // Changed from 'shape' to 'symbol' to match legend.ts
        ],
        layout: 'vertical',
        onChange: (value) => {
            config.legendType = value;

            // Update items based on legend type
            if (value === 'color') {
                config.items = [
                    { label: 'Category A', color: '#1f77b4' },
                    { label: 'Category B', color: '#ff7f0e' },
                    { label: 'Category C', color: '#2ca02c' },
                    { label: 'Category D', color: '#d62728' },
                    { label: 'Category E', color: '#9467bd' }
                ];
            } else if (value === 'size') {
                config.items = [
                    { label: 'Small', size: 5 },
                    { label: 'Medium', size: 10 },
                    { label: 'Large', size: 15 },
                    { label: 'X-Large', size: 20 }
                ];
            } else if (value === 'symbol') {
                config.items = [
                    { label: 'Circle', symbol: 'circle' },
                    { label: 'Square', symbol: 'square' },
                    { label: 'Triangle', symbol: 'triangle' }
                ];
            }

            if (config.autoApply) renderLegend();
        }
    });

    const orientationRadio = buildViz({
        type: 'radioGroup',
        label: 'Orientation',
        name: 'orientation',
        value: config.orientation,
        options: ['horizontal', 'vertical'],
        layout: 'vertical',
        onChange: (value) => {
            config.orientation = value;
            if (config.autoApply) renderLegend();
        }
    });

    // 2. Title controls
    const titleInput = buildViz({
        type: 'textInput',
        label: 'Title',
        value: config.title,
        onChange: (value) => {
            config.title = value;
            if (config.autoApply) renderLegend();
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
            if (config.autoApply) renderLegend();
        }
    });

    const titleFontWeightSelect = buildViz({
        type: 'select',
        label: 'Title Font Weight',
        value: config.titleFontWeight,
        options: ['normal', 'bold', 'lighter', 'bolder', '100', '200', '300', '400', '500', '600', '700', '800', '900'],
        onChange: (value) => {
            config.titleFontWeight = value;
            if (config.autoApply) renderLegend();
        }
    });

    // 3. Items controls
    const itemsInput = buildViz({
        type: 'textArea',
        label: 'Legend Items (JSON)',
        value: JSON.stringify(config.items, null, 2),
        rows: 8,
        onBlur: (value) => {
            try {
                config.items = JSON.parse(value);
                if (config.autoApply) renderLegend();
            } catch (error) {
                alert('Invalid JSON format for legend items');
                itemsInput.setValue(JSON.stringify(config.items, null, 2));
            }
        }
    });

    const symbolSizeSlider = buildViz({
        type: 'slider',
        label: 'Symbol Size',
        value: config.symbolSize,
        min: 5,
        max: 30,
        step: 1,
        showValue: true,
        valueFormat: (value) => `${value}px`,
        onChange: (value) => {
            config.symbolSize = value;
            if (config.autoApply) renderLegend();
        }
    });

    const itemSpacingSlider = buildViz({
        type: 'slider',
        label: 'Item Spacing',
        value: config.itemSpacing,
        min: 5,
        max: 50,
        step: 1,
        showValue: true,
        valueFormat: (value) => `${value}px`,
        onChange: (value) => {
            config.itemSpacing = value;
            if (config.autoApply) renderLegend();
        }
    });

    const labelOffsetSlider = buildViz({
        type: 'slider',
        label: 'Label Offset',
        value: config.labelOffset,
        min: 0,
        max: 30,
        step: 1,
        showValue: true,
        valueFormat: (value) => `${value}px`,
        onChange: (value) => {
            config.labelOffset = value;
            if (config.autoApply) renderLegend();
        }
    });

    // 4. Auto-apply control
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
    applyButton.addEventListener('click', renderLegend);

    // Create control dashboard
    const controlsDashboard = buildViz({
        type: 'dashboard',
        sections: [
            {
                title: 'Legend Type',
                controls: [typeRadio, orientationRadio]
            },
            {
                title: 'Title',
                controls: [titleInput, titleFontSizeSlider, titleFontWeightSelect]
            },
            {
                title: 'Items',
                controls: [itemsInput, symbolSizeSlider, itemSpacingSlider, labelOffsetSlider]
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
    renderLegend();

    return dashboard;
}
