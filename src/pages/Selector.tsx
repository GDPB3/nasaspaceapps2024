import "@mantine/core/styles.css";
import { Center, Container, Title, Image } from "@mantine/core";
import Search from "../components/Search";
import React from "react";
import { PlanetData } from "../types";

type SelectorProps = {
  onSubmit: (planet: PlanetData) => void;
  notify: (
    title: string,
    message: string,
    icon: React.ReactNode,
    time: number,
    color: string
  ) => void;
};

export default class Selector extends React.Component<SelectorProps, object> {
  constructor(props: SelectorProps) {
    super(props);
  }

  render() {
    return (
      <>
        <Center h="100%">
          <Container w="50%">
            <Image
              mr="auto"
              ml="auto"
              radius="md"
              maw="80%"
              h="20vh"
              src="https://images.unsplash.com/photo-1712510795940-92dc7211a383?q=80&w=2892&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
            />
            <Title ta="center" size="lg" mt="xl">
              Select a planet to view its stars! 🌟
            </Title>
            <Container mt="sm">
              <Search
                onSubmit={this.props.onSubmit}
                notify={this.props.notify}
              />
            </Container>
          </Container>
        </Center>
      </>
    );
  }
}
