export const galaxyFragmentShader = `
  uniform float uTime;
  uniform vec3 uBaseColor;
  uniform float uDensity;
  uniform float uBrightness;
  
  varying vec3 vColor;
  varying vec2 vUv;
  
  float rand(vec2 co) {
    return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
  }
  
  void main() {
    // Disc pattern
    float strength = distance(gl_PointCoord, vec2(0.5));
    strength = 1.0 - strength;
    strength = pow(strength, 3.0);
    
    // Color mixing
    vec3 color = mix(uBaseColor, vColor, strength);
    
    // Brightness variation
    float brightness = uBrightness * (0.8 + 0.2 * sin(uTime * 2.0 + rand(vUv) * 6.28));
    color *= brightness;
    
    // Density falloff
    float alpha = strength * uDensity;
    
    // Output
    gl_FragColor = vec4(color, alpha);
  }
`;
