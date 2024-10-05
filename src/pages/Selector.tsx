import "@mantine/core/styles.css";
import { Center, Container, Title } from "@mantine/core";
import Search from "../components/Search";
import React from "react";
import { PlanetData } from "../types";

type SelectorProps = {
  onSubmit: (planet: PlanetData) => void;
};

export default class Selector extends React.Component<SelectorProps, object> {
  constructor(props: SelectorProps) {
    super(props);
  }

  render() {
    return (
      <Center h="100%">
        <Container w="50%">
          <Title ta="center" size="lg">
            Select a planet!
          </Title>
          <Container mt="sm">
            <Search onSubmit={this.props.onSubmit} />
          </Container>
        </Container>
      </Center>
    );
  }
}
