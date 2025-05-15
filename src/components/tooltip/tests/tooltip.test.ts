/**
 * Tooltip Component Unit Tests
 *
 * Purpose: Test the tooltip component functionality
 * Author: Devize Team
 * Creation Date: 2023-12-28
 */

import { expect } from 'chai';
import { createTooltip } from '../tooltip';
import { TooltipManager } from '../tooltipManager';
import { JSDOM } from 'jsdom';

describe('Tooltip Component', () => {
  let dom: JSDOM;
  let container: HTMLElement;

  beforeEach(() => {
    // Set up a DOM environment for testing
    dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
    global.document = dom.window.document;
    global.SVGElement = dom.window.SVGElement;
    global.HTMLElement = dom.window.HTMLElement;

    // Create a container for our tests
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    // Clean up
    if (container.parentNode) {
      container.parentNode.removeChild(container);
    }
    container = null;
  });

  describe('createTooltip', () => {
    it('should create a tooltip with default properties', () => {
      const tooltip = createTooltip({
        content: 'Test tooltip',
        anchorX: 100,
        anchorY: 100
      });

      expect(tooltip).to.exist;
      expect(tooltip.props.content).to.equal('Test tooltip');
      expect(tooltip.props.anchorX).to.equal(100);
      expect(tooltip.props.anchorY).to.equal(100);
      expect(tooltip.props.position).to.equal('top');
      expect(tooltip.props.visible).to.be.false;
    });

    it('should create a tooltip with custom properties', () => {
      const tooltip = createTooltip({
        content: 'Custom tooltip',
        anchorX: 200,
        anchorY: 200,
        position: 'bottom',
        offsetX: 10,
        offsetY: 5,
        behavior: 'fixed',
        visible: true,
        style: {
          backgroundColor: 'red',
          textColor: 'white'
        }
      });

      expect(tooltip).to.exist;
      expect(tooltip.props.content).to.equal('Custom tooltip');
      expect(tooltip.props.position).to.equal('bottom');
      expect(tooltip.props.offsetX).to.equal(10);
      expect(tooltip.props.offsetY).to.equal(5);
      expect(tooltip.props.behavior).to.equal('fixed');
      expect(tooltip.props.visible).to.be.true;
      expect(tooltip.props.style.backgroundColor).to.equal('red');
      expect(tooltip.props.style.textColor).to.equal('white');
    });

    it('should handle different content types', () => {
      // String content
      const textTooltip = createTooltip({
        content: 'Text content',
        anchorX: 100,
        anchorY: 100
      });
      expect(textTooltip.props.content).to.equal('Text content');

      // Object content (visualization spec)
      const vizContent = {
        type: 'rect',
        width: 50,
        height: 30,
        fill: 'blue'
      };

      const vizTooltip = createTooltip({
        content: vizContent,
        anchorX: 100,
        anchorY: 100
      });
      expect(vizTooltip.props.content).to.deep.equal(vizContent);
    });

    it('should position tooltip correctly based on position property', () => {
      // Test different positions
      const positions = ['top', 'right', 'bottom', 'left', 'top-left', 'top-right', 'bottom-left', 'bottom-right'];

      positions.forEach(position => {
        const tooltip = createTooltip({
          content: `${position} tooltip`,
          anchorX: 150,
          anchorY: 150,
          position: position as any,
          visible: true
        });

        expect(tooltip.props.position).to.equal(position);

        // Render to SVG to test positioning logic
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        tooltip.renderToSvg(svg);

        // The tooltip should exist in the DOM
        expect(svg.children.length).to.be.greaterThan(0);
      });
    });
  });

  describe('TooltipManager', () => {
    let manager: TooltipManager;

    beforeEach(() => {
      manager = new TooltipManager(container);
    });

    afterEach(() => {
      if (manager) {
        manager.dispose();
        manager = null;
      }
    });

    it('should create a tooltip layer in the container', () => {
      // Check that the tooltip layer was created
      const tooltipLayer = container.querySelector('.devize-tooltip-layer');
      expect(tooltipLayer).to.exist;
    });

    it('should show and hide tooltips', () => {
      // Show a tooltip
      const tooltip = manager.showTooltip('test-tooltip', 'Test content', 100, 100);
      expect(tooltip).to.exist;
      expect(manager.isTooltipVisible('test-tooltip')).to.be.true;

      // Hide the tooltip
      manager.hideTooltip('test-tooltip');
      expect(manager.isTooltipVisible('test-tooltip')).to.be.false;
    });

    it('should update existing tooltips', () => {
      // Show initial tooltip
      manager.showTooltip('test-tooltip', 'Initial content', 100, 100);

      // Update the tooltip
      const updatedTooltip = manager.showTooltip('test-tooltip', 'Updated content', 150, 150, {
        position: 'bottom'
      });

      expect(updatedTooltip.props.content).to.equal('Updated content');
      expect(updatedTooltip.props.anchorX).to.equal(150);
      expect(updatedTooltip.props.anchorY).to.equal(150);
      expect(updatedTooltip.props.position).to.equal('bottom');
    });

    it('should hide all tooltips', () => {
      // Show multiple tooltips
      manager.showTooltip('tooltip1', 'Content 1', 100, 100);
      manager.showTooltip('tooltip2', 'Content 2', 200, 200);

      // Hide all tooltips
      manager.hideAllTooltips();

      expect(manager.isTooltipVisible('tooltip1')).to.be.false;
      expect(manager.isTooltipVisible('tooltip2')).to.be.false;
    });

    it('should remove tooltips', () => {
      // Show a tooltip
      manager.showTooltip('test-tooltip', 'Test content', 100, 100);

      // Remove the tooltip
      manager.removeTooltip('test-tooltip');

      // The tooltip should no longer exist
      expect(manager.getTooltip('test-tooltip')).to.be.undefined;
    });

    it('should add tooltip triggers to elements', () => {
      // Create an element to trigger the tooltip
      const element = document.createElement('div');
      container.appendChild(element);

      // Add tooltip trigger
      const removeListener = manager.addTooltipTrigger(element, 'Triggered tooltip', {
        id: 'triggered-tooltip',
        position: 'right'
      });

      // Simulate mouseenter event
      const mouseEnterEvent = new dom.window.MouseEvent('mouseenter', {
        bubbles: true,
        cancelable: true,
        clientX: 150,
        clientY: 150
      });
      element.dispatchEvent(mouseEnterEvent);

      // Check that the tooltip is visible
      expect(manager.isTooltipVisible('triggered-tooltip')).to.be.true;

      // Simulate mouseleave event
      const mouseLeaveEvent = new dom.window.MouseEvent('mouseleave');
      element.dispatchEvent(mouseLeaveEvent);

      // Check that the tooltip is hidden
      expect(manager.isTooltipVisible('triggered-tooltip')).to.be.false;

      // Remove the event listener
      removeListener();

      // Simulate mouseenter event again
      element.dispatchEvent(mouseEnterEvent);

      // The tooltip should not be shown
      expect(manager.getTooltip('triggered-tooltip')).to.be.undefined;
    });

    it('should handle different tooltip behaviors', () => {
      // Create elements for different behaviors
      const hoverElement = document.createElement('div');
      const clickElement = document.createElement('div');
      const fixedElement = document.createElement('div');

      container.appendChild(hoverElement);
      container.appendChild(clickElement);
      container.appendChild(fixedElement);

      // Add tooltip triggers with different behaviors
      manager.addTooltipTrigger(hoverElement, 'Hover tooltip', {
        id: 'hover-tooltip',
        behavior: 'hover'
      });

      manager.addTooltipTrigger(clickElement, 'Click tooltip', {
        id: 'click-tooltip',
        behavior: 'click'
      });

      manager.addTooltipTrigger(fixedElement, 'Fixed tooltip', {
        id: 'fixed-tooltip',
        behavior: 'fixed'
      });

      // Test hover behavior
      hoverElement.dispatchEvent(new dom.window.MouseEvent('mouseenter'));
      expect(manager.isTooltipVisible('hover-tooltip')).to.be.true;

      hoverElement.dispatchEvent(new dom.window.MouseEvent('mouseleave'));
      expect(manager.isTooltipVisible('hover-tooltip')).to.be.false;

      // Test click behavior
      clickElement.dispatchEvent(new dom.window.MouseEvent('click'));
      expect(manager.isTooltipVisible('click-tooltip')).to.be.true;

      clickElement.dispatchEvent(new dom.window.MouseEvent('click'));
      expect(manager.isTooltipVisible('click-tooltip')).to.be.false;

      // Test fixed behavior
      fixedElement.dispatchEvent(new dom.window.MouseEvent('mouseenter'));
      expect(manager.isTooltipVisible('fixed-tooltip')).to.be.true;

      fixedElement.dispatchEvent(new dom.window.MouseEvent('mouseleave'));
      // Fixed tooltips should stay visible
      expect(manager.isTooltipVisible('fixed-tooltip')).to.be.true;
    });

    it('should handle custom events for showing/hiding tooltips', () => {
      // Create an element
      const element = document.createElement('div');
      container.appendChild(element);

      // Add tooltip trigger with custom events
      manager.addTooltipTrigger(element, 'Custom events tooltip', {
        id: 'custom-events-tooltip',
        showEvent: 'focus',
        hideEvent: 'blur'
      });

      // Simulate focus event
      element.dispatchEvent(new dom.window.Event('focus'));
      expect(manager.isTooltipVisible('custom-events-tooltip')).to.be.true;

      // Simulate blur event
      element.dispatchEvent(new dom.window.Event('blur'));
      expect(manager.isTooltipVisible('custom-events-tooltip')).to.be.false;
    });

    it('should clean up properly on dispose', () => {
      // Show some tooltips
      manager.showTooltip('tooltip1', 'Content 1', 100, 100);
      manager.showTooltip('tooltip2', 'Content 2', 200, 200);

      // Dispose the manager
      manager.dispose();

      // The tooltip layer should be removed
      const tooltipLayer = container.querySelector('.devize-tooltip-layer');
      expect(tooltipLayer).to.be.null;

      // All tooltips should be removed
      expect(manager.getTooltip('tooltip1')).to.be.undefined;
      expect(manager.getTooltip('tooltip2')).to.be.undefined;
    });
  });
});
