import "./App.css";
import "@mantine/core/styles.css";
import { MantineProvider, Notification, Affix } from "@mantine/core";
import React from "react";
import { PlanetData, Star } from "./types";
import Selector from "./pages/Selector";
import Viewer from "./pages/Viewer";
import LoadingScreen from "./pages/LoadingScreen";
import { API_URL } from "./consts";
import {
  Icon3dCubeSphere,
  IconAlertSmall,
  IconAlertTriangle,
  IconAlertTriangleFilled,
} from "@tabler/icons-react";

type Notification = {
  title: string;
  message: string;
  icon: React.ReactNode;
  exit_time: number;
  color: string;
};

type AppState = {
  planet: PlanetData | null;
  stars: Star[] | null;
  notifications: Notification[];
  intervalId: number | null;
  timer: number;
};

export default class App extends React.Component<object, AppState> {
  constructor(props: object) {
    super(props);

    this.state = {
      planet: null,
      stars: null,
      notifications: [],
      intervalId: null,
      timer: 0,
    };

    setTimeout(() => {
      this.addNotification(
        "Welcome to the Universe!",
        "Select a planet to view its stars.",
        <Icon3dCubeSphere />,
        10,
        "blue"
      );
    }, 1000);
  }

  addNotification = (
    title: string,
    message: string,
    icon: React.ReactNode,
    time: number,
    color: string
  ) => {
    this.setState((prev_state) => ({
      notifications: [
        {
          title: title,
          message: message,
          icon: icon,
          exit_time: prev_state.timer + time,
          color: color,
        },
        ...prev_state.notifications,
      ],
    }));
  };

  handleSearchSubmit = (planet: PlanetData) => {
    this.setState({
      planet: planet,
    });

    fetch(`${API_URL}/planets/${planet.pl_name}/stars`)
      .then((res) => res.json())
      .then((data) => {
        this.setState({
          stars: data,
        });
      })
      .catch((error) => {
        console.error("Error fetching stars: ", error);
        this.setState({
          planet: null,
        });
        this.addNotification(
          "Oops!",
          "Something went wrong.",
          <IconAlertSmall />,
          5,
          "red"
        );
      });
  };

  componentDidMount() {
    const intervalId = setInterval(() => {
      this.setState({
        timer: this.state.timer + 1,
      });
    }, 1000);
    this.setState({
      intervalId: intervalId,
    });
  }

  componentWillUnmount(): void {
    if (this.state.intervalId != null) clearInterval(this.state.intervalId);
  }

  onViewerClickBack = () => {
    this.setState({
      planet: null,
      stars: null,
    });
  };

  render() {
    return (
      <MantineProvider defaultColorScheme="dark">
        {this.state.planet == null ? (
          <Selector
            onSubmit={this.handleSearchSubmit}
            notify={this.addNotification}
          />
        ) : this.state.stars == null ? (
          <LoadingScreen />
        ) : (
          <Viewer
            planet={this.state.planet}
            stars={this.state.stars}
            notify={this.addNotification}
            goBack={this.onViewerClickBack}
          />
        )}
        <Affix position={{ bottom: 20, right: 20 }}>
          {this.state.notifications.reverse().map(
            (not, i) =>
              not.exit_time >= this.state.timer && (
                <Notification
                  key={i}
                  mt="md"
                  color={not.color}
                  title={not.title}
                  icon={not.icon}
                  withCloseButton={false}>
                  {not.message}
                </Notification>
              )
          )}
        </Affix>
      </MantineProvider>
    );
  }
}
