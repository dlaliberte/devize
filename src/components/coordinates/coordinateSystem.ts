/**
 * Coordinate System Base
 *
 * Purpose: Defines the interface and common functionality for coordinate systems
 * Author: Cody
 * Creation Date: 2023-11-20
 */

import { Scale } from '../scales/scale';

export interface CoordinateSystemOptions {
  width: number;
  height: number;
  origin?: { x: number, y: number };
}

export interface Point {
  x: number;
  y: number;
}

export interface CoordinateSystem {
  // Convert from domain coordinates to screen coordinates
  toScreen(point: any): Point;

  // Convert from screen coordinates to domain coordinates
  fromScreen(point: Point): any;

  // Get the width and height of the coordinate system
  getDimensions(): { width: number, height: number };

  // Get the origin point in screen coordinates
  getOrigin(): Point;

  // Set the origin point in screen coordinates
  setOrigin(origin: Point): void;
}

// Factory function to create a coordinate system
export function createCoordinateSystem(type: string, options: any): CoordinateSystem {
  // This will be implemented by the specific coordinate system types
  throw new Error(`Coordinate system type '${type}' not implemented`);
}
