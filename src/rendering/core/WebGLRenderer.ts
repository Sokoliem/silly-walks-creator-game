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
  baseTransform?: {
    position: { x: number; y: number };
    rotation: number;
    scale: { x: number; y: number };
  };
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
  
  // Shared geometry buffers (create once, reuse many times)
  private quadVertexBuffer: WebGLBuffer | null = null;
  private quadIndexBuffer: WebGLBuffer | null = null;
  
  // Performance optimization: cache matrices
  private matrixCache: Map<string, Float32Array> = new Map();
  private cameraChanged = true;

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
    
    // Set clear color to visible dark blue for debugging
    gl.clearColor(0.1, 0.1, 0.3, 1.0);
    console.log('WebGL clear color set to dark blue for visibility');
    
    // Initialize default shaders
    console.log('Loading default shaders...');
    this.shaderManager.loadDefaultShaders();
    console.log('Default shaders loaded');
    
    // Create shared quad geometry once
    console.log('Creating quad geometry...');
    this.createQuadGeometry();
    console.log('Quad geometry created');
    
    this.updateProjection();
    
    // Test WebGL state
    console.log('WebGL state check:', {
      blend: gl.isEnabled(gl.BLEND),
      viewport: gl.getParameter(gl.VIEWPORT),
      clearColor: gl.getParameter(gl.COLOR_CLEAR_VALUE)
    });
  }

  private createQuadGeometry() {
    const gl = this.gl;
    
    // Quad vertices: position (x, y) + UV coordinates (u, v)
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
    
    // Create vertex buffer
    this.quadVertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.quadVertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
    
    // Create index buffer
    this.quadIndexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.quadIndexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);
  }

  updateProjection() {
    const width = this.canvas.width;
    const height = this.canvas.height;
    
    // Create orthographic projection that maps world coordinates to screen
    const zoom = this.camera.zoom;
    const left = -width / (2 * zoom);
    const right = width / (2 * zoom);
    const bottom = height / (2 * zoom);  // Note: bottom > top for screen coordinates
    const top = -height / (2 * zoom);
    const near = -1;
    const far = 1;
    
    // Orthographic projection matrix
    this.projectionMatrix.set([
      2 / (right - left), 0, 0, 0,
      0, 2 / (top - bottom), 0, 0,
      0, 0, -2 / (far - near), 0,
      -(right + left) / (right - left), -(top + bottom) / (top - bottom), -(far + near) / (far - near), 1
    ]);
    
    // View matrix with camera position
    this.viewMatrix.set([
      1, 0, 0, 0,
      0, 1, 0, 0,
      0, 0, 1, 0,
      -this.camera.x, -this.camera.y, 0, 1
    ]);
    
    console.log(`Camera updated: pos(${this.camera.x}, ${this.camera.y}) zoom(${zoom}) viewport(${width}x${height})`);
    console.log(`World bounds: left=${left.toFixed(1)} right=${right.toFixed(1)} top=${top.toFixed(1)} bottom=${bottom.toFixed(1)}`);
  }

  setCamera(x: number, y: number, zoom: number) {
    if (this.camera.x !== x || this.camera.y !== y || this.camera.zoom !== zoom) {
      this.camera.x = x;
      this.camera.y = y;
      this.camera.zoom = zoom;
      this.cameraChanged = true;
      this.updateProjection();
    }
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
    
    // Debug: Log render info and transformed positions
    if (Date.now() % 3000 < 50) {
      console.log(`WebGL Render: ${sortedObjects.length} objects, Canvas: ${this.canvas.width}x${this.canvas.height}`);
      console.log(`Camera: x=${this.camera.x}, y=${this.camera.y}, zoom=${this.camera.zoom}`);
      
      // Check where objects end up after transformation
      sortedObjects.forEach(obj => {
        const modelMatrix = this.createModelMatrix(obj);
        const mvpMatrix = this.multiplyMatrices(
          this.projectionMatrix,
          this.multiplyMatrices(this.viewMatrix, modelMatrix)
        );
        
        // Transform object center point
        const worldPos = [obj.position.x, obj.position.y, 0, 1];
        const clipPos = [
          mvpMatrix[0] * worldPos[0] + mvpMatrix[4] * worldPos[1] + mvpMatrix[12],
          mvpMatrix[1] * worldPos[0] + mvpMatrix[5] * worldPos[1] + mvpMatrix[13],
          mvpMatrix[2] * worldPos[0] + mvpMatrix[6] * worldPos[1] + mvpMatrix[14],
          mvpMatrix[3] * worldPos[0] + mvpMatrix[7] * worldPos[1] + mvpMatrix[15]
        ];
        
        console.log(`  ${obj.id}: world(${obj.position.x.toFixed(1)}, ${obj.position.y.toFixed(1)}) -> clip(${clipPos[0].toFixed(2)}, ${clipPos[1].toFixed(2)}) material: ${obj.material}`);
      });
    }
    
    // Render each object
    for (const obj of sortedObjects) {
      this.renderObject(obj);
    }
    
    // Check for WebGL errors
    const error = gl.getError();
    if (error !== gl.NO_ERROR) {
      console.error('WebGL render error:', error);
    }
  }

  private renderObject(obj: RenderObject) {
    const gl = this.gl;
    
    // Get material and determine shader
    const material = this.materialSystem.getMaterial(obj.material || 'ground');
    const shaderName = material ? material.shader : 'solid';
    
    const shader = this.shaderManager.getShader(shaderName);
    if (!shader) {
      console.error(`RENDER ERROR: Shader not found: ${shaderName} for object ${obj.id}`);
      return;
    }
    
    // Check if program is valid
    if (!gl.getProgramParameter(shader.program, gl.LINK_STATUS)) {
      console.error(`RENDER ERROR: Shader program not linked for ${shaderName}:`, gl.getProgramInfoLog(shader.program));
      return;
    }
    
    gl.useProgram(shader.program);
    
    // Set up transformation matrix
    const modelMatrix = this.createModelMatrix(obj);
    const mvpMatrix = this.multiplyMatrices(
      this.projectionMatrix,
      this.multiplyMatrices(this.viewMatrix, modelMatrix)
    );
    
    // Set uniforms
    const mvpLocation = gl.getUniformLocation(shader.program, 'u_mvpMatrix');
    if (mvpLocation) {
      gl.uniformMatrix4fv(mvpLocation, false, mvpMatrix);
    } else {
      console.error(`RENDER ERROR: u_mvpMatrix uniform not found in shader ${shaderName}`);
      return;
    }
    
    // Set time uniform for animated shaders
    if (shaderName === 'creature') {
      const timeLocation = gl.getUniformLocation(shader.program, 'u_time');
      if (timeLocation) {
        gl.uniform1f(timeLocation, Date.now() * 0.001); // Convert to seconds
      }
      
      const energyLocation = gl.getUniformLocation(shader.program, 'u_energy');
      if (energyLocation) {
        gl.uniform1f(energyLocation, 0.5); // Default energy level
      }
    }
    
    // Bind material properties or fallback
    if (material) {
      this.materialSystem.bindMaterial(material, shader.program);
      console.log(`RENDER: ${obj.id} using material ${obj.material} with shader ${shaderName}`);
    } else {
      // Fallback color for unknown materials
      this.setFallbackColor(shader.program, obj.material || 'ground');
      console.log(`RENDER: ${obj.id} using fallback color for material ${obj.material}`);
    }
    
    // Render quad (sprite)
    console.log(`RENDER: Drawing ${obj.id} at world(${obj.position.x}, ${obj.position.y}) scale(${obj.scale.x}, ${obj.scale.y})`);
    this.renderQuad();
    
    // Check for WebGL errors after each draw
    const error = gl.getError();
    if (error !== gl.NO_ERROR) {
      console.error(`RENDER ERROR: WebGL error rendering object ${obj.id}:`, error);
    }
  }
  
  private setFallbackColor(program: WebGLProgram, materialName: string) {
    const gl = this.gl;
    const colorLocation = gl.getUniformLocation(program, 'u_color');
    
    if (colorLocation) {
      let color = [1.0, 1.0, 1.0, 1.0]; // Default white
      
      switch (materialName) {
        case 'ground':
          color = [0.55, 0.27, 0.07, 1.0]; // Brown
          break;
        case 'platform':
          color = [0.8, 0.6, 0.4, 1.0]; // Light brown
          break;
        case 'goal':
          color = [0.2, 0.8, 0.2, 1.0]; // Green
          break;
        default:
          color = [1.0, 0.42, 0.21, 1.0]; // Primary color
      }
      
      gl.uniform4fv(colorLocation, color);
    }
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
    
    if (!this.quadVertexBuffer || !this.quadIndexBuffer) {
      console.warn('Quad geometry not initialized');
      return;
    }
    
    // Bind the shared vertex buffer
    gl.bindBuffer(gl.ARRAY_BUFFER, this.quadVertexBuffer);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.quadIndexBuffer);
    
    // Set up vertex attributes
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 16, 0);  // Position
    gl.vertexAttribPointer(1, 2, gl.FLOAT, false, 16, 8);  // UV
    gl.enableVertexAttribArray(0);
    gl.enableVertexAttribArray(1);
    
    // Draw
    gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
  }

  resize(width: number, height: number) {
    this.canvas.width = width * window.devicePixelRatio;
    this.canvas.height = height * window.devicePixelRatio;
    this.canvas.style.width = width + 'px';
    this.canvas.style.height = height + 'px';
    this.updateProjection();
  }

  // Public accessors for controlled access
  getMaterialSystem(): MaterialSystem {
    return this.materialSystem;
  }

  getRenderObjects(): Map<string, RenderObject> {
    return this.renderObjects;
  }

  getCamera(): { x: number; y: number; zoom: number } {
    return { ...this.camera };
  }

  clearRenderObjects(layerFilter?: (layer: number) => boolean) {
    if (layerFilter) {
      for (const [id, obj] of this.renderObjects) {
        if (layerFilter(obj.layer)) {
          this.renderObjects.delete(id);
        }
      }
    } else {
      this.renderObjects.clear();
    }
  }

  destroy() {
    const gl = this.gl;
    
    // Clean up shared buffers
    if (this.quadVertexBuffer) {
      gl.deleteBuffer(this.quadVertexBuffer);
      this.quadVertexBuffer = null;
    }
    if (this.quadIndexBuffer) {
      gl.deleteBuffer(this.quadIndexBuffer);
      this.quadIndexBuffer = null;
    }
    
    this.shaderManager.destroy();
    this.materialSystem.destroy();
    this.renderObjects.clear();
  }
}