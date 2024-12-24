// Galaxy particle vertex shader
export const vertexShader = `
  attribute float size;
  varying vec3 vColor;

  void main() {
    vColor = color;
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = size * (300.0 / -mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;
  }
`;

// Galaxy particle fragment shader
export const fragmentShader = `
  varying vec3 vColor;

  void main() {
    if (length(gl_PointCoord - vec2(0.5, 0.5)) > 0.5) {
      discard;
    }
    
    vec2 coord = gl_PointCoord - vec2(0.5);
    float dist = length(coord);
    
    float alpha = 1.0 - smoothstep(0.4, 0.5, dist);
    
    gl_FragColor = vec4(vColor, alpha);
  }
`;
