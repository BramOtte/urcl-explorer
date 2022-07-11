#version 300 es
precision mediump float;
in vec2 a_uv;
in vec2 a_pos;

out vec2 v_uv;

void main(){
    gl_Position = vec4(a_pos, 0., 1.);
    v_uv = a_uv;
}