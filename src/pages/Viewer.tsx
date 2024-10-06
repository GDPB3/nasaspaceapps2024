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
import PlanetInfo from "../components/PlanetInfo";
import {
  IconAccessible,
  IconAccessibleOff,
  IconAlien,
  IconPlayerPause,
  IconPlayerPlay,
} from "@tabler/icons-react";
import { clamp, hsv2rgb, rgb2hsv, wavelength2rgb } from "../tools";
import { fragmentShader, vertexShader } from "../components/StarMaterial";
import { color } from "three/webgpu";
import Planetarium from "../components/Planetarium";

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
  onHover: (id: number) => void;
  onLeave: () => void;
};

type ViewerProps = {
  planet: PlanetData;
  stars: Star[];

  // Time from the time the user stops interacting with the viewer until
  // the auto-rotation starts again (in seconds).
  rotateAgainTime?: number;
};

const DEFAULT_ROTATE_AGAIN_TIME = 1;

enum RotationPauseReason {
  USER_INTERACTION,
  BUTTON,
}

type ViewerState = {
  hovered: number | null;
  rotate: boolean;
  rotateAgainTimeoutId: number | null;
  pauseReason: RotationPauseReason | null;
};
export default class Viewer extends React.Component<ViewerProps, ViewerState> {
  constructor(props: ViewerProps) {
    super(props);

    this.state = {
      hovered: null,

      // Rotation control
      rotate: true,
      rotateAgainTimeoutId: null,
      pauseReason: null,
    };
  }

  // Rotation control
  onUserInteract = () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const new_state: any = {}; // i want to add parameters after the fact!!
    if (this.state.rotateAgainTimeoutId != null) {
      clearTimeout(this.state.rotateAgainTimeoutId);
      new_state.rotateAgainTimeoutId = null;
    }
    if (this.state.pauseReason !== RotationPauseReason.BUTTON) {
      new_state.pauseReason = RotationPauseReason.USER_INTERACTION;
      new_state.rotate = false;
    }

    this.setState(new_state);
  };
  onUserInteractEnd = () => {
    if (this.state.pauseReason === RotationPauseReason.USER_INTERACTION) {
      this.setState({
        rotateAgainTimeoutId: setTimeout(() => {
          this.setState({
            rotate: true,
            rotateAgainTimeoutId: null,
            pauseReason: RotationPauseReason.BUTTON,
          });
        }, this.props.rotateAgainTime ?? DEFAULT_ROTATE_AGAIN_TIME * 1000),
      });
    }
  };
  onClickPlayPause = () => {
    if (this.state.rotateAgainTimeoutId != null) {
      clearTimeout(this.state.rotateAgainTimeoutId);
    }
    this.setState({
      rotate: !this.state.rotate,
      rotateAgainTimeoutId: null,
      // Set the pause reason to button if stopping rotation (if we're currently rotating),
      // otherwise, it's null
      pauseReason: this.state.rotate ? RotationPauseReason.BUTTON : null,
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
              onClick={this.onClickPlayPause}>
              {this.state.rotate ? (
                <IconPlayerPause size={16} />
              ) : (
                <IconPlayerPlay size={16} />
              )}
            </ActionIcon>
            <ActionIcon
              color="blue"
              radius="xl"
              onClick={this.onClickPlayPause}>
              {this.state.rotate ? (
                <IconPlayerPause size={16} />
              ) : (
                <IconPlayerPlay size={16} />
              )}
            </ActionIcon>
            <PlanetInfo planet={this.props.planet} />
          </Group>
        </Affix>
        <Planetarium
          stars={this.props.stars}
          autoRotate={this.state.rotate}
          onUserInteract={this.onUserInteract}
          onUserInteractEnd={this.onUserInteractEnd}
        />
      </>
    );
  }
}
