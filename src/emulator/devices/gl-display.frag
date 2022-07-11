#version 300 es
precision mediump float;
in vec2 v_uv;
out vec4 color;

uniform sampler2D u_image;
uniform uint u_color_mode;

vec4 rgb(vec4 v, uint bits){
    uint color = uint(v.x * 255.) + (uint(v.y * 255.) << 8u) + (uint(v.z * 255.) << 16u);
    uint blue_bits = bits / 3u;
    uint blue_mask = (1u << blue_bits) - 1u;
    uint red_bits = (bits - blue_bits) / 2u;
    uint red_mask = (1u << red_bits) - 1u;
    uint green_bits = bits - blue_bits - red_bits;
    uint green_mask = (1u << green_bits) - 1u;
    
    uint green_offset = blue_bits;
    uint red_offset = green_offset + green_bits;
    return vec4(
        float((color >> red_offset   ) & red_mask) / float(red_mask),
        float((color >> green_offset ) & green_mask) / float(green_mask),
        float((color                  ) & blue_mask) / float(blue_mask),
        1
    );
}
vec4 rgbi(vec4 v){
    uint c = uint(v.x * 255.);
    uint r = (c >> 3u) & 1u;
    uint g = (c >> 2u) & 1u;
    uint b = (c >> 1u) & 1u;
    uint i = ((c >> 0u) & 1u) + 1u;
    if ((c & 15u) == 1u){
        return vec4(0.25, 0.25, 0.25, 1.);
    }
    return vec4(float(r*i)/2.1, float(g*i)/2.1, float(b*i)/2.1, 1.);
}
// vec4 pallet_pico8[16] = vec4[16](
//     ${pico8.map(v => `vec4(${v.map(n=>(n/255))},1.)`).join(",")}
// );

vec4 pico8(vec4 v){
    return v;
    // return pallet_pico8[uint(v.x * 255.) & 15u];
}

vec4 mono(vec4 c){
    return vec4(c.x, c.x, c.x, 1);
}

vec4 bin(vec4 c){
    return c.x > 0. || c.y > 0. || c.z > 0. ? vec4(1,1,1,1) : vec4(0,0,0,1);
}


void main(){
    vec4 c = texture(u_image, v_uv);
    switch (u_color_mode){
        case 0u: color = rgb(c, 8u); break;
        case 1u: color = mono(c); break;
        case 2u: color = bin(c); break;
        case 3u: color = rgb(c, 8u); break;
        case 4u: color = rgb(c, 16u); break;
        case 5u: color = rgb(c, 24u); break;
        case 6u: color = rgb(c, 6u); break;
        case 7u: color = rgb(c, 12u); break;
        case 8u: color = pico8(c); break;
        case 9u: color = rgbi(c); break;
        default: color = pico8(c); break;
    }
}