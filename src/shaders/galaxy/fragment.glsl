uniform float brightness;
uniform vec3 baseColor;

varying vec3 vColor;
varying float vDistance;

void main() {
    // Calculate distance from center of point
    vec2 center = gl_PointCoord - 0.5;
    float dist = length(center);
    
    // Discard pixels outside of point circle
    if (dist > 0.5) {
        discard;
    }
    
    // Calculate falloff based on distance from center
    float falloff = 1.0 - 2.0 * dist;
    falloff = pow(falloff, 2.0);
    
    // Mix colors based on distance from galaxy center
    vec3 color = mix(vColor, baseColor, vDistance * 0.1);
    
    // Apply brightness and falloff
    gl_FragColor = vec4(color * brightness * falloff, falloff);
}
