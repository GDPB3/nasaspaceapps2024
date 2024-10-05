import React from "react";
import { Text, Group, HoverCard, ThemeIcon, Flex } from "@mantine/core";
import { IconInfoSmall } from "@tabler/icons-react";
import { PlanetData } from "../types";

type PlanetCardProps = {
  planet: PlanetData;
};

const handle_number = (num: number): string =>
  num === -1 ? "unknown" : num.toString();

export default class PlanetCard extends React.Component<
  PlanetCardProps,
  object
> {
  constructor(props: PlanetCardProps) {
    super(props);
  }

  render() {
    return (
      <Group justify="center">
        <HoverCard
          width={320}
          shadow="md"
          withArrow
          openDelay={200}
          closeDelay={400}>
          <HoverCard.Target>
            <ThemeIcon radius="xl" color="blue">
              <IconInfoSmall />
            </ThemeIcon>
          </HoverCard.Target>
          <HoverCard.Dropdown>
            <Text size="sm" style={{ lineHeight: 1 }}>
              Planet{" "}
              <Text fw={700} span>
                {this.props.planet.pl_name}
              </Text>
            </Text>

            <Text size="sm" mt="sm">
              It was first discovered in <b>{this.props.planet.disc_year}</b> at{" "}
              <b>{this.props.planet.disc_facility}</b>
            </Text>

            <Flex mt="md" justify="space-between">
              <Text size="sm" ta="center">
                <b>{handle_number(this.props.planet.st_rotp)}</b> rotation
              </Text>
              <Text size="sm" ta="center">
                <b>{handle_number(this.props.planet.pl_orbper)}</b> orbit
              </Text>
            </Flex>
            <Flex mt="md" justify="space-between">
              <Text size="sm" ta="center">
                <b>{handle_number(this.props.planet.pl_rade)}</b> radius
              </Text>
              <Text size="sm" ta="center">
                <b>{handle_number(this.props.planet.pl_masse)}</b> mass
              </Text>
              <Text size="sm" ta="center">
                <b>{handle_number(this.props.planet.sy_mnum)}</b> moons
              </Text>
            </Flex>
          </HoverCard.Dropdown>
        </HoverCard>
      </Group>
    );
  }
}
