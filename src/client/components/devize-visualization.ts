export class DevizeVisualization extends HTMLElement {
  private shadow: ShadowRoot;
  private container: HTMLDivElement;
  private spec: any = null;

  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: 'open' });

    // Create container for visualization
    this.container = document.createElement('div');
    this.container.style.width = '100%';
    this.container.style.height = '100%';
    this.shadow.appendChild(this.container);

    // Add styles
    const style = document.createElement('style');
    style.textContent = `
      :host {
        display: block;
        width: 100%;
        height: 100%;
        min-height: 200px;
      }
    `;
    this.shadow.appendChild(style);
  }

  connectedCallback() {
    if (this.spec) {
      this.render();
    }
  }

  static get observedAttributes() {
    return ['spec'];
  }

  attributeChangedCallback(name: string, oldValue: string, newValue: string) {
    if (name === 'spec' && newValue !== oldValue) {
      try {
        this.spec = JSON.parse(newValue);
        if (this.isConnected) {
          this.render();
        }
      } catch (e) {
        console.error('Invalid spec JSON:', e);
      }
    }
  }

  set vizSpec(spec: any) {
    this.spec = spec;
    if (this.isConnected) {
      this.render();
    }
  }

  private render() {
    // Clear previous visualization
    this.container.innerHTML = '';

    // Implement visualization rendering based on spec
    // This will use the core Devize library
    console.log('Rendering visualization with spec:', this.spec);

    // TODO: Actual rendering implementation
  }
}

// Register the web component
customElements.define('devize-visualization', DevizeVisualization);
