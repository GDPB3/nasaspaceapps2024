from pydantic import BaseModel

class StarData(BaseModel):
  # Units for pos, and radius are two are Parsecs * scale_factor
  pos: list[float]
  radius: float

  lum: float
  temperature: float  # ???
  mass: float         # ???
  age: float          # ???
  wavelength: float

class ChartData(BaseModel):
  pl_name: str
  quaternion: tuple[float, float, float, float] 
  chart_size: int

class PlanetData(BaseModel):
  pl_name: str
  hostname: str
  ra: float
  dec: float
  sy_dist: float 
  sy_mnum: int
  disc_year: int
  disc_facility: str
  pl_orbper: float
  st_rotp: float
  pl_rade: float
  pl_masse: float