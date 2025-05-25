/**
 * Box Layout Dashboard
 *
 * Purpose: Interactive dashboard for testing and visualizing box layout components
 * Author: Cody
 * Creation Date: 2023-11-21
 */

import { buildViz } from '../../core/builder';
import { createBox } from './box';
import { renderViz } from '../../core/renderer';

export function createBoxLayoutDashboard(container: HTMLElement) {
  // Create dashboard container
  const dashboard = document.createElement('div');
  dashboard.className = 'box-layout-dashboard';
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

  // Create preview area
  const previewArea = document.createElement('div');
  previewArea.className = 'preview-area';
  previewArea.style.width = '600px';
  previewArea.style.height = '300px';
  previewArea.style.border = '1px dashed #999';
  previewArea.style.margin = '0 auto';
  previewArea.style.position = 'relative';
  previewArea.style.backgroundColor = '#f9f9f9';

  vizContainer.appendChild(previewArea);

  // Create controls container
  const controlsContainer = document.createElement('div');
  controlsContainer.className = 'controls-container';
  controlsContainer.style.display = 'flex';
  controlsContainer.style.flexWrap = 'wrap';
  controlsContainer.style.gap = '20px';

  // Add containers to dashboard
  dashboard.appendChild(vizContainer);
  dashboard.appendChild(controlsContainer);

  // Add dashboard to main container
  container.appendChild(dashboard);

  // State for box layout configuration
  const config = {
    class: 'horizontal', // Default to horizontal layout
    spacing: 10,
    padding: 20,
    items: [
      { width: 80, height: 80, color: '#ff5252' },
      { width: 80, height: 80, color: '#4caf50' },
      { width: 80, height: 80, color: '#2196f3' },
      { width: 80, height: 80, color: '#ff9800' },
      { width: 80, height: 80, color: '#9c27b0' },
      { width: 80, height: 80, color: '#607d8b' }
    ],
    autoApply: true
  };

  // Create control sections
  const sections = [
    createTypeSection(config, renderLayout),
    createSpacingSection(config, renderLayout),
    createAlignmentSection(config, renderLayout),
    createItemsSection(config, renderLayout)
  ];

  // Add sections to controls container
  sections.forEach(section => {
    controlsContainer.appendChild(section);
  });

  // Add apply button and auto-apply checkbox
  const applyContainer = document.createElement('div');
  applyContainer.style.display = 'flex';
  applyContainer.style.alignItems = 'center';
  applyContainer.style.gap = '15px';
  applyContainer.style.marginTop = '20px';
  applyContainer.style.marginBottom = '20px';

  const applyButton = document.createElement('button');
  applyButton.textContent = 'Apply Changes';
  applyButton.style.padding = '10px 20px';
  applyButton.style.backgroundColor = '#4CAF50';
  applyButton.style.color = 'white';
  applyButton.style.border = 'none';
  applyButton.style.borderRadius = '4px';
  applyButton.style.cursor = 'pointer';
  applyButton.style.fontSize = '16px';

  const autoApplyContainer = document.createElement('div');
  autoApplyContainer.style.display = 'flex';
  autoApplyContainer.style.alignItems = 'center';

  const autoApplyCheckbox = document.createElement('input');
  autoApplyCheckbox.type = 'checkbox';
  autoApplyCheckbox.id = 'auto-apply';
  autoApplyCheckbox.checked = config.autoApply;
  autoApplyCheckbox.style.marginRight = '8px';

  const autoApplyLabel = document.createElement('label');
  autoApplyLabel.htmlFor = 'auto-apply';
  autoApplyLabel.textContent = 'Auto Apply';
  autoApplyLabel.style.fontSize = '14px';

  autoApplyCheckbox.addEventListener('change', () => {
    config.autoApply = autoApplyCheckbox.checked;
    if (config.autoApply) {
      renderLayout();
    }
  });

  autoApplyContainer.appendChild(autoApplyCheckbox);
  autoApplyContainer.appendChild(autoApplyLabel);

  applyContainer.appendChild(applyButton);
  applyContainer.appendChild(autoApplyContainer);

  dashboard.insertBefore(applyContainer, controlsContainer);

  // Function to render the layout
    function renderLayout() {
    // Clear previous visualization
    previewArea.innerHTML = '';

    // Add a visible container boundary
    const containerBoundary = document.createElement('div');
    containerBoundary.style.position = 'absolute';
    containerBoundary.style.left = '20px';
    containerBoundary.style.top = '20px';
    containerBoundary.style.width = '400px';
    containerBoundary.style.height = '200px';
    containerBoundary.style.border = '1px dashed #999';
    containerBoundary.style.borderRadius = '4px';
    previewArea.appendChild(containerBoundary);

    // Create box items
    const boxItems = config.items.map(item => {
      return {
        type: 'rectangle',
        width: item.width,
        height: item.height,
        fill: item.color,
        stroke: '#000',
        strokeWidth: 1,
        cornerRadius: 4
      };
    });

    // Create box layout with the unified box component
    try {
      const boxLayout = createBox({
        children: boxItems,
        class: config.class, // Use the class property for layout type and alignment
        spacing: config.spacing,
        padding: config.padding,
        width: 400,  // Set fixed width to match container
        height: 200, // Set fixed height to match container
        position: { x: 20, y: 20 }
      });

      // Render box layout to the preview area
      renderViz(boxLayout, previewArea);
    } catch (error) {
        console.error('Error rendering box layout:', error);
        const errorMsg = document.createElement('div');
        errorMsg.textContent = `Error rendering box layout: ${error.message}`;
        errorMsg.style.color = 'red';
        previewArea.appendChild(errorMsg);
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
    previewArea.appendChild(configDisplay);
    }


  // Attach event listener to apply button
  applyButton.addEventListener('click', renderLayout);

  // Initial render
  renderLayout();

  return dashboard;
}

// Helper function to create a control section
function createControlSection(title: string): HTMLElement {
  const section = document.createElement('div');
  section.className = 'control-section';
  section.style.border = '1px solid #ddd';
  section.style.borderRadius = '4px';
  section.style.padding = '15px';
  section.style.minWidth = '250px';

  const sectionTitle = document.createElement('h3');
  sectionTitle.textContent = title;
  sectionTitle.style.margin = '0 0 15px 0';

  section.appendChild(sectionTitle);

  return section;
}

// Create type section
function createTypeSection(config: any, onChange: () => void): HTMLElement {
  const section = createControlSection('Layout Type');

  const types = [
    { value: 'hbox', label: 'Horizontal Box (HBox)' },
    { value: 'vbox', label: 'Vertical Box (VBox)' }
  ];

  types.forEach(type => {
    const label = document.createElement('label');
    label.style.display = 'block';
    label.style.marginBottom = '10px';

    const radio = document.createElement('input');
    radio.type = 'radio';
    radio.name = 'layout-type';
    radio.value = type.value;
    radio.checked = config.type === type.value;
    radio.addEventListener('change', () => {
      if (radio.checked) {
        config.type = type.value;
        if (config.autoApply) onChange();
      }
    });

    label.appendChild(radio);
    label.appendChild(document.createTextNode(` ${type.label}`));
    section.appendChild(label);
  });

  // Wrap checkbox
  const wrapContainer = document.createElement('div');
  wrapContainer.style.marginTop = '15px';

  const wrapCheckbox = document.createElement('input');
  wrapCheckbox.type = 'checkbox';
  wrapCheckbox.id = 'wrap';
  wrapCheckbox.checked = config.wrap;
  wrapCheckbox.addEventListener('change', () => {
    config.wrap = wrapCheckbox.checked;
    if (config.autoApply) onChange();
  });

  const wrapLabel = document.createElement('label');
  wrapLabel.htmlFor = 'wrap';
  wrapLabel.textContent = ' Wrap items';
  wrapLabel.style.marginLeft = '5px';

  wrapContainer.appendChild(wrapCheckbox);
  wrapContainer.appendChild(wrapLabel);
  section.appendChild(wrapContainer);

  // Reverse checkbox
  const reverseContainer = document.createElement('div');
  reverseContainer.style.marginTop = '10px';

  const reverseCheckbox = document.createElement('input');
  reverseCheckbox.type = 'checkbox';
  reverseCheckbox.id = 'reverse';
  reverseCheckbox.checked = config.reverse;
  reverseCheckbox.addEventListener('change', () => {
    config.reverse = reverseCheckbox.checked;
    if (config.autoApply) onChange();
  });

  const reverseLabel = document.createElement('label');
  reverseLabel.htmlFor = 'reverse';
  reverseLabel.textContent = ' Reverse direction';
  reverseLabel.style.marginLeft = '5px';

  reverseContainer.appendChild(reverseCheckbox);
  reverseContainer.appendChild(reverseLabel);
  section.appendChild(reverseContainer);

  return section;
}

// Create spacing section
function createSpacingSection(config: any, onChange: () => void): HTMLElement {
  const section = createControlSection('Spacing & Padding');

  // Spacing slider
  const spacingContainer = document.createElement('div');
  spacingContainer.style.marginBottom = '15px';

  const spacingLabel = document.createElement('label');
  spacingLabel.textContent = `Spacing: ${config.spacing}px`;

  const spacingSlider = document.createElement('input');
  spacingSlider.type = 'range';
  spacingSlider.min = '0';
  spacingSlider.max = '50';
  spacingSlider.step = '1';
  spacingSlider.value = config.spacing.toString();
  spacingSlider.style.width = '100%';
  spacingSlider.addEventListener('input', () => {
    config.spacing = parseInt(spacingSlider.value);
    spacingLabel.textContent = `Spacing: ${config.spacing}px`;
    if (config.autoApply) onChange();
  });

  spacingContainer.appendChild(spacingLabel);
  spacingContainer.appendChild(spacingSlider);
  section.appendChild(spacingContainer);

  // Padding slider
  const paddingContainer = document.createElement('div');

  const paddingLabel = document.createElement('label');
  paddingLabel.textContent = `Padding: ${config.padding}px`;

  const paddingSlider = document.createElement('input');
  paddingSlider.type = 'range';
  paddingSlider.min = '0';
  paddingSlider.max = '50';
  paddingSlider.step = '1';
  paddingSlider.value = config.padding.toString();
  paddingSlider.style.width = '100%';
  paddingSlider.addEventListener('input', () => {
    config.padding = parseInt(paddingSlider.value);
    paddingLabel.textContent = `Padding: ${config.padding}px`;
    if (config.autoApply) onChange();
  });

  paddingContainer.appendChild(paddingLabel);
  paddingContainer.appendChild(paddingSlider);
  section.appendChild(paddingContainer);

  return section;
}

// Create alignment section
function createAlignmentSection(config: any, onChange: () => void): HTMLElement {
  const section = createControlSection('Alignment & Justification');

  // Add visual explanation
  const explanationDiv = document.createElement('div');
  explanationDiv.style.marginBottom = '15px';
  explanationDiv.style.padding = '10px';
  explanationDiv.style.backgroundColor = '#f9f9f9';
  explanationDiv.style.borderRadius = '4px';
  explanationDiv.style.fontSize = '14px';

  const explanationText = document.createElement('p');
  explanationText.style.margin = '0 0 10px 0';
  explanationText.innerHTML = `
    <strong>For Horizontal layout:</strong><br>
    - <em>valign</em> controls vertical positioning (cross-axis)<br>
    - <em>halign</em> controls horizontal distribution (main-axis)<br><br>
    <strong>For Vertical layout:</strong><br>
    - <em>halign</em> controls horizontal positioning (cross-axis)<br>
    - <em>valign</em> controls vertical distribution (main-axis)
  `;

  explanationDiv.appendChild(explanationText);
  section.appendChild(explanationDiv);

  // Vertical alignment options (valign)
  const valignContainer = document.createElement('div');
  valignContainer.style.marginBottom = '15px';

  const valignLabel = document.createElement('div');
  valignLabel.textContent = 'Vertical Alignment (valign):';
  valignLabel.style.marginBottom = '5px';
  valignLabel.style.fontWeight = 'bold';

  valignContainer.appendChild(valignLabel);

  const valignOptions = [
    { value: 'start', label: 'Start' },
    { value: 'center', label: 'Center' },
    { value: 'end', label: 'End' },
    { value: 'stretch', label: 'Stretch' }
  ];

  valignOptions.forEach(option => {
    const label = document.createElement('label');
    label.style.display = 'block';
    label.style.marginBottom = '5px';

    const radio = document.createElement('input');
    radio.type = 'radio';
    radio.name = 'valign';
    radio.value = option.value;
    radio.checked = config.valign === option.value;
    radio.addEventListener('change', () => {
      if (radio.checked) {
        config.valign = option.value;
        if (config.autoApply) onChange();
      }
    });

    label.appendChild(radio);
    label.appendChild(document.createTextNode(` ${option.label}`));
    valignContainer.appendChild(label);
  });

  section.appendChild(valignContainer);

  // Horizontal alignment options (halign)
  const halignContainer = document.createElement('div');

  const halignLabel = document.createElement('div');
  halignLabel.textContent = 'Horizontal Alignment (halign):';
  halignLabel.style.marginBottom = '5px';
  halignLabel.style.fontWeight = 'bold';

  halignContainer.appendChild(halignLabel);

  const halignOptions = [
    { value: 'start', label: 'Start' },
    { value: 'center', label: 'Center' },
    { value: 'end', label: 'End' },
    { value: 'space-between', label: 'Space Between' },
    { value: 'space-around', label: 'Space Around' },
    { value: 'space-evenly', label: 'Space Evenly' }
  ];

  halignOptions.forEach(option => {
    const label = document.createElement('label');
    label.style.display = 'block';
    label.style.marginBottom = '5px';

    const radio = document.createElement('input');
    radio.type = 'radio';
    radio.name = 'halign';
    radio.value = option.value;
    radio.checked = config.halign === option.value;
    radio.addEventListener('change', () => {
      if (radio.checked) {
        config.halign = option.value;
        if (config.autoApply) onChange();
      }
    });

    label.appendChild(radio);
    label.appendChild(document.createTextNode(` ${option.label}`));
    halignContainer.appendChild(label);
  });

  section.appendChild(halignContainer);

  return section;
}


// Create items section
function createItemsSection(config: any, onChange: () => void): HTMLElement {
  const section = createControlSection('Items');

  // Items list
  const itemsList = document.createElement('div');
  itemsList.style.marginBottom = '15px';

  // Function to update items list
  function updateItemsList() {
    itemsList.innerHTML = '';

    config.items.forEach((item, index) => {
      const itemContainer = document.createElement('div');
      itemContainer.style.display = 'flex';
      itemContainer.style.alignItems = 'center';
      itemContainer.style.marginBottom = '10px';
      itemContainer.style.padding = '8px';
      itemContainer.style.backgroundColor = '#f5f5f5';
      itemContainer.style.borderRadius = '4px';

      // Color preview
      const colorPreview = document.createElement('div');
      colorPreview.style.width = '20px';
      colorPreview.style.height = '20px';
      colorPreview.style.backgroundColor = item.color;
      colorPreview.style.border = '1px solid #ccc';
      colorPreview.style.marginRight = '10px';

      // Item info
      const itemInfo = document.createElement('div');
      itemInfo.style.flex = '1';
      itemInfo.textContent = `Item ${index + 1}: ${item.width}x${item.height}`;

      // Edit button
      const editButton = document.createElement('button');
      editButton.textContent = 'Edit';
      editButton.style.marginRight = '5px';
      editButton.style.padding = '3px 8px';
      editButton.addEventListener('click', () => {
        showItemEditor(index);
      });

      // Delete button
      const deleteButton = document.createElement('button');
      deleteButton.textContent = 'Delete';
      deleteButton.style.padding = '3px 8px';
      deleteButton.addEventListener('click', () => {
        config.items.splice(index, 1);
        updateItemsList();
        if (config.autoApply) onChange();
      });

      itemContainer.appendChild(colorPreview);
      itemContainer.appendChild(itemInfo);
      itemContainer.appendChild(editButton);
      itemContainer.appendChild(deleteButton);

      itemsList.appendChild(itemContainer);
    });
  }

  // Add item button
  const addItemButton = document.createElement('button');
  addItemButton.textContent = 'Add Item';
  addItemButton.style.padding = '5px 10px';
  addItemButton.style.marginBottom = '10px';
  addItemButton.addEventListener('click', () => {
    // Generate a random color
    const randomColor = '#' + Math.floor(Math.random() * 16777215).toString(16);

    config.items.push({
      width: 80,
      height: 80,
      color: randomColor
    });

    updateItemsList();
    if (config.autoApply) onChange();
  });

  // Item editor
  function showItemEditor(index) {
    const item = config.items[index];

    const editorContainer = document.createElement('div');
    editorContainer.style.position = 'fixed';
    editorContainer.style.top = '0';
    editorContainer.style.left = '0';
    editorContainer.style.width = '100%';
    editorContainer.style.height = '100%';
    editorContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    editorContainer.style.display = 'flex';
    editorContainer.style.justifyContent = 'center';
    editorContainer.style.alignItems = 'center';
    editorContainer.style.zIndex = '1000';

    const editorPanel = document.createElement('div');
    editorPanel.style.backgroundColor = 'white';
    editorPanel.style.padding = '20px';
    editorPanel.style.borderRadius = '8px';
    editorPanel.style.width = '300px';

    const editorTitle = document.createElement('h3');
    editorTitle.textContent = `Edit Item ${index + 1}`;
    editorTitle.style.marginTop = '0';

    // Width input
    const widthContainer = document.createElement('div');
    widthContainer.style.marginBottom = '15px';

    const widthLabel = document.createElement('label');
    widthLabel.textContent = 'Width:';
    widthLabel.style.display = 'block';
    widthLabel.style.marginBottom = '5px';

    const widthInput = document.createElement('input');
    widthInput.type = 'number';
    widthInput.min = '10';
    widthInput.max = '300';
    widthInput.value = item.width.toString();
    widthInput.style.width = '100%';
    widthInput.style.padding = '5px';
    widthInput.style.boxSizing = 'border-box';

    widthContainer.appendChild(widthLabel);
    widthContainer.appendChild(widthInput);

    // Height input
    const heightContainer = document.createElement('div');
    heightContainer.style.marginBottom = '15px';

    const heightLabel = document.createElement('label');
    heightLabel.textContent = 'Height:';
    heightLabel.style.display = 'block';
    heightLabel.style.marginBottom = '5px';

    const heightInput = document.createElement('input');
    heightInput.type = 'number';
    heightInput.min = '10';
    heightInput.max = '300';
    heightInput.value = item.height.toString();
    heightInput.style.width = '100%';
    heightInput.style.padding = '5px';
    heightInput.style.boxSizing = 'border-box';

    heightContainer.appendChild(heightLabel);
    heightContainer.appendChild(heightInput);

    // Color input
    const colorContainer = document.createElement('div');
    colorContainer.style.marginBottom = '15px';

    const colorLabel = document.createElement('label');
    colorLabel.textContent = 'Color:';
    colorLabel.style.display = 'block';
    colorLabel.style.marginBottom = '5px';

    const colorInput = document.createElement('input');
    colorInput.type = 'color';
    colorInput.value = item.color;
    colorInput.style.width = '100%';
    colorInput.style.padding = '5px';
    colorInput.style.boxSizing = 'border-box';

    colorContainer.appendChild(colorLabel);
    colorContainer.appendChild(colorInput);

    // Buttons
    const buttonsContainer = document.createElement('div');
    buttonsContainer.style.display = 'flex';
    buttonsContainer.style.justifyContent = 'space-between';

    const saveButton = document.createElement('button');
    saveButton.textContent = 'Save';
    saveButton.style.padding = '8px 16px';
    saveButton.style.backgroundColor = '#4CAF50';
    saveButton.style.color = 'white';
    saveButton.style.border = 'none';
    saveButton.style.borderRadius = '4px';
    saveButton.style.cursor = 'pointer';

    const cancelButton = document.createElement('button');
    cancelButton.textContent = 'Cancel';
    cancelButton.style.padding = '8px 16px';
    cancelButton.style.backgroundColor = '#f44336';
    cancelButton.style.color = 'white';
    cancelButton.style.border = 'none';
    cancelButton.style.borderRadius = '4px';
    cancelButton.style.cursor = 'pointer';

    buttonsContainer.appendChild(saveButton);
    buttonsContainer.appendChild(cancelButton);

    // Add all elements to the panel
    editorPanel.appendChild(editorTitle);
    editorPanel.appendChild(widthContainer);
    editorPanel.appendChild(heightContainer);
    editorPanel.appendChild(colorContainer);
    editorPanel.appendChild(buttonsContainer);

    editorContainer.appendChild(editorPanel);
    document.body.appendChild(editorContainer);

    // Event listeners
    saveButton.addEventListener('click', () => {
      item.width = parseInt(widthInput.value);
      item.height = parseInt(heightInput.value);
      item.color = colorInput.value;

      document.body.removeChild(editorContainer);
      updateItemsList();
      if (config.autoApply) onChange();
    });

    cancelButton.addEventListener('click', () => {
      document.body.removeChild(editorContainer);
    });
  }

  section.appendChild(addItemButton);
  section.appendChild(itemsList);

  // Initialize items list
  updateItemsList();

  return section;
}
