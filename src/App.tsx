import "./App.css";
import "@mantine/core/styles.css";
import {
  MantineProvider,
  Card,
  Image,
  Text,
  Center,
  Container,
  Title,
} from "@mantine/core";
import Search from "./components/Search";
import React from "react";
import { PlanetData } from "./types";
import Selector from "./pages/Selector";
import Viewer from "./pages/Viewer";

type AppState = {
  planet: PlanetData | null;
};

export default class App extends React.Component<object, AppState> {
  constructor(props: object) {
    super(props);

    this.state = {
      planet: null,
    };
  }

  handleSearchSubmit = (planet: PlanetData) => {
    this.setState({
      planet: planet,
    });
  };

  render() {
    return (
      <MantineProvider>
        {this.state.planet == null ? (
          <Selector onSubmit={this.handleSearchSubmit} />
        ) : (
          <Viewer planet={this.state.planet} />
        )}
      </MantineProvider>
    );
  }
}
