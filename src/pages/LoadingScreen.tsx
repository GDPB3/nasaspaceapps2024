import "@mantine/core/styles.css";
import { Center, Loader } from "@mantine/core";
import React from "react";

export default class Selector extends React.Component<object, object> {
  constructor(props: object) {
    super(props);
  }

  render() {
    return (
      <Center h="100%">
        <Loader />
      </Center>
    );
  }
}
