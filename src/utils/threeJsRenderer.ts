/**
 * Three.js Renderer Utility
 *
 * Purpose: Provides a wrapper around Three.js for 3D rendering
 * Author: Cody
 * Creation Date: 2023-12-20
 */

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

export interface ThreeJsRendererOptions {
  width: number;
  height: number;
  backgroundColor?: number;
  cameraOptions?: {
    type?: 'perspective' | 'orthographic';
    position?: { x: number, y: number, z: number };
    fov?: number;
    near?: number;
    far?: number;
  };
  controlsOptions?: {
    enableRotate?: boolean;
    enableZoom?: boolean;
    enablePan?: boolean;
    dampingFactor?: number;
    autoRotate?: boolean;
  };
}
export class ThreeJsRenderer {
  private width: number;
  private height: number;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera | THREE.OrthographicCamera;
  private renderer: THREE.WebGLRenderer;
  private controls: OrbitControls | null = null;
  private container: HTMLElement | null = null;
  private animationFrameId: number | null = null;
  private renderCallback: (() => void) | null = null;

  constructor(options: ThreeJsRendererOptions) {
    this.width = options.width;
    this.height = options.height;

    // Create scene
    this.scene = new THREE.Scene();
    if (options.backgroundColor !== undefined) {
      this.scene.background = new THREE.Color(options.backgroundColor);
    }

    // Create camera
    this.camera = this.createCamera(options.cameraOptions);

    // Create renderer
    this.renderer = new THREE.WebGLRenderer({
      antialias: options.antialias !== false,
      alpha: options.alpha !== false
    });
    this.renderer.setSize(this.width, this.height);
    this.renderer.setPixelRatio(window.devicePixelRatio);

    // Add basic lighting
    this.addDefaultLighting();
  }

  private createCamera(options?: ThreeJsRendererOptions['cameraOptions']): THREE.PerspectiveCamera | THREE.OrthographicCamera {
    const aspectRatio = this.width / this.height;

    if (options?.type === 'orthographic') {
      const frustumSize = this.height;
      const camera = new THREE.OrthographicCamera(
        frustumSize * aspectRatio / -2,
        frustumSize * aspectRatio / 2,
        frustumSize / 2,
        frustumSize / -2,
        options.near || 0.1,
        options.far || 2000
      );

      // Set camera position
      const position = options.position || { x: this.width, y: this.height, z: this.width };
      camera.position.set(position.x, position.y, position.z);

      // Set camera target
      const lookAt = options.lookAt || { x: this.width / 2, y: this.height / 2, z: 0 };
      camera.lookAt(new THREE.Vector3(lookAt.x, lookAt.y, lookAt.z));

      return camera;
    } else {
      // Default to perspective camera
      const camera = new THREE.PerspectiveCamera(
        options?.fov || 75,
        aspectRatio,
        options?.near || 0.1,
        options?.far || 2000
      );

      // Set camera position
      const position = options?.position || { x: this.width, y: this.height, z: this.width };
      camera.position.set(position.x, position.y, position.z);

      // Set camera target
      const lookAt = options?.lookAt || { x: this.width / 2, y: this.height / 2, z: 0 };
      camera.lookAt(new THREE.Vector3(lookAt.x, lookAt.y, lookAt.z));

      return camera;
    }
  }

  private addDefaultLighting(): void {
    // Add ambient light
    const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
    this.scene.add(ambientLight);

    // Add directional light
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(1, 1, 1).normalize();
    this.scene.add(directionalLight);

    // Add point light
    const pointLight = new THREE.PointLight(0xffffff, 0.5);
    pointLight.position.set(this.width / 2, this.height / 2, this.width);
    this.scene.add(pointLight);
  }

  public getScene(): THREE.Scene {
    return this.scene;
  }

  public getCamera(): THREE.PerspectiveCamera | THREE.OrthographicCamera {
    return this.camera;
  }

  public getRenderer(): THREE.WebGLRenderer {
    return this.renderer;
  }

  public getControls(): OrbitControls | null {
    return this.controls;
  }

  public setRenderCallback(callback: () => void): void {
    this.renderCallback = callback;
  }

  public attach(container: HTMLElement, controlsOptions?: ThreeJsRendererOptions['controlsOptions']): void {
    this.container = container;
    container.appendChild(this.renderer.domElement);

    // Add orbit controls
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);

    // Apply controls options
    if (controlsOptions) {
      this.controls.enableRotate = controlsOptions.enableRotate !== false;
      this.controls.enableZoom = controlsOptions.enableZoom !== false;
      this.controls.enablePan = controlsOptions.enablePan !== false;

      if (controlsOptions.dampingFactor !== undefined) {
        this.controls.enableDamping = true;
        this.controls.dampingFactor = controlsOptions.dampingFactor;
      }

      if (controlsOptions.autoRotate) {
        this.controls.autoRotate = true;
        if (controlsOptions.autoRotateSpeed !== undefined) {
          this.controls.autoRotateSpeed = controlsOptions.autoRotateSpeed;
        }
      }
    }

    this.controls.update();

    // Start animation loop
    this.startAnimation();
  }

  private startAnimation(): void {
    const animate = () => {
      this.animationFrameId = requestAnimationFrame(animate);

      if (this.controls) {
        this.controls.update();
      }

      // Call custom render callback if provided
      if (this.renderCallback) {
        this.renderCallback();
      }

      this.renderer.render(this.scene, this.camera);
    };

    animate();
  }

  public resize(width: number, height: number): void {
    this.width = width;
    this.height = height;

    // Update renderer
    this.renderer.setSize(width, height);

    // Update camera
    if (this.camera instanceof THREE.PerspectiveCamera) {
      this.camera.aspect = width / height;
      this.camera.updateProjectionMatrix();
    } else {
      const frustumSize = height;
      const aspectRatio = width / height;
      this.camera.left = frustumSize * aspectRatio / -2;
      this.camera.right = frustumSize * aspectRatio / 2;
      this.camera.top = frustumSize / 2;
      this.camera.bottom = frustumSize / -2;
      this.camera.updateProjectionMatrix();
    }
  }

  public dispose(): void {
    // Stop animation loop
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }

    // Remove from DOM
    if (this.container && this.renderer.domElement.parentNode === this.container) {
      this.container.removeChild(this.renderer.domElement);
    }

    // Dispose controls
    if (this.controls) {
      this.controls.dispose();
    }

    // Clear scene
    while (this.scene.children.length > 0) {
      const object = this.scene.children[0];
      if (object instanceof THREE.Mesh) {
        if (object.geometry) object.geometry.dispose();
        if (object.material) {
          if (Array.isArray(object.material)) {
            object.material.forEach(material => material.dispose());
          } else {
            object.material.dispose();
          }
        }
      }
      this.scene.remove(object);
    }

    // Dispose renderer
    this.renderer.dispose();
  }
}
