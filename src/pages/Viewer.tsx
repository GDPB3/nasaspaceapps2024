import "@mantine/core/styles.css";
import React, { useMemo } from "react";
import { PlanetData, Star } from "../types";
import { Canvas, ThreeElements, useFrame } from "@react-three/fiber";
import { OrbitControls, Stats, TrackballControls } from "@react-three/drei";
import * as THREE from "three";
import { Affix, Text, ActionIcon, Group, ThemeIcon } from "@mantine/core";
import PlanetInfo from "../components/PlanetInfo";
import { IconPlayerPause, IconPlayerPlay } from "@tabler/icons-react";
import { clamp, hsv2rgb, rgb2hsv, wavelength2rgb } from "../tools";

const STAR_SIZE = 0.1;

const tempColor = new THREE.Color();
const tempObject = new THREE.Object3D();

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
  onHover: (id: number) => void;
  onLeave: () => void;
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

function Dots(props: DotsProps) {
  const [hovered, set] = React.useState<number | undefined>(undefined);

  const colorArray = Float32Array.from(
    new Array(props.stars.length)
      .fill(0)
      .flatMap((_, i) =>
        tempColor.setRGB(...calcStarColor(props.stars[i])).toArray()
      )
  );
  const meshRef = React.useRef<THREE.InstancedMesh | null>(null);
  const prevRef = React.useRef();

  useFrame(() => {
    let i = 0;
    for (const star of props.stars) {
      const [x, y, z] = star.pos;
      const id = i++;
      tempObject.position.set(x, y, z);
      tempObject.scale.set(star.radius, star.radius, star.radius);
      if (hovered !== prevRef.current) {
        (id === hovered
          ? tempColor.set("#555555")
          : tempColor.setRGB(...calcStarColor(star))
        ).toArray(colorArray, id * 3);
        meshRef!.current!.geometry.attributes.color.needsUpdate = true;
      }
      tempObject.updateMatrix();
      meshRef.current!.setMatrixAt(id, tempObject.matrix);
    }
    meshRef.current!.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh
      ref={meshRef}
      args={[null, null, props.stars.length]}
      onPointerMove={(e) => {
        e.stopPropagation();
        set(e.instanceId);
        if (e.instanceId == null) {
          props.onLeave();
        } else {
          props.onHover(e.instanceId);
        }
      }}
      onPointerOut={() => {
        set(undefined);
        props.onLeave();
      }}>
      <sphereGeometry args={[STAR_SIZE, 15, 30]}>
        <instancedBufferAttribute
          attach="attributes-color"
          args={[colorArray, 3]}
        />
      </sphereGeometry>
      <meshBasicMaterial
        toneMapped={false}
        vertexColors
        transparent={true}
        blending={THREE.AdditiveBlending}
      />
    </instancedMesh>
  );
}

type ViewerProps = {
  planet: PlanetData;
  stars: Star[];

  // Time from the time the user stops interacting with the viewer until
  // the auto-rotation starts again (in seconds).
  rotateAgainTime?: number;
};

const DEFAULT_ROTATE_AGAIN_TIME = 5;

type ViewerState = {
  hovered: number | null;
  rotate: boolean;
  rotateAgainTimeoutId: number | null;
};
export default class Viewer extends React.Component<ViewerProps, ViewerState> {
  constructor(props: ViewerProps) {
    super(props);

    this.state = {
      hovered: null,
      rotate: true,
      rotateAgainTimeoutId: null,
    };
  }

  onUserInteract = () => {
    if (this.state.rotateAgainTimeoutId != null) {
      clearTimeout(this.state.rotateAgainTimeoutId);
    }
    this.setState({ rotate: false, rotateAgainTimeoutId: null });
  };
  onUserInteractEnd = () => {
    const timeout = setTimeout(() => {
      this.setState({ rotate: true });
    }, this.props.rotateAgainTime ?? DEFAULT_ROTATE_AGAIN_TIME * 1000);
    this.setState({
      rotateAgainTimeoutId: timeout,
    });
  };

  render() {
    return (
      <>
        <Affix position={{ top: 20, right: 20 }}>
          <Group align="center" justify="center">
            <Text color="white">
              {this.props.stars.length} stars (max lum{" "}
              {Math.max(...this.props.stars.map((s) => s.lum))})
            </Text>
            {
              // ISSUE: If the user clicks the pause button, then moves the (camera, after)
              // some time, the camera will start rotating again.
            }
            <ActionIcon
              color="blue"
              radius="xl"
              onClick={() => {
                if (this.state.rotateAgainTimeoutId != null) {
                  clearTimeout(this.state.rotateAgainTimeoutId);
                }
                this.setState({
                  rotate: !this.state.rotate,
                  rotateAgainTimeoutId: null,
                });
              }}>
              {this.state.rotate ? (
                <IconPlayerPause size={16} />
              ) : (
                <IconPlayerPlay size={16} />
              )}
            </ActionIcon>
            <PlanetInfo planet={this.props.planet} />
          </Group>
        </Affix>
        <Canvas>
          <color attach="background" args={["#000000"]} />
          <OrbitControls
            enableDamping
            onStart={this.onUserInteract}
            onEnd={this.onUserInteractEnd}
            reverseOrbit
            enableRotate
            autoRotate={this.state.rotate}
            maxDistance={0.001}
            enableZoom={false} // disable zoom (scroll)
          />
          <Dots
            stars={this.props.stars}
            onHover={(id) => this.setState({ hovered: id })}
            onLeave={() => this.setState({ hovered: null })}
          />
          <Stats />
          <Planet />
        </Canvas>
      </>
    );
  }
}
