import React from "react";
import { Text, Group, HoverCard, ThemeIcon, Flex } from "@mantine/core";
import { IconInfoSmall } from "@tabler/icons-react";
import { PlanetData } from "../types";

type PlanetCardProps = {
  planet: PlanetData;
};

const handle_number = (num: number): string => {
  if (num < 0) return "unknown";

  if (Number.isInteger(num)) return num.toString();

  return num.toFixed(2);
};

function InfoElement(props: {
  value: string;
  value_long: string;
  unit: string;
  unit_long: string;
}) {
  return (
    <>
      <HoverCard shadow="md" openDelay={0}>
        <HoverCard.Target>
          <u>
            <b>{props.value}</b>
          </u>
        </HoverCard.Target>
        <HoverCard.Dropdown>
          <Text size="sm">{props.value_long}</Text>
        </HoverCard.Dropdown>
      </HoverCard>{" "}
      <HoverCard shadow="md" openDelay={0}>
        <HoverCard.Target>
          <u>{props.unit}</u>
        </HoverCard.Target>
        <HoverCard.Dropdown>
          <Text size="sm">{props.unit_long}</Text>
        </HoverCard.Dropdown>
      </HoverCard>
    </>
  );
}

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
                <InfoElement
                  value={handle_number(this.props.planet.st_rotp)}
                  value_long={`That translates to ${handle_number(
                    this.props.planet.st_rotp * 24
                  )} hours`}
                  unit="d."
                  unit_long="earth days"
                />{" "}
                rotation
              </Text>
              <Text size="sm" ta="center">
                <InfoElement
                  value={handle_number(this.props.planet.pl_orbper)}
                  value_long={`That translates to ${handle_number(
                    this.props.planet.pl_orbper * 24
                  )} hours`}
                  unit="d."
                  unit_long="earth days"
                />{" "}
                orbit
              </Text>
            </Flex>
            <Flex mt="md" justify="space-between">
              <Text size="sm" ta="center">
                <InfoElement
                  value={handle_number(this.props.planet.pl_rade)}
                  value_long={`That translates to ${handle_number(
                    this.props.planet.pl_rade * 6371
                  )} km`}
                  unit="e.r."
                  unit_long="earth radii"
                />{" "}
                radius
              </Text>
              <Text size="sm" ta="center">
                <InfoElement
                  value={handle_number(this.props.planet.pl_masse)}
                  value_long={`That translates to ${handle_number(
                    this.props.planet.pl_masse * 5.972
                  )} × 10²⁴ kg`}
                  unit="e.m."
                  unit_long="earth masses"
                />{" "}
                mass
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
