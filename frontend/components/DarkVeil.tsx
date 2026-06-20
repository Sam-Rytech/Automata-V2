'use client';
import { useRef, useEffect } from 'react';
import { Renderer, Program, Mesh, Triangle, Vec2 } from 'ogl';
import './DarkVeil.css';

const vertex = `attribute vec2 position; void main(){gl_Position=vec4(position,0.0,1.0);}`;
const fragment = `#ifdef GL_ES
precision lowp float;
#endif
uniform vec2 uResolution;
uniform float uTime;
uniform float uHueShift;
uniform float uNoise;
uniform float uScan;
uniform float uScanFreq;
uniform float uWarp;
#define iTime uTime
#define iResolution uResolution
vec4 buf[8];
float rand(vec2 c){return fract(sin(dot(c,vec2(12.9898,78.233)))*43758.5453);}
mat3 rgb2yiq=mat3(0.299,0.587,0.114,0.596,-0.274,-0.322,0.211,-0.523,0.312);
mat3 yiq2rgb=mat3(1.0,0.956,0.621,1.0,-0.272,-0.647,1.0,-1.106,1.703);
vec3 hueShiftRGB(vec3 col,float deg){
  vec3 yiq=rgb2yiq*col;
  float rad=radians(deg);
  float cosh=cos(rad),sinh=sin(rad);
  vec3 yiqShift=vec3(yiq.x,yiq.y*cosh-yiq.z*sinh,yiq.y*sinh+yiq.z*cosh);
  return clamp(yiq2rgb*yiqShift,0.0,1.0);
}
vec4 sigmoid(vec4 x){return 1./(1.+exp(-x));}

// Extracted utility function for matrix multiplication
vec4 multiplyMat4Vec4(mat4 matrix, vec4 vector) {
  return matrix * vector;
}

// Extracted utility function for vector calculations
vec4 calculateVector(vec4 vector, float in0, float in1, float in2) {
  vec4 result = vec4(vector.x, vector.y, 0.3948333106474662 + in0, 0.36 + in1);
  result = multiplyMat4Vec4(mat4(
    vec4(6.5404263,-3.6126034,0.7590882,-1.13613),
    vec4(2.4582713,3.1660357,1.2219609,0.06276096),
    vec4(-5.478085,-6.159632,1.8701609,-4.7742867),
    vec4(6.039214,-5.542865,-0.90925294,3.251348)
  ), result);
  return result;
}

vec4 cppn_fn(vec2 coordinate,float in0,float in1,float in2){
  buf[6]=vec4(coordinate.x,coordinate.y,0.3948333106474662+in0,0.36+in1);
  buf[7]=vec4(0.14+in2,sqrt(coordinate.x*coordinate.x+coordinate.y*coordinate.y),0.,0.);
  buf[0]=calculateVector(buf[6], in0, in1, in2);
  buf[1]=multiplyMat4Vec4(mat4(
    vec4(-3.3522482,-6.0612736,0.55641043,-4.4719114),
    vec4(0.8631464,1.7432913,5.643898,1.6106541),
    vec4(2.4941394,-3.5012043,1.7184316,6.357333),
    vec4(3.310376,8.209261,1.1355612,-1.165539)
  ), buf[6]);
  buf[0]=sigmoid(buf[0]);
  buf[1]=sigmoid(buf[1]);
  // ... rest of the code remains the same ...
}