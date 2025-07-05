export interface Shader {
  program: WebGLProgram;
  vertexShader: WebGLShader;
  fragmentShader: WebGLShader;
}

export class ShaderManager {
  private gl: WebGL2RenderingContext;
  private shaders: Map<string, Shader> = new Map();

  constructor(gl: WebGL2RenderingContext) {
    this.gl = gl;
  }

  loadDefaultShaders() {
    // Solid color shader for terrain and simple objects
    this.createShader('solid', this.getSolidVertexShader(), this.getSolidFragmentShader());
    
    // Basic sprite shader for textured objects
    this.createShader('sprite', this.getSpriteVertexShader(), this.getSpriteFragmentShader());
    
    // Particle shader
    this.createShader('particle', this.getParticleVertexShader(), this.getParticleFragmentShader());
    
    // Creature body shader with enhanced coloring
    this.createShader('creature', this.getCreatureVertexShader(), this.getCreatureFragmentShader());
  }

  private createShader(name: string, vertexSource: string, fragmentSource: string): boolean {
    const gl = this.gl;
    
    const vertexShader = this.compileShader(gl.VERTEX_SHADER, vertexSource);
    const fragmentShader = this.compileShader(gl.FRAGMENT_SHADER, fragmentSource);
    
    if (!vertexShader || !fragmentShader) {
      return false;
    }
    
    const program = gl.createProgram();
    if (!program) {
      return false;
    }
    
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error('Shader program failed to link:', gl.getProgramInfoLog(program));
      return false;
    }
    
    this.shaders.set(name, {
      program,
      vertexShader,
      fragmentShader
    });
    
    return true;
  }

  private compileShader(type: number, source: string): WebGLShader | null {
    const gl = this.gl;
    const shader = gl.createShader(type);
    
    if (!shader) {
      return null;
    }
    
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.error('Shader compilation error:', gl.getShaderInfoLog(shader));
      gl.deleteShader(shader);
      return null;
    }
    
    return shader;
  }

  getShader(name: string): Shader | undefined {
    return this.shaders.get(name);
  }

  private getSpriteVertexShader(): string {
    return `#version 300 es
      layout(location = 0) in vec2 a_position;
      layout(location = 1) in vec2 a_uv;
      
      uniform mat4 u_mvpMatrix;
      
      out vec2 v_uv;
      
      void main() {
        gl_Position = u_mvpMatrix * vec4(a_position, 0.0, 1.0);
        v_uv = a_uv;
      }
    `;
  }

  private getSpriteFragmentShader(): string {
    return `#version 300 es
      precision highp float;
      
      in vec2 v_uv;
      uniform sampler2D u_texture;
      uniform vec4 u_color;
      
      out vec4 fragColor;
      
      void main() {
        vec4 texColor = texture(u_texture, v_uv);
        fragColor = texColor * u_color;
      }
    `;
  }

  private getParticleVertexShader(): string {
    return `#version 300 es
      layout(location = 0) in vec2 a_position;
      layout(location = 1) in vec2 a_velocity;
      layout(location = 2) in float a_life;
      layout(location = 3) in float a_size;
      
      uniform mat4 u_mvpMatrix;
      uniform float u_time;
      
      out float v_life;
      out float v_size;
      
      void main() {
        vec2 pos = a_position + a_velocity * u_time;
        gl_Position = u_mvpMatrix * vec4(pos, 0.0, 1.0);
        gl_PointSize = a_size * a_life;
        
        v_life = a_life;
        v_size = a_size;
      }
    `;
  }

  private getParticleFragmentShader(): string {
    return `#version 300 es
      precision highp float;
      
      in float v_life;
      in float v_size;
      
      uniform vec4 u_startColor;
      uniform vec4 u_endColor;
      
      out vec4 fragColor;
      
      void main() {
        // Create circular particle
        vec2 coord = gl_PointCoord - vec2(0.5);
        float dist = length(coord);
        
        if (dist > 0.5) {
          discard;
        }
        
        // Fade based on life and create soft edges
        float alpha = (1.0 - dist * 2.0) * v_life;
        vec4 color = mix(u_endColor, u_startColor, v_life);
        
        fragColor = vec4(color.rgb, color.a * alpha);
      }
    `;
  }

  private getCreatureVertexShader(): string {
    return `#version 300 es
      layout(location = 0) in vec2 a_position;
      layout(location = 1) in vec2 a_uv;
      
      uniform mat4 u_mvpMatrix;
      uniform float u_time;
      uniform float u_energy; // Animation energy level
      
      out vec2 v_uv;
      out float v_energy;
      
      void main() {
        // Add subtle vertex animation based on energy
        vec2 pos = a_position;
        pos.x += sin(u_time * 0.01 + a_position.y * 0.1) * u_energy * 0.5;
        
        gl_Position = u_mvpMatrix * vec4(pos, 0.0, 1.0);
        v_uv = a_uv;
        v_energy = u_energy;
      }
    `;
  }

  private getCreatureFragmentShader(): string {
    return `#version 300 es
      precision highp float;
      
      in vec2 v_uv;
      in float v_energy;
      
      uniform vec4 u_baseColor;
      uniform vec4 u_energyColor;
      uniform float u_time;
      
      out vec4 fragColor;
      
      void main() {
        // Create gradient based on energy
        vec4 color = mix(u_baseColor, u_energyColor, v_energy * 0.5);
        
        // Add subtle pulse effect
        float pulse = sin(u_time * 0.02) * 0.1 + 0.9;
        
        // Add some texture-like detail
        float detail = sin(v_uv.x * 20.0) * sin(v_uv.y * 20.0) * 0.1;
        
        fragColor = vec4(color.rgb * pulse + detail, color.a);
      }
    `;
  }

  private getSolidVertexShader(): string {
    return `#version 300 es
      layout(location = 0) in vec2 a_position;
      layout(location = 1) in vec2 a_uv;
      
      uniform mat4 u_mvpMatrix;
      
      void main() {
        gl_Position = u_mvpMatrix * vec4(a_position, 0.0, 1.0);
      }
    `;
  }

  private getSolidFragmentShader(): string {
    return `#version 300 es
      precision highp float;
      
      uniform vec4 u_color;
      
      out vec4 fragColor;
      
      void main() {
        fragColor = u_color;
      }
    `;
  }

  destroy() {
    const gl = this.gl;
    
    for (const shader of this.shaders.values()) {
      gl.deleteProgram(shader.program);
      gl.deleteShader(shader.vertexShader);
      gl.deleteShader(shader.fragmentShader);
    }
    
    this.shaders.clear();
  }
}