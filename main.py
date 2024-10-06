from fastapi import FastAPI
from models import PlanetData, StarData
from fastapi.middleware.cors import CORSMiddleware
import pickle
from utils import get_stars_from_planet_coords

planets_list : list[PlanetData] = pickle.load(open("planets.p", "rb"))
print(f"Loaded {len(planets_list)} planets from planets.p")

app = FastAPI()

origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/planets", response_model=list[PlanetData])
async def planets(query:str="", count:int=len(planets_list)):
    if query == "":
        return planets_list[:count]
    else:
        return [planet for planet in planets_list if query.lower() in planet.pl_name.lower()][:count]

@app.get("/planets/names", response_model=list[str])
async def planet_names(query:str="", count:int=len(planets_list)):
    if query == "":
        return [planet.pl_name for planet in planets_list][:count]
    else:
        return [planet.pl_name for planet in planets_list if query.lower() in planet.pl_name.lower()][:count]


star_cache_size = 5
stars_cache : list[tuple[tuple[str, int], list[StarData]]] = []

@app.get("/planets/{planet}/stars", response_model=list[StarData])
async def get_stars_from_planet(planet:str, limit:int = -1) -> list[StarData]:
    planets = [planet_o for planet_o in planets_list if planet.lower() == planet_o.pl_name.lower()]
    if len(planets) != 1: return []

    # Check for cache
    for (entry_name, entry_limit), entry_data in stars_cache:
        if (entry_name == planet and ((limit != -1 and limit <= entry_limit) or entry_limit == -1)):
            return entry_data

    results = await get_stars_from_planet_coords(planets[0], row_limit=limit) 

    # Save in cache
    if len(stars_cache) == star_cache_size:
        stars_cache.pop(0)

    stars_cache.append(((planet, limit), results))

    return results

@app.get("/pablo", response_model=PlanetData) 
async def pablo():
    return PlanetData(
        pl_name="WASP-74 b",
        hostname="WASP-74",
        ra=304.538843,
        dec = -1.0760033,
        sy_dist = 149.216,
        sy_mnum = 0,
        disc_year = 2015,
        disc_facility = "SuperWASP",
        pl_orbper = 2.13775,
        st_rotp = -1,
        pl_rade = 17.486,
        pl_masse = 301.9385
    )