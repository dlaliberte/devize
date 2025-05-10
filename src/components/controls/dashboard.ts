/**
 * Dashboard Component
 *
 * Purpose: Provides a container for organizing UI controls
 * Author: Cody
 * Creation Date: 2023-11-16
 */

import { buildViz } from '../../core/builder';
import { registerDefineType } from '../../core/define';

// Make sure define type is registered
registerDefineType();

// Dashboard properties
export interface DashboardProps {
  title?: string;
  sections?: {
    title: string;
    controls: any[];
  }[];
  controls?: any[];
  className?: string;
  style?: Record<string, string>;
}

// Create a dashboard
export function createDashboard(props: DashboardProps): HTMLElement {
  // Create dashboard container
  const dashboard = document.createElement('div');
  dashboard.className = `dashboard-container ${props.className || ''}`;

  // Apply base styles
  Object.assign(dashboard.style, {
    fontFamily: 'Arial, sans-serif',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    ...props.style
  });

  // Add title if provided
  if (props.title) {
    const title = document.createElement('h2');
    title.textContent = props.title;
    title.style.margin = '0 0 20px 0';
    dashboard.appendChild(title);
  }

  // Add sections if provided
  if (props.sections && props.sections.length > 0) {
    props.sections.forEach(section => {
      const sectionElement = createDashboardSection(section.title, section.controls);
      dashboard.appendChild(sectionElement);
    });
  }

  // Add controls if provided
  if (props.controls && props.controls.length > 0) {
    const controlsContainer = document.createElement('div');
    controlsContainer.style.display = 'flex';
    controlsContainer.style.flexWrap = 'wrap';
    controlsContainer.style.gap = '20px';

    props.controls.forEach(control => {
      if (control && control.element) {
        controlsContainer.appendChild(control.element);
      } else if (control instanceof HTMLElement) {
        controlsContainer.appendChild(control);
      }
    });

    dashboard.appendChild(controlsContainer);
  }

  return dashboard;
}

// Create a dashboard section
function createDashboardSection(title: string, controls: any[]): HTMLElement {
  const section = document.createElement('div');
  section.className = 'dashboard-section';
  section.style.border = '1px solid #ddd';
  section.style.borderRadius = '4px';
  section.style.padding = '15px';

  // Add section title
  const sectionTitle = document.createElement('h3');
  sectionTitle.textContent = title;
  sectionTitle.style.margin = '0 0 15px 0';
  section.appendChild(sectionTitle);

  // Add controls
  const controlsContainer = document.createElement('div');
  controlsContainer.style.display = 'flex';
  controlsContainer.style.flexDirection = 'column';
  controlsContainer.style.gap = '10px';

  controls.forEach(control => {
    if (control && control.element) {
      controlsContainer.appendChild(control.element);
    } else if (control instanceof HTMLElement) {
      controlsContainer.appendChild(control);
    }
  });

  section.appendChild(controlsContainer);

  return section;
}

// Register the dashboard component
export function registerDashboardComponent() {
  buildViz({
    type: "define",
    name: "dashboard",
    properties: {
      title: { default: '' },
      sections: { default: [] },
      controls: { default: [] },
      className: { default: '' },
      style: { default: {} }
    },
    implementation: function(props) {
      const element = createDashboard(props);

      return {
        element,
        addControl: (control: any) => {
          if (control && control.element) {
            element.appendChild(control.element);
          } else if (control instanceof HTMLElement) {
            element.appendChild(control);
          }
        },
        addSection: (title: string, controls: any[]) => {
          const section = createDashboardSection(title, controls);
          element.appendChild(section);
        },
        renderToSvg: (svg) => {
          // Dashboard is a DOM element, not SVG
          console.warn('Dashboard cannot be rendered to SVG directly');
          return null;
        },
        renderToCanvas: (ctx) => {
          // Dashboard is a DOM element, not Canvas
          console.warn('Dashboard cannot be rendered to Canvas directly');
          return false;
        }
      };
    }
  });

  console.log('Dashboard component registered');
}

registerDashboardComponent();
