/**
 * Animation Framework
 *
 * Purpose: Provides a consistent approach to animations across visualizations
 * Author: Cody
 * Creation Date: 2023-11-18
 */

import { EasingFunction, AnimationOptions } from "./types";

export class Animation {
  private startTime: number = 0;
  private isRunning: boolean = false;
  private animationFrameId: number = 0;

  // Animation properties
  private duration: number;
  private delay: number;
  private easing: EasingFunction;
  private loop: boolean;
  private yoyo: boolean;
  private onStart: (() => void) | null;
  private onUpdate: ((progress: number) => void) | null;
  private onComplete: (() => void) | null;

  constructor(options: AnimationOptions = {}) {
    this.duration = options.duration || 500;
    this.delay = options.delay || 0;
    this.easing = this.getEasingFunction(options.easing || 'linear');
    this.loop = options.loop || false;
    this.yoyo = options.yoyo || false;
    this.onStart = options.onStart || null;
    this.onUpdate = options.onUpdate || null;
    this.onComplete = options.onComplete || null;
  }

  /**
   * Start the animation
   */
  start(): Animation {
    if (this.isRunning) {
      this.stop();
    }

    this.isRunning = true;
    this.startTime = performance.now() + this.delay;

    if (this.onStart) {
      this.onStart();
    }

    this.tick();
    return this;
  }

  /**
   * Stop the animation
   */
  stop(): Animation {
    if (this.isRunning) {
      this.isRunning = false;
      cancelAnimationFrame(this.animationFrameId);
    }
    return this;
  }

  /**
   * Animation tick function
   */
  private tick = (): void => {
    if (!this.isRunning) return;

    const currentTime = performance.now();

    // If we're in the delay period, just schedule the next tick
    if (currentTime < this.startTime) {
      this.animationFrameId = requestAnimationFrame(this.tick);
      return;
    }

    // Calculate progress (0 to 1)
    let elapsed = currentTime - this.startTime;
    let progress = Math.min(elapsed / this.duration, 1);

    // Apply easing
    const easedProgress = this.easing(progress);

    // Call update callback
    if (this.onUpdate) {
      this.onUpdate(easedProgress);
    }

    // Handle completion
    if (progress >= 1) {
      if (this.loop) {
        // For looping, reset the start time
        this.startTime = currentTime;
        this.animationFrameId = requestAnimationFrame(this.tick);
      } else if (this.yoyo) {
        // For yoyo, reverse the animation
        this.yoyo = false;
        this.easing = this.getReverseEasing(this.easing);
        this.startTime = currentTime;
        this.animationFrameId = requestAnimationFrame(this.tick);
      } else {
        // Animation complete
        this.isRunning = false;
        if (this.onComplete) {
          this.onComplete();
        }
      }
    } else {
      // Continue animation
      this.animationFrameId = requestAnimationFrame(this.tick);
    }
  }

  /**
   * Get an easing function by name or use the provided function
   */
  private getEasingFunction(easing: string | EasingFunction): EasingFunction {
    if (typeof easing === 'function') {
      return easing;
    }

    // Common easing functions
    const easings: Record<string, EasingFunction> = {
      linear: (t) => t,
      easeInQuad: (t) => t * t,
      easeOutQuad: (t) => t * (2 - t),
      easeInOutQuad: (t) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
      easeInCubic: (t) => t * t * t,
      easeOutCubic: (t) => (--t) * t * t + 1,
      easeInOutCubic: (t) => t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1,
      easeInElastic: (t) => t === 0 ? 0 : t === 1 ? 1 : -Math.pow(2, 10 * (t - 1)) * Math.sin((t - 1.1) * 5 * Math.PI),
      easeOutElastic: (t) => t === 0 ? 0 : t === 1 ? 1 : Math.pow(2, -10 * t) * Math.sin((t - 0.1) * 5 * Math.PI) + 1,
      easeInOutElastic: (t) => {
        if (t === 0) return 0;
        if (t === 1) return 1;
        if ((t *= 2) < 1) return -0.5 * Math.pow(2, 10 * (t - 1)) * Math.sin((t - 1.1) * 5 * Math.PI);
        return 0.5 * Math.pow(2, -10 * (t - 1)) * Math.sin((t - 1.1) * 5 * Math.PI) + 1;
      }
    };

    return easings[easing] || easings.linear;
  }

  /**
   * Create a reverse easing function
   */
  private getReverseEasing(easing: EasingFunction): EasingFunction {
    return (t) => 1 - easing(1 - t);
  }
}

/**
 * Animate a property from one value to another
 */
export function animate(
  options: AnimationOptions & {
    from: number | number[];
    to: number | number[];
    onUpdate: (value: number | number[]) => void;
  }
): Animation {
  const { from, to, onUpdate, ...animOptions } = options;

  // Handle array values
  const isArray = Array.isArray(from) && Array.isArray(to);

  // Create animation
  return new Animation({
    ...animOptions,
    onUpdate: (progress) => {
      if (isArray) {
        // Interpolate each value in the arrays
        const fromArr = from as number[];
        const toArr = to as number[];
        const result = fromArr.map((fromVal, i) => {
          const toVal = toArr[i];
          return fromVal + (toVal - fromVal) * progress;
        });
        onUpdate(result);
      } else {
        // Interpolate single values
        const fromVal = from as number;
        const toVal = to as number;
        onUpdate(fromVal + (toVal - fromVal) * progress);
      }
    }
  }).start();
}
