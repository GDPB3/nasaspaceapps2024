import React from "react";
import { Autocomplete } from "@mantine/core";
import { IconUfo } from "@tabler/icons-react";
import { API_URL } from "../consts";
import type { PlanetData } from "../types";

type SearchProps = {
  onSubmit: (planet: string) => void;
};
type SearchState = {
  search: string;
  results: Array<string>;
  first_100: Array<string>;
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
    fetch(`${API_URL}/planets/names?count=100`)
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

    fetch(`${API_URL}/planets/names?query=${value}&count=100`)
      .then((res) => res.json())
      .then((data) => {
        this.setState({
          results: data,
        });
      });
  };

  handleSubmit = (value: string) => {
    console.log("Submitted ", value);
    this.props.onSubmit(value);
  };

  render() {
    return (
      <Autocomplete
        data={this.state.results}
        value={this.state.search}
        onChange={this.handleChange}
        onOptionSubmit={this.handleSubmit}
        selectFirstOptionOnChange={true}
        rightSection={<IconUfo />}
      />
    );
  }
}
