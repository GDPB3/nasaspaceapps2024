import "@mantine/core/styles.css";
import React, { useMemo } from "react";
import { Star } from "../types";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { colorTemperature2rgb, wavelength2rgb } from "../tools";
import { fragmentShader, vertexShader } from "./StarMaterial";

const STAR_SIZE = 50_000_000;

function Planet() {
  return (
    <mesh>
      <sphereGeometry args={[0.05, 30, 30]} />
      <meshBasicMaterial
        color="gray"
        transparent={false}
        depthTest={true}
        // depthWrite={false}
      />
    </mesh>
  );
}

type DotsProps = {
  stars: Star[];
  onHover?: (id: number) => void;
  onLeave?: () => void;
};

const calcStarColor = (star: Star): [number, number, number] => {
  let rgb = { r: 0, g: 0, b: 0 };
  if (star.wavelength != -1) {
    rgb = wavelength2rgb(star.wavelength); // rgb in [0,255]
  } else if (star.temperature != -1) {
    rgb = colorTemperature2rgb(star.temperature); // rgb in [0,255]
  } else {
    rgb = { r: 255, g: 255, b: 255 };
  }
  return Object.values(rgb).map((x) => x * 255) as [number, number, number];
};

function getInfo(stars: Star[]) {
  const _verts = [];
  const _colors = [];
  const _sizes = [];
  for (const star of stars) {
    _verts.push(...star.pos);
    _colors.push(...calcStarColor(star));
    _sizes.push(star.radius * (Math.log10(star.lum + 1) / 3 + 1) * STAR_SIZE);
  }
  const vertices = new Float32Array(_verts);
  const colors = new Float32Array(_colors);
  const sizes = new Float32Array(_sizes);

  return { vertices, colors, sizes };
}

function create_star_texture(): THREE.Texture {
  const canvas = document.createElement("canvas");
  canvas.width = 128;
  canvas.height = 128;
  const context = canvas.getContext("2d")!;
  context.globalAlpha = 0.3;
  context.filter = "blur(16px)";
  context.fillStyle = "white";
  context.beginPath();
  context.arc(64, 64, 40, 0, 2 * Math.PI);
  context.fill();
  context.globalAlpha = 1;
  context.filter = "blur(7px)";
  context.fillStyle = "white";
  context.beginPath();
  context.arc(64, 64, 16, 0, 2 * Math.PI);
  context.fill();

  return new THREE.CanvasTexture(canvas);
}

const starTexture = create_star_texture();

// extend({ StarMaterial });

function Dots(props: DotsProps) {
  const { vertices, colors, sizes } = useMemo(
    () => getInfo(props.stars),
    [props.stars]
  );

  return (
    <points>
      <bufferGeometry
        attach="geometry"
        drawRange={{ start: 0, count: props.stars.length }}>
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
  onPressSpace?: () => void;

  isOnGround: boolean;

  showPlane: boolean;
};

type PlanetariumState = object;

const plane_size = 1000;
function MyGridHelper(props: { show: boolean; isOnGround: boolean }) {
  // // The ?? is in case the camera is not yet initialized don't divide by 0
  const ref = React.useRef<THREE.GridHelper>(null);
  // const position = useThree((state) => state.camera.position);

  // const pos_len = position != null ? Math.sqrt(position.length()) + 1 : 1;

  // console.log(pos_len);

  if (props.show) {
    return (
      <gridHelper
        ref={ref}
        args={[plane_size, plane_size / 2]}
        position={[0, props.isOnGround ? -1 : 0, 0]}
        // rotation={[0, 1, 0]}
      />
    );
  } else {
    return <></>;
  }
}

type CameraVectors = {
  quaternion: [number, number, number, number];
  distance: [number, number, number];
};

function CameraPositionGetter(props: {
  onCameraVecsUpdate: (vecs: CameraVectors) => void;
}) {
  const { camera } = useThree();

  useFrame(() => {
    // NOTE: Hopefully this is not too expensive (and gets garbage collected)
    const quaternion = new THREE.Quaternion(0, 0, 0, 0);
    camera.getWorldQuaternion(quaternion);
    props.onCameraVecsUpdate({
      quaternion: quaternion.toArray(),
      distance: camera.position.toArray(),
    });
  });

  return <></>;
}

const BACKGROUND_COLOUR = "#050505";

export default class Planetarium extends React.Component<
  PlanetariumProps,
  PlanetariumState
> {
  camera_vecs: CameraVectors | null = null;
  constructor(props: PlanetariumProps) {
    super(props);

    this.state = {};
  }

  getCameraVecs = (): CameraVectors | null => this.camera_vecs;

  handleKeyDown = (e: React.KeyboardEvent) => {
    console.log(e);
    if (e.key === " ") {
      this.props.onPressSpace?.();
    }
  };

  render() {
    return (
      <Canvas
        raycaster={{
          params: {
            Points: { threshold: 100 },
            Mesh: {},
            Line: { threshold: 1 },
            LOD: {},
            Sprite: {},
          },
        }}
        camera={{ far: 100_000_000 }}
        onKeyDown={this.handleKeyDown}>
        <color attach="background" args={[BACKGROUND_COLOUR]} />
        <Planet />
        <OrbitControls
          enableDamping
          // onPointerDown={this.props.onUserInteract}
          // onPointerUp={this.props.onUserInteractEnd}
          onStart={this.props.onUserInteract}
          onEnd={this.props.onUserInteractEnd}
          reverseOrbit
          enableRotate
          enablePan={false}
          autoRotate={this.props.autoRotate}
          minDistance={this.props.isOnGround ? 0 : 0.5}
          maxDistance={this.props.isOnGround ? 0.001 : Infinity}
          // disable zoom (scroll) when on the ground
          enableZoom={!this.props.isOnGround}
        />
        <Dots
          stars={this.props.stars}
          // onHover={(id) => this.setState({ hovered: id })}
          // onLeave={() => this.setState({ hovered: null })}
        />
        <fog attach="fog" args={[BACKGROUND_COLOUR, 0, 100]} />
        <MyGridHelper
          show={this.props.showPlane}
          isOnGround={this.props.isOnGround}
        />
        <CameraPositionGetter
          onCameraVecsUpdate={(vecs) => (this.camera_vecs = vecs)}
        />
        {/* <Stats /> */}
      </Canvas>
    );
  }
}
