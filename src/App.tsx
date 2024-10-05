import "./App.css";
import "@mantine/core/styles.css";
import { MantineProvider } from "@mantine/core";
import React from "react";
import { PlanetData } from "./types";
import Selector from "./pages/Selector";
import Viewer from "./pages/Viewer";

type AppState = {
  planet: string | null;
};

export default class App extends React.Component<object, AppState> {
  constructor(props: object) {
    super(props);

    this.state = {
      planet: null,
      // planet: {
      //   pl_name: "Earth",
      //   hostname: "Sun",
      //   ra: 0,
      //   dec: 0,
      //   sy_dist: 0,
      // },
    };
  }

  handleSearchSubmit = (planet: string) => {
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
