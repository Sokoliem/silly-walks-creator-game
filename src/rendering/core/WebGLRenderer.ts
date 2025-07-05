import { ShaderManager } from './ShaderManager';
import { MaterialSystem } from './MaterialSystem';

export interface RenderObject {
  id: string;
  position: { x: number; y: number };
  rotation: number;
  scale: { x: number; y: number };
  sprite?: string;
  material?: string;
  layer: number;
  visible: boolean;
}

export class WebGLRenderer {
  private canvas: HTMLCanvasElement;
  private gl: WebGL2RenderingContext;
  private shaderManager: ShaderManager;
  private materialSystem: MaterialSystem;
  private renderObjects: Map<string, RenderObject> = new Map();
  private viewMatrix: Float32Array;
  private projectionMatrix: Float32Array;
  private camera: { x: number; y: number; zoom: number };

  constructor(canvas: HTMLCanvasElement) {
    console.log('Initializing WebGLRenderer...');
    this.canvas = canvas;
    const gl = canvas.getContext('webgl2');
    if (!gl) {
      console.error('WebGL2 not supported, trying WebGL1...');
      const gl1 = canvas.getContext('webgl');
      if (!gl1) {
        throw new Error('Neither WebGL2 nor WebGL1 is supported');
      }
      throw new Error('WebGL2 not supported, but WebGL1 is available. Need to implement WebGL1 fallback.');
    }
    console.log('WebGL2 context created successfully');
    this.gl = gl;
    
    this.shaderManager = new ShaderManager(gl);
    this.materialSystem = new MaterialSystem(gl);
    
    this.camera = { x: 0, y: 0, zoom: 1 };
    this.viewMatrix = new Float32Array(16);
    this.projectionMatrix = new Float32Array(16);
    
    this.initializeGL();
  }

  private initializeGL() {
    const gl = this.gl;
    
    // Enable blending for transparency
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    
    // Set clear color to transparent
    gl.clearColor(0, 0, 0, 0);
    
    // Initialize default shaders
    this.shaderManager.loadDefaultShaders();
    
    this.updateProjection();
  }

  updateProjection() {
    const width = this.canvas.width;
    const height = this.canvas.height;
    
    // Orthographic projection for 2D
    this.projectionMatrix.set([
      2 / width, 0, 0, 0,
      0, -2 / height, 0, 0,
      0, 0, -1, 0,
      -1, 1, 0, 1
    ]);
    
    // Update view matrix with camera
    const zoom = this.camera.zoom;
    this.viewMatrix.set([
      zoom, 0, 0, 0,
      0, zoom, 0, 0,
      0, 0, 1, 0,
      -this.camera.x * zoom, -this.camera.y * zoom, 0, 1
    ]);
  }

  setCamera(x: number, y: number, zoom: number) {
    this.camera.x = x;
    this.camera.y = y;
    this.camera.zoom = zoom;
    this.updateProjection();
  }

  addRenderObject(obj: RenderObject) {
    this.renderObjects.set(obj.id, obj);
  }

  updateRenderObject(id: string, updates: Partial<RenderObject>) {
    const obj = this.renderObjects.get(id);
    if (obj) {
      Object.assign(obj, updates);
    }
  }

  removeRenderObject(id: string) {
    this.renderObjects.delete(id);
  }

  render() {
    const gl = this.gl;
    
    // Clear the canvas
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    
    // Sort objects by layer for proper rendering order
    const sortedObjects = Array.from(this.renderObjects.values())
      .filter(obj => obj.visible)
      .sort((a, b) => a.layer - b.layer);
    
    // Render each object
    for (const obj of sortedObjects) {
      this.renderObject(obj);
    }
  }

  private renderObject(obj: RenderObject) {
    const gl = this.gl;
    const shader = this.shaderManager.getShader('sprite');
    
    if (!shader) return;
    
    gl.useProgram(shader.program);
    
    // Set up transformation matrix
    const modelMatrix = this.createModelMatrix(obj);
    const mvpMatrix = this.multiplyMatrices(
      this.projectionMatrix,
      this.multiplyMatrices(this.viewMatrix, modelMatrix)
    );
    
    // Set uniforms
    const mvpLocation = gl.getUniformLocation(shader.program, 'u_mvpMatrix');
    gl.uniformMatrix4fv(mvpLocation, false, mvpMatrix);
    
    // Render quad (sprite)
    this.renderQuad();
  }

  private createModelMatrix(obj: RenderObject): Float32Array {
    const matrix = new Float32Array(16);
    const cos = Math.cos(obj.rotation);
    const sin = Math.sin(obj.rotation);
    
    matrix.set([
      cos * obj.scale.x, sin * obj.scale.x, 0, 0,
      -sin * obj.scale.y, cos * obj.scale.y, 0, 0,
      0, 0, 1, 0,
      obj.position.x, obj.position.y, 0, 1
    ]);
    
    return matrix;
  }

  private multiplyMatrices(a: Float32Array, b: Float32Array): Float32Array {
    const result = new Float32Array(16);
    
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        result[i * 4 + j] = 
          a[i * 4 + 0] * b[0 * 4 + j] +
          a[i * 4 + 1] * b[1 * 4 + j] +
          a[i * 4 + 2] * b[2 * 4 + j] +
          a[i * 4 + 3] * b[3 * 4 + j];
      }
    }
    
    return result;
  }

  private renderQuad() {
    const gl = this.gl;
    
    // Simple quad vertices (will be enhanced with proper vertex buffers)
    const vertices = new Float32Array([
      -0.5, -0.5,  0.0, 0.0,  // Bottom left
       0.5, -0.5,  1.0, 0.0,  // Bottom right
       0.5,  0.5,  1.0, 1.0,  // Top right
      -0.5,  0.5,  0.0, 1.0   // Top left
    ]);
    
    const indices = new Uint16Array([
      0, 1, 2,  // First triangle
      2, 3, 0   // Second triangle
    ]);
    
    // Create and bind vertex buffer (simplified for now)
    const vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
    
    const indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);
    
    // Set up vertex attributes
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 16, 0);  // Position
    gl.vertexAttribPointer(1, 2, gl.FLOAT, false, 16, 8);  // UV
    gl.enableVertexAttribArray(0);
    gl.enableVertexAttribArray(1);
    
    // Draw
    gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
    
    // Cleanup
    gl.deleteBuffer(vertexBuffer);
    gl.deleteBuffer(indexBuffer);
  }

  resize(width: number, height: number) {
    this.canvas.width = width * window.devicePixelRatio;
    this.canvas.height = height * window.devicePixelRatio;
    this.canvas.style.width = width + 'px';
    this.canvas.style.height = height + 'px';
    this.updateProjection();
  }

  destroy() {
    this.shaderManager.destroy();
    this.materialSystem.destroy();
    this.renderObjects.clear();
  }
}