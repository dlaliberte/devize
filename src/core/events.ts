/**
 * Event Handling System
 *
 * Purpose: Provides a consistent approach to handling events across visualizations
 * Author: Cody
 * Creation Date: 2023-11-18
 */

import { EventHandler, EventType, EventHandlerOptions } from "./types";


export class EventManager {
  private handlers: Map<string, EventHandler[]> = new Map();
  private element: Element | null = null;

  constructor(element?: Element) {
    if (element) {
      this.attach(element);
    }
  }

  /**
   * Attach this event manager to a DOM element
   */
  attach(element: Element): void {
    // Detach from previous element if any
    if (this.element) {
      this.detach();
    }

    this.element = element;

    // Attach all registered handlers to the new element
    this.handlers.forEach((handlers, type) => {
      handlers.forEach(handler => {
        this.attachHandler(type, handler);
      });
    });
  }

  /**
   * Detach this event manager from its DOM element
   */
  detach(): void {
    if (!this.element) return;

    // Remove all handlers from the element
    this.handlers.forEach((handlers, type) => {
      handlers.forEach(handler => {
        this.detachHandler(type, handler);
      });
    });

    this.element = null;
  }

  /**
   * Register an event handler
   */
  on(type: EventType, handler: (event: any, target?: any) => void, options?: EventHandlerOptions): void {
    if (!this.handlers.has(type)) {
      this.handlers.set(type, []);
    }

    const handlerObj: EventHandler = { type, handler, options };
    this.handlers.get(type)!.push(handlerObj);

    // If we have an element, attach the handler immediately
    if (this.element) {
      this.attachHandler(type, handlerObj);
    }
  }

  /**
   * Remove an event handler
   */
  off(type: EventType, handler: (event: any, target?: any) => void): void {
    if (!this.handlers.has(type)) return;

    const handlers = this.handlers.get(type)!;
    const index = handlers.findIndex(h => h.handler === handler);

    if (index >= 0) {
      const handlerObj = handlers[index];

      // If we have an element, detach the handler
      if (this.element) {
        this.detachHandler(type, handlerObj);
      }

      // Remove from our list
      handlers.splice(index, 1);

      // If no more handlers of this type, remove the type entry
      if (handlers.length === 0) {
        this.handlers.delete(type);
      }
    }
  }

  /**
   * Trigger an event programmatically
   */
  trigger(type: EventType, data?: any): void {
    if (!this.handlers.has(type)) return;

    const event = { type, data };

    this.handlers.get(type)!.forEach(handler => {
      handler.handler(event, this.element);
    });
  }

  /**
   * Attach a handler to the DOM element
   */
  private attachHandler(type: string, handler: EventHandler): void {
    if (!this.element) return;

    // For standard DOM events
    if (type.startsWith('mouse') || type.startsWith('touch') ||
        type === 'click' || type === 'dblclick' ||
        type.startsWith('drag')) {

      const wrappedHandler = (event: Event) => {
        handler.handler(event, this.element);
      };

      (handler as any)._wrappedHandler = wrappedHandler;

      this.element.addEventListener(
        type,
        wrappedHandler,
        handler.options
      );
    }

    // Custom events are handled internally
  }

  /**
   * Detach a handler from the DOM element
   */
  private detachHandler(type: string, handler: EventHandler): void {
    if (!this.element) return;

    // For standard DOM events
    if (type.startsWith('mouse') || type.startsWith('touch') ||
        type === 'click' || type === 'dblclick' ||
        type.startsWith('drag')) {

      const wrappedHandler = (handler as any)._wrappedHandler;

      if (wrappedHandler) {
        this.element.removeEventListener(
          type,
          wrappedHandler,
          handler.options
        );
      }
    }
  }
}
