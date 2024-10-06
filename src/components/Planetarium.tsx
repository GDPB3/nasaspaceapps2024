import "@mantine/core/styles.css";
import React, { useMemo } from "react";
import { PlanetData, Star } from "../types";
import { Canvas, extend, ThreeElements, useFrame } from "@react-three/fiber";
import {
  OrbitControls,
  Plane,
  Stats,
  TrackballControls,
} from "@react-three/drei";
import * as THREE from "three";
import { Affix, Text, ActionIcon, Group, ThemeIcon } from "@mantine/core";
import PlanetInfo from "./PlanetInfo";
import {
  IconAccessible,
  IconAccessibleOff,
  IconAlien,
  IconPlayerPause,
  IconPlayerPlay,
} from "@tabler/icons-react";
import { clamp, hsv2rgb, rgb2hsv, wavelength2rgb } from "../tools";
import { fragmentShader, vertexShader } from "./StarMaterial";
import { color } from "three/webgpu";

const STAR_SIZE = 1;

function Planet() {
  return (
    <mesh>
      <sphereGeometry args={[0.05, 30, 30]} />
      <meshBasicMaterial color="red" />
    </mesh>
  );
}

type DotsProps = {
  stars: Star[];
  onHover?: (id: number) => void;
  onLeave?: () => void;
};

const calcStarColor = (star: Star): [number, number, number] => {
  // Wien’s displacement law (https://www.quora.com/How-can-I-derive-an-RGB-value-from-the-color-index-of-stars)
  const peak_wavelength = 2897771.9 / star.temperature;
  const rgb = wavelength2rgb(peak_wavelength); // rgb in [0,1]
  // Convert rgb to hsv, adjust luminance convert back to rgb
  const hsv = rgb2hsv(...rgb);
  const luminance_value = clamp(star.lum / 100, 0, 1);
  const rgb2 = hsv2rgb(hsv[0], hsv[1], luminance_value);

  // convert [0,1] rgb to [0,255] rgb
  return rgb2.map((x) => x * 255) as [number, number, number];
};

function getInfo(stars: Star[]) {
  const _verts = [];
  const _colors = [];
  const _sizes = [];
  for (const star of stars) {
    _verts.push(...star.pos);
    _colors.push(...calcStarColor(star));
    _sizes.push(star.radius * STAR_SIZE);
  }
  const vertices = new Float32Array(_verts);
  const colors = new Float32Array(_colors);
  const sizes = new Float32Array(_sizes);

  return { vertices, colors, sizes };
}

const textureLoader = new THREE.TextureLoader();
const starTexture = textureLoader.load("/textures/blended_star.png");

// extend({ StarMaterial });

function Dots(props: DotsProps) {
  const { vertices, colors, sizes } = useMemo(
    () => getInfo(props.stars),
    [props.stars]
  );

  // console.log(sizes);

  return (
    <points>
      <bufferGeometry attach="geometry">
        <bufferAttribute
          attach="attributes-position"
          count={vertices.length / 3}
          array={vertices}
          itemSize={3}
          onUpdate={(self) => {
            self.needsUpdate = true;
          }}
        />
        <bufferAttribute attach="attributes-scale" args={[sizes, 1]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <shaderMaterial
        transparent
        depthTest={false}
        blending={THREE.AdditiveBlending}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={{
          color: { value: new THREE.Color(0xffffff) },
          pointTexture: { value: starTexture },
        }}
      />
    </points>
  );
}

type PlanetariumProps = {
  stars: Star[];

  autoRotate: boolean;
  onUserInteract?: () => void;
  onUserInteractEnd?: () => void;
};

type PlanetariumState = object;
export default class Planetarium extends React.Component<
  PlanetariumProps,
  PlanetariumState
> {
  constructor(props: PlanetariumProps) {
    super(props);

    this.state = {};
  }

  render() {
    return (
      <Canvas>
        <color attach="background" args={["#000000"]} />
        <OrbitControls
          enableDamping
          onStart={this.props.onUserInteract}
          onEnd={this.props.onUserInteractEnd}
          reverseOrbit
          enableRotate
          autoRotate={this.props.autoRotate}
          maxDistance={0.001}
          enableZoom={false} // disable zoom (scroll)
        />
        <Dots
          stars={this.props.stars}
          // onHover={(id) => this.setState({ hovered: id })}
          // onLeave={() => this.setState({ hovered: null })}
        />
        <gridHelper
          args={[2000, 2000]}
          position={[0, -1, 0]}
          // rotation={[0, 1, 0]}
        />
        <Stats />
        <Planet />
      </Canvas>
    );
  }
}
