export interface Material {
  id: string;
  shader: string;
  properties: Record<string, any>;
  textures: Record<string, WebGLTexture>;
}

export class MaterialSystem {
  private gl: WebGL2RenderingContext;
  private materials: Map<string, Material> = new Map();
  private textures: Map<string, WebGLTexture> = new Map();

  constructor(gl: WebGL2RenderingContext) {
    this.gl = gl;
    this.createDefaultMaterials();
  }

  private createDefaultMaterials() {
    // Creature body materials with design system colors
    this.createMaterial('creature-torso', {
      shader: 'creature',
      properties: {
        baseColor: [1.0, 0.42, 0.21, 1.0], // Primary color from design system
        energyColor: [1.0, 0.67, 0.4, 1.0], // Primary glow
        roughness: 0.8,
        metallic: 0.1
      }
    });

    this.createMaterial('creature-limb', {
      shader: 'creature',
      properties: {
        baseColor: [0.31, 0.8, 0.77, 1.0], // Accent color
        energyColor: [0.5, 0.9, 0.85, 1.0],
        roughness: 0.7,
        metallic: 0.0
      }
    });

    this.createMaterial('creature-joint', {
      shader: 'creature',
      properties: {
        baseColor: [0.64, 0.4, 0.8, 1.0], // Secondary color
        energyColor: [0.7, 0.5, 0.9, 1.0],
        roughness: 0.6,
        metallic: 0.2
      }
    });

    // Terrain materials
    this.createMaterial('ground', {
      shader: 'sprite',
      properties: {
        color: [0.55, 0.27, 0.07, 1.0], // Brown ground
        roughness: 1.0,
        metallic: 0.0
      }
    });

    this.createMaterial('platform', {
      shader: 'sprite',
      properties: {
        color: [0.8, 0.6, 0.4, 1.0], // Lighter platform
        roughness: 0.8,
        metallic: 0.1
      }
    });

    this.createMaterial('goal', {
      shader: 'sprite',
      properties: {
        color: [0.2, 0.8, 0.2, 1.0], // Bright green goal
        roughness: 0.3,
        metallic: 0.5
      }
    });

    // Particle materials
    this.createMaterial('dust-particle', {
      shader: 'particle',
      properties: {
        startColor: [0.9, 0.8, 0.6, 0.8],
        endColor: [0.7, 0.6, 0.4, 0.0],
        size: 4.0
      }
    });

    this.createMaterial('sweat-particle', {
      shader: 'particle',
      properties: {
        startColor: [0.7, 0.9, 1.0, 1.0],
        endColor: [0.5, 0.7, 0.9, 0.0],
        size: 3.0
      }
    });
  }

  createMaterial(id: string, config: {
    shader: string;
    properties: Record<string, any>;
    textures?: Record<string, string>;
  }): Material {
    const material: Material = {
      id,
      shader: config.shader,
      properties: config.properties,
      textures: {}
    };

    // Load textures if specified
    if (config.textures) {
      for (const [name, path] of Object.entries(config.textures)) {
        this.loadTexture(path).then(texture => {
          if (texture) {
            material.textures[name] = texture;
          }
        });
      }
    }

    this.materials.set(id, material);
    return material;
  }

  getMaterial(id: string): Material | undefined {
    return this.materials.get(id);
  }

  updateMaterialProperty(materialId: string, property: string, value: any) {
    const material = this.materials.get(materialId);
    if (material) {
      material.properties[property] = value;
    }
  }

  private async loadTexture(path: string): Promise<WebGLTexture | null> {
    const gl = this.gl;
    const texture = gl.createTexture();
    
    if (!texture) {
      return null;
    }

    // Create a placeholder texture while loading
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, 
                  new Uint8Array([255, 255, 255, 255]));

    try {
      const image = new Image();
      image.crossOrigin = 'anonymous';
      
      await new Promise<void>((resolve, reject) => {
        image.onload = () => resolve();
        image.onerror = reject;
        image.src = path;
      });

      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
      
      // Generate mipmaps for better quality
      gl.generateMipmap(gl.TEXTURE_2D);
      
      // Set texture parameters
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

      this.textures.set(path, texture);
      return texture;
    } catch (error) {
      console.error('Failed to load texture:', path, error);
      return texture; // Return placeholder texture
    }
  }

  bindMaterial(material: Material, shaderProgram: WebGLProgram) {
    const gl = this.gl;
    
    // Bind textures
    let textureUnit = 0;
    for (const [name, texture] of Object.entries(material.textures)) {
      gl.activeTexture(gl.TEXTURE0 + textureUnit);
      gl.bindTexture(gl.TEXTURE_2D, texture);
      
      const location = gl.getUniformLocation(shaderProgram, `u_${name}`);
      if (location) {
        gl.uniform1i(location, textureUnit);
      }
      textureUnit++;
    }
    
    // Set material properties as uniforms
    for (const [name, value] of Object.entries(material.properties)) {
      const location = gl.getUniformLocation(shaderProgram, `u_${name}`);
      if (location) {
        if (Array.isArray(value)) {
          switch (value.length) {
            case 1:
              gl.uniform1f(location, value[0]);
              break;
            case 2:
              gl.uniform2fv(location, value);
              break;
            case 3:
              gl.uniform3fv(location, value);
              break;
            case 4:
              gl.uniform4fv(location, value);
              break;
          }
        } else if (typeof value === 'number') {
          gl.uniform1f(location, value);
        }
      }
    }
  }

  destroy() {
    const gl = this.gl;
    
    // Delete all textures
    for (const texture of this.textures.values()) {
      gl.deleteTexture(texture);
    }
    
    this.textures.clear();
    this.materials.clear();
  }
}