uniform float uTime;
uniform float uDensity;
uniform float uTwinkleSpeed;
uniform vec3 uColor1;
uniform vec3 uColor2;

varying vec2 vUv;

// Hash function for randomization
float hash(vec2 p) {
    float h = dot(p, vec2(127.1, 311.7));
    return fract(sin(h) * 43758.5453123);
}

// Noise function
float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    
    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));
    
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(a, b, u.x) + (c - a)* u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
}

void main() {
    // Create multiple layers of stars
    float n = 0.0;
    
    // Layer 1: Small, dense stars
    n += noise(vUv * 500.0) * 0.5;
    
    // Layer 2: Medium stars with twinkle
    vec2 pos = vUv * 200.0;
    float twinkle = sin(uTime * uTwinkleSpeed + hash(pos) * 6.28) * 0.5 + 0.5;
    n += noise(pos) * twinkle * 0.3;
    
    // Layer 3: Large, bright stars
    n += noise(vUv * 100.0) * 0.2;
    
    // Apply density
    n *= uDensity;
    
    // Color gradient based on position and noise
    vec3 color = mix(uColor1, uColor2, noise(vUv * 10.0 + uTime * 0.1));
    
    // Brightness threshold for star visibility
    float brightness = smoothstep(0.75, 0.8, n);
    
    // Add color and transparency
    gl_FragColor = vec4(color * brightness, brightness);
}
