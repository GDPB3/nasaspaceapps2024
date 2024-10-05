import React from "react";
import { Text } from "@mantine/core";

type PlanetCardProps = {
  planet: string;
};

export default class PlanetCard extends React.Component<
  PlanetCardProps,
  object
> {
  constructor(props: PlanetCardProps) {
    super(props);
  }

  render() {
    return <Text>{this.props.planet}</Text>;
  }
}
