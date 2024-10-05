import React from "react";
import { Autocomplete } from "@mantine/core";
import { IconUfo } from "@tabler/icons-react";
import { API_URL } from "../consts";
import type { PlanetData } from "../types";

type SearchProps = {
  onSubmit: (planet: PlanetData) => void;
};
type SearchState = {
  search: string;
  results: PlanetData[];
  first_100: PlanetData[];
};

export default class Search extends React.Component<SearchProps, SearchState> {
  constructor(props: SearchProps) {
    super(props);
    this.state = {
      search: "",
      results: [],
      first_100: [],
    };
  }

  componentDidMount(): void {
    fetch(`${API_URL}/planets?count=100`)
      .then((res) => res.json())
      .then((data) => {
        this.setState({
          results: data,
          first_100: data,
        });
      });
  }

  handleChange = (value: string) => {
    this.setState({
      search: value,
    });
    if (value.length < 3) {
      this.setState({
        results: this.state.first_100,
      });
      return;
    }

    fetch(`${API_URL}/planets?query=${value}&count=100`)
      .then((res) => res.json())
      .then((data) => {
        this.setState({
          results: data,
        });
      });
  };

  handleSubmit = (value: string) => {
    console.log("Submitted ", value);
    // This should never fail because the value is chosen form the list!
    const planet = this.state.results.find((p) => p.pl_name === value);
    if (planet === undefined) {
      console.error("Planet not found (this should not happen)");
      return;
    }
    this.props.onSubmit(planet!);
  };

  render() {
    return (
      <Autocomplete
        data={this.state.results.map((pl) => pl.pl_name)}
        value={this.state.search}
        onChange={this.handleChange}
        onOptionSubmit={this.handleSubmit}
        selectFirstOptionOnChange={true}
        rightSection={<IconUfo />}
      />
    );
  }
}
