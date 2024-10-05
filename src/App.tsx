import "./App.css";
import "@mantine/core/styles.css";
import { MantineProvider, Notification, Affix } from "@mantine/core";
import React from "react";
import { Star } from "./types";
import Selector from "./pages/Selector";
import Viewer from "./pages/Viewer";
import LoadingScreen from "./pages/LoadingScreen";
import { API_URL } from "./consts";
import {
  IconAlertSmall,
  IconAlertTriangle,
  IconAlertTriangleFilled,
} from "@tabler/icons-react";

type AppState = {
  planet: string | null;
  stars: Star[] | null;
  alertTimer: number; // the number of remaining seconds for the alert to be displayed
  intervalId: number | null;
};

export default class App extends React.Component<object, AppState> {
  constructor(props: object) {
    super(props);

    this.state = {
      planet: null,
      stars: null,
      alertTimer: 0,
      intervalId: null,
    };
  }

  handleSearchSubmit = (planet: string) => {
    this.setState({
      planet: planet,
    });

    fetch(`${API_URL}/planets/${planet}/stars?limit=10000&trunk_halfheight=50`)
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
          alertTimer: 5,
        });
      });
  };

  componentDidMount() {
    const intervalId = setInterval(() => {
      if (this.state.alertTimer > 0) {
        this.setState({
          alertTimer: this.state.alertTimer - 1,
        });
      }
    }, 1000);
    this.setState({
      intervalId: intervalId,
    });
  }

  componentWillUnmount(): void {
    if (this.state.intervalId != null) clearInterval(this.state.intervalId);
  }

  render() {
    return (
      <MantineProvider>
        {this.state.planet == null ? (
          <Selector onSubmit={this.handleSearchSubmit} />
        ) : this.state.stars == null ? (
          <LoadingScreen />
        ) : (
          <Viewer planet={this.state.planet} stars={this.state.stars} />
        )}
        {this.state.alertTimer > 0 && (
          <Affix position={{ bottom: 20, right: 20 }}>
            <Notification
              // variant="dark"
              // autoContrast
              color="red"
              title="Oops!"
              icon={<IconAlertSmall />}
              onClose={() => this.setState({ alertTimer: 0 })}>
              Something went wrong.
            </Notification>
          </Affix>
        )}
      </MantineProvider>
    );
  }
}
