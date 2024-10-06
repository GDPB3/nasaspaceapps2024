import "@mantine/core/styles.css";
import { Center, Container, Title, Image, Portal } from "@mantine/core";
import Search from "../components/Search";
import React from "react";
import { PlanetData } from "../types";
import { IconStar } from "@tabler/icons-react";

type SelectorProps = {
  onSubmit: (planet: PlanetData) => void;
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
              src="https://images.unsplash.com/photo-1706211306695-5b383f8012a9?q=80&w=2832&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
            />
            <Title ta="center" size="lg" mt="xl">
              Select a planet to view its stars! 🌟
            </Title>
            <Container mt="sm">
              <Search onSubmit={this.props.onSubmit} />
            </Container>
          </Container>
        </Center>
      </>
    );
  }
}
