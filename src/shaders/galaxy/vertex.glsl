uniform float time;
uniform float size;
uniform float rotationSpeed;
uniform float spiralFactor;

attribute vec3 position;
attribute vec3 color;
attribute float aScale;
attribute vec3 aRandomness;

varying vec3 vColor;
varying float vDistance;

void main() {
    // Calculate rotation
    float angle = time * rotationSpeed;
    float c = cos(angle);
    float s = sin(angle);
    
    // Get distance from center for spiral effect
    float dist = length(position.xz);
    vDistance = dist;
    
    // Apply spiral rotation
    float spiralAngle = dist * spiralFactor;
    float sc = cos(spiralAngle);
    float ss = sin(spiralAngle);
    
    // Combine rotations
    vec3 pos = position;
    pos.x = position.x * c * sc - position.z * s * ss;
    pos.z = position.x * s * sc + position.z * c * ss;
    
    // Add randomness
    pos += aRandomness * (0.5 + 0.5 * sin(time * 0.5));
    
    // Project position
    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mvPosition;
    
    // Set point size based on distance and scale
    gl_PointSize = size * aScale * (1.0 / -mvPosition.z);
    
    // Pass color to fragment shader
    vColor = color;
}
