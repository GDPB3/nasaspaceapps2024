import "@mantine/core/styles.css";
import React from "react";
import { PlanetData } from "../types";

type ViewerProps = {
  planet: PlanetData;
};

type ViewerState = object;

export default class Viewer extends React.Component<ViewerProps, ViewerState> {
  constructor(props: ViewerProps) {
    super(props);

    this.state = {};
  }

  render() {
    return <>{this.props.planet.pl_name}</>;
  }
}
