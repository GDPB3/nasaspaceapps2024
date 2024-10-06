import "@mantine/core/styles.css";
import React from "react";
import { PlanetData, Star } from "../types";
import { Affix, Text, ActionIcon, Group, Space, rem } from "@mantine/core";
import PlanetInfo from "../components/PlanetInfo";
import {
  IconArrowLeft,
  IconCamera,
  IconCrop11,
  IconGrid4x4,
  IconPlayerPause,
  IconPlayerPlay,
  IconWorld,
  IconWorldUpload,
} from "@tabler/icons-react";
import Planetarium from "../components/Planetarium";
import { API_URL } from "../consts";

type ViewerProps = {
  planet: PlanetData;
  stars: Star[];

  // Time from the time the user stops interacting with the viewer until
  // the auto-rotation starts again (in seconds).
  rotateAgainTime?: number;

  notify(
    title: string,
    message: string,
    icon: React.ReactNode,
    time: number,
    color: string
  ): void;

  goBack(): void;
};

const DEFAULT_ROTATE_AGAIN_TIME = 3;

enum RotationPauseReason {
  USER_INTERACTION,
  BUTTON,
}

type ViewerState = {
  hovered: number | null;

  // Rotation control
  rotate: boolean;
  rotateAgainTimeoutId: NodeJS.Timeout | null;
  pauseReason: RotationPauseReason | null;

  // Control whether the camera is outside the planet (false) or on the ground (true)
  isOnGround: boolean;

  // Show the plane that represents the ground
  showPlane: boolean;

  isMakingPhoto: boolean;
};
export default class Viewer extends React.Component<ViewerProps, ViewerState> {
  child: Planetarium | null = null;

  constructor(props: ViewerProps) {
    super(props);

    this.state = {
      hovered: null,

      // Rotation control
      rotate: false,
      rotateAgainTimeoutId: null,
      pauseReason: null,

      isOnGround: true,

      showPlane: true,
      isMakingPhoto: false,
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
            pauseReason: null,
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

  onClickMakePhoto = () => {
    console.log("Make photo");
    const vecs = this.child?.getCameraVecs();
    if (vecs == null) return;

    this.setState({
      isMakingPhoto: true,
    });
    this.props.notify(
      "Creating photo",
      "Please wait!",
      <IconCamera size={16} />,
      10,
      "blue"
    );

    fetch(`${API_URL}/planets/chart`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        pl_name: this.props.planet.pl_name,
        quaternion: vecs.quaternion,
        chart_size: 80,
      }),
    })
      .then((res) => res.blob())
      .then((blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.style.display = "none";
        a.href = url;
        a.download = `My ${this.props.planet.pl_name} chart.png`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);

        this.props.notify(
          "Success",
          "Photo saved to your downloads",
          <IconCamera size={16} />,
          5,
          "blue"
        );
        this.setState({
          isMakingPhoto: false,
        });
      })
      .catch((error) => {
        console.error("Error making photo: ", error);
        this.props.notify(
          "Error",
          "Error making photo",
          <IconCamera size={16} />,
          5,
          "red"
        );

        this.setState({
          isMakingPhoto: false,
        });
      });
  };

  render() {
    return (
      <>
        <Affix position={{ top: 20, right: 20 }}>
          <Group align="center" justify="right" ml="auto">
            <ActionIcon
              color="blue"
              radius="xl"
              onClick={() =>
                this.setState({ isOnGround: !this.state.isOnGround })
              }>
              {this.state.isOnGround ? (
                <IconWorld size={16} />
              ) : (
                <IconWorldUpload size={16} />
              )}
            </ActionIcon>
            <ActionIcon
              color="blue"
              radius="xl"
              onClick={() =>
                this.setState({ showPlane: !this.state.showPlane })
              }>
              {this.state.showPlane ? (
                <IconGrid4x4 size={16} />
              ) : (
                <IconCrop11 size={16} />
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
          <Group mt="xs" align="center" justify="right" ml="auto">
            {this.state.isOnGround && (
              <ActionIcon
                color="blue"
                radius="xl"
                disabled={this.state.isMakingPhoto}
                onClick={this.onClickMakePhoto}>
                <IconCamera size={16} />
              </ActionIcon>
            )}
            <Space w={rem("28px")} /> {/* 28px is the width of the icon md */}
            <Space w={rem("28px")} />
            <Space w={rem("28px")} />
          </Group>
        </Affix>
        <Affix position={{ top: 20, left: 20 }}>
          <ActionIcon color="blue" radius="xl" onClick={this.props.goBack}>
            <IconArrowLeft size={16} />
          </ActionIcon>
        </Affix>
        <Planetarium
          ref={(instance) => {
            this.child = instance;
          }}
          stars={this.props.stars}
          autoRotate={this.state.rotate}
          onUserInteract={this.onUserInteract}
          onUserInteractEnd={this.onUserInteractEnd}
          onPressSpace={this.onClickPlayPause}
          isOnGround={this.state.isOnGround}
          showPlane={this.state.showPlane}
        />
      </>
    );
  }
}
