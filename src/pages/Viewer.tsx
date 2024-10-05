import "@mantine/core/styles.css";
import React, { useMemo } from "react";
import { PlanetData } from "../types";
import { Canvas, extend, useThree, useRender } from "@react-three/fiber";
import { OrbitControls, Point, PointMaterial } from "@react-three/drei";
import * as THREE from "three";

type ViewerProps = {
  planet: PlanetData;
};

type ViewerState = object;

const NUM_STARS = 1000;
const STAR_SIZE = 0.3;

const textureLoader = new THREE.TextureLoader();
const starTexture = textureLoader.load("/textures/star.png");

function getVertices() {
  const geometry = new THREE.BufferGeometry();

  const vertices_jsarray = [];
  for (let i = 0; i < NUM_STARS; i++) {
    vertices_jsarray.push((Math.random() - 0.5) * 100); // -0.5 to get the range from -0.5 to 0.5 than * 100 to get a range from -50 to 50
    vertices_jsarray.push((Math.random() - 0.5) * 100);
    vertices_jsarray.push((Math.random() - 0.5) * 100);
  }

  const vertices = new Float32Array(vertices_jsarray);

  return { geometry, vertices };
}

function Dots(data: any) {
  const { geometry, vertices } = useMemo(getVertices, []);

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
      </bufferGeometry>
      <pointsMaterial
        map={starTexture}
        sizeAttenuation={true}
        size={STAR_SIZE}></pointsMaterial>
    </points>
  );
}

export default class Viewer extends React.Component<ViewerProps, ViewerState> {
  constructor(props: ViewerProps) {
    super(props);
  }

  render() {
    return (
      <>
        <div>{this.props.planet}</div>
        <Canvas>
          {/* <ambientLight intensity={2} color={0xffffff} />
        <pointLight position={[0, 0, 0]} intensity={2} color={0xffffff} /> */}
          <OrbitControls
            enableDamping
            reverseOrbit
            enableZoom={false} // disable zoom (scroll)
          />
          <Dots data={{}} />
        </Canvas>
      </>
    );
  }
}
