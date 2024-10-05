export type PlanetData = {
  pl_name: string;
  hostname: string;
  ra: number;
  dec: number;
  sy_dist: number;
  sy_mnum: number;
  disc_year: number;
  disc_facility: string;
  pl_orbper: number;
  st_rotp: number;
  pl_rade: number;
  pl_masse: number;
};

export type Star = {
  pos: number[];
  lum: number;
};
