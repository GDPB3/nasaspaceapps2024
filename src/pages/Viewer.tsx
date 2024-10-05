import "@mantine/core/styles.css";
import React, { useMemo } from "react";
import { Star } from "../types";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { Affix } from "@mantine/core";
import PlanetInfo from "../components/PlanetInfo";

type ViewerProps = {
  planet: string;
  stars: Star[];
};

type ViewerState = object;

const STAR_SIZE = 0.3;

const textureLoader = new THREE.TextureLoader();
const starTexture = textureLoader.load("/textures/star.png");

function getVertices(stars: Star[]) {
  const _verts = [];
  for (const star of stars) {
    _verts.push(star.pos[0]);
    _verts.push(star.pos[1]);
    _verts.push(star.pos[2]);
  }

  return new Float32Array(_verts);
}

function Dots(props: { stars: Star[] }) {
  const vertices = useMemo(() => getVertices(props.stars), [props.stars]);

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
        transparent={true}
        sizeAttenuation={true}
        size={STAR_SIZE}
      />
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
        <Affix position={{ bottom: 20, right: 20 }}>
          <PlanetInfo planet={this.props.planet} />
        </Affix>
        <Canvas>
          <color attach="background" args={["#141622"]} />
          <OrbitControls
            enableDamping
            reverseOrbit
            enableZoom={false} // disable zoom (scroll)
          />
          <Dots stars={this.props.stars} />
        </Canvas>
      </>
    );
  }
}
