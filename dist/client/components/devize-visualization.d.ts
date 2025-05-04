export declare class DevizeVisualization extends HTMLElement {
    private shadow;
    private container;
    private spec;
    constructor();
    connectedCallback(): void;
    static get observedAttributes(): string[];
    attributeChangedCallback(name: string, oldValue: string, newValue: string): void;
    set vizSpec(spec: any);
    private render;
}
