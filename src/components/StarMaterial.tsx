// import { ShaderMaterial, Color, TextureLoader } from "three";
// import { extend, ReactThreeFiber } from "@react-three/fiber";
// import { color } from "three/webgpu";

export const vertexShader = /* glsl */ `
attribute float scale;
attribute vec3 color;

out vec3 vColor;

void main() {
  vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );
  gl_PointSize = scale * ( 300.0 / - mvPosition.z );
  gl_Position = projectionMatrix * mvPosition;
  vColor = color;
}`;

export const fragmentShader = /* glsl */ `
in vec3 vColor;
uniform sampler2D pointTexture;

void main() {
  if (length(gl_PointCoord - vec2(0.5, 0.5)) > 0.475) discard;
  gl_FragColor = vec4(vColor, 1.0) * texture2D( pointTexture, gl_PointCoord );
}`;
// export class StarMaterial extends ShaderMaterial {
//   constructor() {
//     super({
//       uniforms: {
//         color: { value: new Color(0xffffff) },
//         pointTexture: {
//           value: new TextureLoader().load("/textures/blended_star.png"),
//         },
//       },
//       vertexShader
//       fragmentShader: /* glsl */ `

//   }
// }
