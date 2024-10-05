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
  results: Array<PlanetData>;
};

export default class Search extends React.Component<SearchProps, SearchState> {
  constructor(props: SearchProps) {
    super(props);
    this.state = {
      search: "",
      results: ["Earth", "Mars", "Venus", "Jupiter", "Saturn"].map(
        (planet) => ({
          pl_name: planet,
          hostname: "Sun",
          ra: 0,
          dec: 0,
          sy_dist: 0,
        })
      ),
    };

    // fetch(`${API_URL}/planets`)
    //   .then((res) => res.json())
    //   .then((data) => {
    //     this.setState({
    //       results: data,
    //     });
    //   });
  }

  handleChange = (value: string) => {
    this.setState({
      search: value,
    });
  };

  handleSubmit = (value: string) => {
    const result = this.state.results.find((p) => p.pl_name === value);
    console.log("Submitted ", result);
    if (result == null) {
      console.error(
        "No planet found with name " +
          value +
          "(this is very bad, because we created the list)"
      );
    }
    this.props.onSubmit(result!);
  };

  render() {
    return (
      <Autocomplete
        data={this.state.results.map((p) => p.pl_name)}
        value={this.state.search}
        onChange={this.handleChange}
        onOptionSubmit={this.handleSubmit}
        selectFirstOptionOnChange={true}
        rightSection={<IconUfo />}
      />
    );
  }
}
