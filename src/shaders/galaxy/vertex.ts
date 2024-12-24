export const galaxyVertexShader = `
  uniform float uTime;
  uniform float uSize;
  uniform float uRotationSpeed;
  uniform float uSpiral;
  
  attribute float aScale;
  attribute float aRandomness;
  attribute vec3 aColor;
  
  varying vec3 vColor;
  varying vec2 vUv;
  
  void main() {
    vec4 modelPosition = modelMatrix * vec4(position, 1.0);
    
    // Rotation
    float angle = atan(modelPosition.x, modelPosition.z);
    float distanceToCenter = length(modelPosition.xz);
    float rotationAngle = angle + (uTime * uRotationSpeed * (1.0 / distanceToCenter));
    
    modelPosition.x = cos(rotationAngle) * distanceToCenter;
    modelPosition.z = sin(rotationAngle) * distanceToCenter;
    
    // Spiral arms
    float armOffset = uSpiral * distanceToCenter;
    modelPosition.x += cos(angle * 2.0 + armOffset) * (distanceToCenter * 0.2);
    modelPosition.z += sin(angle * 2.0 + armOffset) * (distanceToCenter * 0.2);
    
    // Randomness
    modelPosition.xyz += normalize(position) * aRandomness;
    
    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectedPosition = projectionMatrix * viewPosition;
    gl_Position = projectedPosition;
    
    // Point size
    gl_PointSize = uSize * aScale;
    gl_PointSize *= (1.0 / -viewPosition.z);
    
    // Varyings
    vColor = aColor;
    vUv = uv;
  }
`;
